# app/services/realtime_verification_service.py

import sys
from pathlib import Path
import google.generativeai as genai
import requests
import json

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.config import Config

class RealtimeVerificationService:
    def __init__(self):
        # Initialize Gemini
        genai.configure(api_key=Config.GEMINI_API_KEY)
        # Update your code to:
        self.gemini = genai.GenerativeModel('gemini-flash-latest')
        
        # API keys
        self.serper_key = Config.SERPER_API_KEY
        self.factcheck_key = Config.GOOGLE_FACTCHECK_API_KEY
    
    def verify_claim(self, text, content_type='text'):
        """Main verification method"""
        try:
            # Step 1: Extract claims
            claims = self._extract_claims(text)
            
            if not claims:
                return self._format_response(
                    verdict='UNVERIFIED',
                    score=50,
                    confidence=30,
                    reasoning='No verifiable claims found'
                )
            
            # Step 2: Verify each claim
            all_evidence = []
            for claim in claims:
                evidence = self._verify_single_claim(claim)
                all_evidence.append(evidence)
            
            # Step 3: Final analysis
            result = self._aggregate_results(text, all_evidence)
            
            return result
            
        except Exception as e:
            return {
                'error': str(e),
                'verdict': 'ERROR',
                'score': 0,
                'confidence': 0
            }
    
    def _extract_claims(self, text):
        """Extract verifiable claims"""
        prompt = f"""
        Extract verifiable claims from: "{text}"
        
        Return JSON array:
        [{{"claim": "...", "subject": "...", "type": "death/accident/event", "verifiable": true}}]
        
        If no claims, return: []
        """
        
        try:
            response = self.gemini.generate_content(
                prompt,
                generation_config={'temperature': 0.1}
            )
            
            result_text = response.text.strip()
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            claims = json.loads(result_text)
            return [c for c in claims if c.get('verifiable', False)]
            
        except Exception as e:
            print(f"Error extracting claims: {e}")
            return []
    
    def _verify_single_claim(self, claim):
        """Verify one claim using web search"""
        query = f"{claim['subject']} {claim.get('type', '')}"
        
        # Web search
        search_results = self._search_web(query)
        
        # Fact-check search
        factcheck_results = []
        if self.factcheck_key:
            factcheck_results = self._search_factcheckers(claim['claim'])
        
        # Analyze with Gemini
        verdict = self._analyze_evidence(claim, search_results, factcheck_results)
        
        return verdict
    
    def _search_web(self, query):
        """Search using Serper API"""
        url = "https://google.serper.dev/search"
        
        payload = json.dumps({
            "q": query,
            "num": 10
        })
        
        headers = {
            'X-API-KEY': self.serper_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, headers=headers, data=payload, timeout=5)
            data = response.json()
            
            results = []
            
            # Extract organic results
            if 'organic' in data:
                for item in data['organic'][:10]:
                    results.append({
                        'title': item.get('title', ''),
                        'snippet': item.get('snippet', ''),
                        'link': item.get('link', ''),
                        'source': item.get('link', '').split('/')[2] if '/' in item.get('link', '') else 'unknown'
                    })
            
            # Knowledge graph (Wikipedia, official data)
            if 'knowledgeGraph' in data:
                kg = data['knowledgeGraph']
                # Add knowledge graph result as a high-priority source if available
                results.insert(0, {
                    'title': f"Official: {kg.get('title', '')}",
                    'snippet': kg.get('description', ''),
                    'link': kg.get('website', ''),
                    'source': 'knowledge_graph'
                })
            
            return results
            
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    def _search_factcheckers(self, claim_text):
        """Search Google Fact Check API"""
        if not self.factcheck_key:
            return []
        
        url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
        
        params = {
            'query': claim_text[:200],
            'key': self.factcheck_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=5)
            data = response.json()
            
            results = []
            
            if 'claims' in data:
                for claim_item in data['claims'][:5]:
                    for review in claim_item.get('claimReview', []):
                        results.append({
                            'claim': claim_item.get('text', ''),
                            'rating': review.get('textualRating', ''),
                            'publisher': review.get('publisher', {}).get('name', ''),
                            'url': review.get('url', '')
                        })
            
            return results
            
        except Exception as e:
            print(f"Fact-check error: {e}")
            return []
    
    def _analyze_evidence(self, claim, search_results, factcheck_results):
        """Use Gemini to analyze all evidence"""
        
        prompt = f"""
        CLAIM: {claim['claim']}
        
        WEB SEARCH RESULTS:
        {json.dumps(search_results[:5], indent=2)}
        
        FACT-CHECKER RESULTS:
        {json.dumps(factcheck_results, indent=2)}
        
        Analyze:
        1. Is this found in credible sources (Reuters, BBC, AP, CNN)?
        2. Do fact-checkers confirm or deny?
        3. For recent events - is there news coverage?
        4. Any contradictions?
        
        Return ONLY valid JSON:
        {{
            "verdict": "TRUE/FALSE/UNCERTAIN",
            "confidence": 0-100,
            "reasoning": "2-3 sentences why",
            "credible_sources": ["list sources found"],
            "red_flags": ["issues found"]
        }}
        """
        
        try:
            response = self.gemini.generate_content(
                prompt,
                generation_config={'temperature': 0.1}
            )
            
            result_text = response.text.strip()
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            analysis = json.loads(result_text)
            
            return {
                'claim': claim['claim'],
                'verdict': analysis['verdict'],
                'confidence': analysis['confidence'],
                'reasoning': analysis['reasoning'],
                'sources': analysis.get('credible_sources', []),
                'red_flags': analysis.get('red_flags', [])
            }
            
        except Exception as e:
            print(f"Analysis error: {e}")
            return {
                'claim': claim['claim'],
                'verdict': 'ERROR',
                'confidence': 0,
                'reasoning': f'Analysis failed: {str(e)}',
                'sources': [],
                'red_flags': []
            }
    
    def _aggregate_results(self, original_text, all_evidence):
        """Combine all claim verifications"""
        
        if not all_evidence:
            return self._format_response('UNVERIFIED', 50, 30, 'No evidence found')
        
        # Count verdicts
        verdicts = [e['verdict'] for e in all_evidence]
        
        false_count = verdicts.count('FALSE')
        true_count = verdicts.count('TRUE')
        total = len(verdicts)
        
        # Calculate score
        if false_count > total * 0.5:
            verdict = 'LIKELY FALSE'
            score = 20
            color = 'red'
        elif true_count > total * 0.7:
            verdict = 'LIKELY TRUE'
            score = 85
            color = 'green'
        elif true_count > total * 0.5:
            verdict = 'MIXED'
            score = 60
            color = 'yellow'
        else:
            verdict = 'UNCERTAIN'
            score = 50
            color = 'orange'
        
        # Average confidence
        avg_confidence = sum(e['confidence'] for e in all_evidence) / total
        
        # Combine reasoning
        reasoning = " | ".join([e['reasoning'] for e in all_evidence[:3]])
        
        return self._format_response(
            verdict=verdict,
            score=score,
            confidence=avg_confidence,
            reasoning=reasoning,
            color=color,
            details=all_evidence
        )
    
    def _format_response(self, verdict, score, confidence, reasoning, color='gray', details=None):
        """Format final response"""
        return {
            'verdict': verdict,
            'credibility_score': score,
            'confidence': confidence,
            'color': color,
            'reasoning': reasoning,
            'details': details or [],
            'timestamp': json.dumps({'time': 'now'})
        }