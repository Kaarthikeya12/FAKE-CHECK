# app/services/factcheck_service.py

import google.generativeai as genai
import requests
import json
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re
import os

class FactCheckService:
    def __init__(self):
        # Initialize Gemini
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.gemini = genai.GenerativeModel('gemini-flash-latest')
        
        # Serper API for Google search
        self.serper_key = os.getenv('SERPER_API_KEY')
        
        # Credible sources database (still used as reference)
        self.credible_sources = {
            'reuters.com': 95,
            'apnews.com': 95,
            'bbc.com': 93,
            'cnn.com': 88,
            'nytimes.com': 90,
            'theguardian.com': 89,
            'washingtonpost.com': 88,
            'npr.org': 92,
            'pbs.org': 92,
            'forbes.com': 85,
            'bloomberg.com': 90,
            'wsj.com': 89,
            'nature.com': 98,
            'science.org': 98,
            'who.int': 97,
            'cdc.gov': 97,
            'wikipedia.org': 80
        }
        
        self.unreliable_sources = {
            'naturalnews.com': 10,
            'infowars.com': 5,
            'beforeitsnews.com': 15,
            'worldnewsdailyreport.com': 5,
            'nationalreport.net': 10
        }
    
    def verify_text(self, text):
        """Main verification method for text claims"""
        try:
            print(f"🔍 Verifying claim: {text[:100]}...")
            
            # Step 1: Search web for evidence
            search_results = self._search_web(text)
            
            # Step 2: Scrape top articles
            scraped_content = self._scrape_articles(search_results)
            
            # Step 3: Check source credibility (NOW WITH AI)
            source_scores = self._analyze_source_credibility(search_results)
            
            # Step 4: Gemini analysis
            verdict = self._gemini_verify(text, search_results, scraped_content, source_scores)
            
            return verdict
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {
                'verdict': 'ERROR',
                'credibility_score': 0,
                'confidence': 0,
                'reasoning': f'Verification failed: {str(e)}',
                'color': 'gray'
            }
    
    def verify_url(self, url):
        """Verify article from URL"""
        try:
            print(f"🔍 Verifying URL: {url}")
            
            # Step 1: Check domain credibility (NOW WITH AI)
            domain_score = self._check_domain(url)
            
            # Step 2: Scrape article content
            article_content = self._scrape_single_url(url)
            
            if not article_content:
                return {
                    'verdict': 'ERROR',
                    'credibility_score': 0,
                    'reasoning': 'Could not access article content',
                    'color': 'gray'
                }
            
            # Step 3: Search for same topic from other sources
            search_results = self._search_web(article_content['title'])
            
            # Step 4: Gemini analysis
            verdict = self._gemini_verify_url(url, article_content, search_results, domain_score)
            
            return verdict
            
        except Exception as e:
            return {
                'verdict': 'ERROR',
                'credibility_score': 0,
                'reasoning': f'URL verification failed: {str(e)}',
                'color': 'gray'
            }
    
    def _search_web(self, query):
        """Search using Serper API (Google Search)"""
        if not self.serper_key:
            print("⚠️ No Serper API key - using fallback")
            return []
        
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
            response = requests.post(url, headers=headers, data=payload, timeout=10)
            data = response.json()
            
            results = []
            
            # Knowledge Graph (Wikipedia, official data)
            if 'knowledgeGraph' in data:
                kg = data['knowledgeGraph']
                results.append({
                    'title': kg.get('title', ''),
                    'snippet': kg.get('description', ''),
                    'link': kg.get('website', ''),
                    'source': 'Knowledge Graph',
                    'type': 'official'
                })
            
            # Organic results
            if 'organic' in data:
                for item in data['organic'][:10]:
                    link = item.get('link', '')
                    domain = urlparse(link).netloc.replace('www.', '')
                    
                    results.append({
                        'title': item.get('title', ''),
                        'snippet': item.get('snippet', ''),
                        'link': link,
                        'source': domain,
                        'type': 'organic'
                    })
            
            print(f"✅ Found {len(results)} search results")
            return results
            
        except Exception as e:
            print(f"❌ Search error: {e}")
            return []
    
    def _scrape_articles(self, search_results):
        """Scrape content from top credible sources"""
        scraped = []
        
        # Only scrape from credible sources
        credible_results = [
            r for r in search_results 
            if any(source in r.get('link', '') for source in self.credible_sources.keys())
        ][:3]  # Top 3 credible sources
        
        for result in credible_results:
            content = self._scrape_single_url(result['link'])
            if content:
                scraped.append(content)
        
        print(f"✅ Scraped {len(scraped)} articles")
        return scraped
    
    def _scrape_single_url(self, url):
        """Scrape content from single URL"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get title
            title = soup.find('title')
            title_text = title.get_text().strip() if title else ''
            
            # Get main content
            # Try common article tags
            article = soup.find('article')
            if not article:
                article = soup.find('div', class_=re.compile('article|content|post'))
            
            if article:
                paragraphs = article.find_all('p')
            else:
                paragraphs = soup.find_all('p')
            
            # Extract text from paragraphs
            text_content = ' '.join([p.get_text().strip() for p in paragraphs[:10]])
            
            # Clean text
            text_content = re.sub(r'\s+', ' ', text_content).strip()
            
            return {
                'url': url,
                'title': title_text,
                'content': text_content[:2000],  # Limit to 2000 chars
                'source': urlparse(url).netloc.replace('www.', '')
            }
            
        except Exception as e:
            print(f"❌ Scraping error for {url}: {e}")
            return None
    
    def _check_domain(self, url):
        """Check domain credibility score using AI"""
        domain = urlparse(url).netloc.replace('www.', '')
        
        # First check if in known lists (for speed)
        for source, score in self.credible_sources.items():
            if source in domain:
                return {
                    'domain': domain, 
                    'score': score, 
                    'category': 'credible',
                    'ai_assessed': False,
                    'reasoning': 'Known credible source'
                }
        
        for source, score in self.unreliable_sources.items():
            if source in domain:
                return {
                    'domain': domain, 
                    'score': score, 
                    'category': 'unreliable',
                    'ai_assessed': False,
                    'reasoning': 'Known unreliable source'
                }
        
        # If unknown, ask Gemini to rate it
        print(f"🤖 Using AI to assess domain: {domain}")
        return self._ai_rate_source(domain)
    
    def _ai_rate_source(self, domain):
        """Use Gemini AI to rate source credibility"""
        try:
            prompt = f"""You are a media credibility expert. Rate this news source: {domain}

Analyze based on:
1. REPUTATION: Is this a known, established news organization?
2. JOURNALISTIC STANDARDS: Do they follow ethical journalism practices?
3. FACT-CHECKING: Do they have editorial oversight and corrections policy?
4. BIAS: Any extreme political bias or agenda?
5. RELIABILITY: Track record of accuracy vs misinformation?

Examples for reference:
- Reuters, BBC, AP News = 90-95 (highly credible, international standards)
- CNN, The Hindu, AajTak = 85-90 (credible mainstream with editorial standards)
- Local/regional news = 70-80 (credible but less rigorous)
- Blogs, opinion sites = 40-60 (depends on author)
- Conspiracy sites, fake news = 5-20 (unreliable)

Return ONLY valid JSON (no markdown):
{{
    "credibility_score": 0-100,
    "category": "credible" | "moderate" | "unreliable" | "unknown",
    "reasoning": "1-2 sentence explanation of the rating",
    "red_flags": ["list any concerns"],
    "strengths": ["list any positive factors"]
}}"""

            response = self.gemini.generate_content(
                prompt,
                generation_config={'temperature': 0.1}
            )
            
            result_text = response.text.strip()
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            analysis = json.loads(result_text)
            
            return {
                'domain': domain,
                'score': analysis['credibility_score'],
                'category': analysis['category'],
                'ai_assessed': True,
                'reasoning': analysis['reasoning'],
                'red_flags': analysis.get('red_flags', []),
                'strengths': analysis.get('strengths', [])
            }
            
        except Exception as e:
            print(f"❌ AI rating error: {e}")
            # Fallback to neutral score
            return {
                'domain': domain,
                'score': 50,
                'category': 'unknown',
                'ai_assessed': False,
                'reasoning': f'Could not assess: {str(e)}'
            }
    
    def _analyze_source_credibility(self, search_results):
        """Analyze credibility of all sources found (NOW WITH AI)"""
        source_analysis = []
        
        for result in search_results:
            link = result.get('link', '')
            if link:
                domain_info = self._check_domain(link)
                source_analysis.append({
                    'source': domain_info['domain'],
                    'score': domain_info['score'],
                    'category': domain_info['category'],
                    'ai_assessed': domain_info.get('ai_assessed', False),
                    'reasoning': domain_info.get('reasoning', ''),
                    'title': result.get('title', '')
                })
        
        # Calculate average credibility
        if source_analysis:
            avg_score = sum(s['score'] for s in source_analysis) / len(source_analysis)
        else:
            avg_score = 50
        
        return {
            'sources': source_analysis,
            'average_credibility': avg_score,
            'credible_count': len([s for s in source_analysis if s['score'] >= 80]),
            'unreliable_count': len([s for s in source_analysis if s['score'] < 40]),
            'ai_assessed_count': len([s for s in source_analysis if s.get('ai_assessed', False)])
        }
    
    def _gemini_verify(self, claim, search_results, scraped_content, source_scores):
        """Use Gemini to analyze all evidence and determine verdict"""
        
        # Prepare evidence summary
        search_summary = "\n".join([
            f"- [{r['source']}] {r['title']}: {r['snippet'][:150]}"
            for r in search_results[:5]
        ])
        
        scraped_summary = "\n\n".join([
            f"Source: {s['source']}\nTitle: {s['title']}\nContent: {s['content'][:500]}..."
            for s in scraped_content
        ])
        
        prompt = f"""You are an expert fact-checker. Analyze this claim for truthfulness.

CLAIM TO VERIFY:
"{claim}"

WEB SEARCH RESULTS:
{search_summary}

SCRAPED ARTICLE CONTENT FROM CREDIBLE SOURCES:
{scraped_summary}

SOURCE CREDIBILITY ANALYSIS:
- Average source credibility: {source_scores['average_credibility']:.0f}/100
- Credible sources found: {source_scores['credible_count']}
- Unreliable sources found: {source_scores['unreliable_count']}
- AI-assessed sources: {source_scores.get('ai_assessed_count', 0)}

VERIFICATION CRITERIA:
1. FACTUAL ACCURACY: Are the claims supported by evidence from credible sources?
2. SOURCE RELIABILITY: Are credible news agencies (Reuters, BBC, AP) reporting this?
3. CONSISTENCY: Do multiple independent sources agree?
4. CONTRADICTIONS: Are there any contradictions in the evidence?
5. RECENCY: For recent events, is there news coverage from last 48 hours?

IMPORTANT RULES:
- If a major event (death, disaster, breakthrough) and NO credible sources report it → LIKELY FALSE
- If found ONLY on unreliable sites → FALSE
- If multiple credible sources confirm → LIKELY TRUE
- If sources contradict each other → UNCERTAIN

Return ONLY valid JSON (no markdown):
{{
    "verdict": "TRUE" | "LIKELY TRUE" | "UNCERTAIN" | "LIKELY FALSE" | "FALSE",
    "credibility_score": 0-100,
    "confidence": 0-100,
    "reasoning": "Clear 2-3 sentence explanation of why this verdict was reached",
    "supporting_evidence": ["Key evidence supporting the verdict"],
    "contradicting_evidence": ["Any contradictions found"],
    "credible_sources_found": ["List credible sources that covered this"],
    "red_flags": ["Any warning signs found"],
    "recommendation": "What should users do with this information"
}}"""

        try:
            response = self.gemini.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.1,
                    'max_output_tokens': 2048
                }
            )
            
            # Parse response
            result_text = response.text.strip()
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            analysis = json.loads(result_text)
            
            # Determine color
            score = analysis['credibility_score']
            if score >= 75:
                color = 'green'
            elif score >= 50:
                color = 'yellow'
            elif score >= 25:
                color = 'orange'
            else:
                color = 'red'
            
            return {
                'verdict': analysis['verdict'],
                'credibility_score': analysis['credibility_score'],
                'confidence': analysis['confidence'],
                'color': color,
                'reasoning': analysis['reasoning'],
                'supporting_evidence': analysis.get('supporting_evidence', []),
                'contradicting_evidence': analysis.get('contradicting_evidence', []),
                'credible_sources': analysis.get('credible_sources_found', []),
                'red_flags': analysis.get('red_flags', []),
                'recommendation': analysis.get('recommendation', ''),
                'source_analysis': source_scores,
                'search_results_count': len(search_results),
                'articles_analyzed': len(scraped_content)
            }
            
        except Exception as e:
            print(f"❌ Gemini analysis error: {e}")
            return {
                'verdict': 'ERROR',
                'credibility_score': 0,
                'confidence': 0,
                'reasoning': f'Analysis failed: {str(e)}',
                'color': 'gray'
            }
    
    def _gemini_verify_url(self, url, article_content, search_results, domain_score):
        """Verify article from URL"""
        
        search_summary = "\n".join([
            f"- [{r['source']}] {r['title']}"
            for r in search_results[:5]
        ])
        
        # Include AI assessment info if available
        ai_info = ""
        if domain_score.get('ai_assessed'):
            ai_info = f"\nAI ASSESSMENT: {domain_score['reasoning']}"
            if domain_score.get('red_flags'):
                ai_info += f"\nRed Flags: {', '.join(domain_score['red_flags'])}"
            if domain_score.get('strengths'):
                ai_info += f"\nStrengths: {', '.join(domain_score['strengths'])}"
        
        prompt = f"""You are an expert fact-checker. Analyze this article for credibility.

ARTICLE URL: {url}
SOURCE DOMAIN: {domain_score['domain']}
DOMAIN CREDIBILITY: {domain_score['score']}/100 ({domain_score['category']}){ai_info}

ARTICLE TITLE: {article_content['title']}

ARTICLE CONTENT:
{article_content['content'][:1500]}

OTHER SOURCES COVERING SAME TOPIC:
{search_summary}

VERIFICATION:
1. Is the source credible?
2. Do other credible sources cover the same story?
3. Is the content factual or opinion/misleading?
4. Any sensationalism or clickbait?

Return ONLY valid JSON:
{{
    "verdict": "TRUE" | "LIKELY TRUE" | "UNCERTAIN" | "LIKELY FALSE" | "FALSE",
    "credibility_score": 0-100,
    "confidence": 0-100,
    "reasoning": "Explanation",
    "source_assessment": "Assessment of the source credibility",
    "content_quality": "Assessment of article content quality",
    "corroboration": "Are other sources reporting the same?",
    "red_flags": ["Any issues found"]
}}"""

        try:
            response = self.gemini.generate_content(
                prompt,
                generation_config={'temperature': 0.1}
            )
            
            result_text = response.text.strip()
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            analysis = json.loads(result_text)
            
            score = analysis['credibility_score']
            if score >= 75:
                color = 'green'
            elif score >= 50:
                color = 'yellow'
            elif score >= 25:
                color = 'orange'
            else:
                color = 'red'
            
            return {
                'verdict': analysis['verdict'],
                'credibility_score': analysis['credibility_score'],
                'confidence': analysis['confidence'],
                'color': color,
                'reasoning': analysis['reasoning'],
                'source_assessment': analysis.get('source_assessment', ''),
                'content_quality': analysis.get('content_quality', ''),
                'corroboration': analysis.get('corroboration', ''),
                'red_flags': analysis.get('red_flags', []),
                'domain_info': domain_score
            }
            
        except Exception as e:
            print(f"❌ URL verification error: {e}")
            return {
                'verdict': 'ERROR',
                'credibility_score': 0,
                'reasoning': f'Analysis failed: {str(e)}',
                'color': 'gray'
            }