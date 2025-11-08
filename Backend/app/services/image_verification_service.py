# app/services/image_verification_service.py

import google.generativeai as genai
from PIL import Image
from PIL.ExifTags import TAGS
import requests
import json
import os
import base64
from datetime import datetime

class ImageVerificationService:
    
    def __init__(self):
        # Initialize Gemini
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.gemini = genai.GenerativeModel('gemini-flash-latest')
        
        # Serper API key
        self.serper_key = os.getenv('SERPER_API_KEY')
    
    def verify_image(self, image_path):
        """
        Complete image verification pipeline
        
        Returns:
        {
            'verdict': 'LIKELY TRUE/FALSE/UNCERTAIN',
            'credibility_score': 0-100,
            'confidence': 0-100,
            'extracted_text': '...',
            'image_analysis': {...},
            'metadata_analysis': {...},
            'reverse_search': {...},
            'red_flags': [],
            'reasoning': '...'
        }
        """
        
        try:
            print("🔍 Starting image verification...")
            
            # Step 1: Gemini Vision - OCR + AI Analysis
            print("📝 Extracting text and analyzing with Gemini...")
            gemini_result = self._analyze_with_gemini(image_path)
            
            # Step 2: Metadata Analysis
            print("🔍 Checking image metadata...")
            metadata = self._analyze_metadata(image_path)
            
            # Step 3: Reverse Image Search (Serper)
            print("🌐 Performing reverse image search...")
            reverse_result = self._reverse_search_serper(image_path)
            
            # Step 4: Calculate Final Score
            print("⚖️ Calculating credibility score...")
            final_result = self._calculate_final_verdict(
                gemini_result, 
                metadata, 
                reverse_result
            )
            
            return final_result
            
        except Exception as e:
            return {
                'error': str(e),
                'verdict': 'ERROR',
                'credibility_score': 0,
                'confidence': 0
            }
    
    def _analyze_with_gemini(self, image_path):
        """Use Gemini Vision for OCR + AI analysis"""
        
        try:
            img = Image.open(image_path)
            
            prompt = """
            Analyze this image thoroughly for misinformation:
            
            1. EXTRACT ALL TEXT: Read every word visible in the image
            2. IMAGE TYPE: Identify if this is a screenshot, meme, news article, photo, or other
            3. MANIPULATION: Check for signs of editing, photoshop, deepfake, or tampering
            4. CLAIMS: List any factual claims made in text or implied by the image
            5. CREDIBILITY: Rate how credible this image appears (0-100)
            6. RED FLAGS: Note any suspicious elements (fake fonts, poor quality, inconsistencies)
            
            Return ONLY valid JSON (no markdown, no extra text):
            {
                "extracted_text": "complete text from image",
                "image_type": "screenshot/meme/news/photo/other",
                "manipulation_detected": true/false,
                "manipulation_signs": ["list specific signs if any"],
                "claims": ["claim 1", "claim 2"],
                "credibility_score": 0-100,
                "red_flags": ["flag 1", "flag 2"],
                "reasoning": "brief explanation"
            }
            """
            
            response = self.gemini.generate_content(
                [prompt, img],
                generation_config={'temperature': 0.1}
            )
            
            result_text = response.text.strip()
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            analysis = json.loads(result_text)
            return analysis
            
        except Exception as e:
            print(f"❌ Gemini analysis error: {e}")
            return {
                'extracted_text': '',
                'image_type': 'unknown',
                'manipulation_detected': False,
                'claims': [],
                'credibility_score': 50,
                'red_flags': [f'Analysis error: {str(e)}']
            }
    
    def _analyze_metadata(self, image_path):
        """Extract and analyze EXIF metadata"""
        
        try:
            img = Image.open(image_path)
            exif_data = img._getexif()
            
            metadata = {
                'has_metadata': False,
                'camera_make': None,
                'camera_model': None,
                'datetime': None,
                'software': None,
                'edited': False,
                'gps_location': None,
                'red_flags': []
            }
            
            if exif_data:
                metadata['has_metadata'] = True
                
                for tag_id, value in exif_data.items():
                    tag = TAGS.get(tag_id, tag_id)
                    
                    if tag == 'Make':
                        metadata['camera_make'] = str(value)
                    elif tag == 'Model':
                        metadata['camera_model'] = str(value)
                    elif tag == 'DateTime':
                        metadata['datetime'] = str(value)
                    elif tag == 'Software':
                        metadata['software'] = str(value)
                        metadata['edited'] = True
                        metadata['red_flags'].append(
                            f"Image edited with: {value}"
                        )
                    elif tag == 'GPSInfo':
                        metadata['gps_location'] = 'Present'
            else:
                metadata['red_flags'].append(
                    "No metadata found - may be stripped or screenshot"
                )
            
            return metadata
            
        except Exception as e:
            return {
                'has_metadata': False,
                'red_flags': [f'Metadata error: {str(e)}']
            }
    
    def _reverse_search_serper(self, image_path):
        """Reverse image search using Serper API"""
        
        if not self.serper_key:
            return {
                'matches_found': 0,
                'error': 'Serper API key not configured'
            }
        
        try:
            # Convert image to base64
            with open(image_path, 'rb') as img_file:
                image_data = base64.b64encode(img_file.read()).decode('utf-8')
            
            # Determine image format
            img_format = Image.open(image_path).format.lower()
            mime_type = f"image/{img_format}"
            
            url = "https://google.serper.dev/images"
            
            payload = json.dumps({
                "imageBase64": f"data:{mime_type};base64,{image_data}",
                "gl": "us",
                "hl": "en"
            })
            
            headers = {
                'X-API-KEY': self.serper_key,
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, headers=headers, data=payload, timeout=15)
            data = response.json()
            
            result = {
                'matches_found': 0,
                'sources': [],
                'credible_sources': [],
                'earliest_date': None,
                'related_contexts': [],
                'red_flags': []
            }
            
            # Parse image results
            if 'images' in data:
                result['matches_found'] = len(data['images'])
                
                credible_domains = [
                    'reuters.com', 'bbc.com', 'apnews.com', 'cnn.com',
                    'nytimes.com', 'theguardian.com', 'washingtonpost.com',
                    'aljazeera.com', 'npr.org', 'politifact.com',
                    'snopes.com', 'factcheck.org'
                ]
                
                unreliable_keywords = [
                    'fakenews', 'clickbait', 'viral', 'shocking',
                    'unbelievable', 'youwonotbelieve', 'breaking911'
                ]
                
                dates_found = []
                
                for img in data['images'][:20]:
                    source_info = {
                        'title': img.get('title', ''),
                        'source': img.get('source', ''),
                        'link': img.get('link', ''),
                        'snippet': img.get('snippet', ''),
                        'date': img.get('date', None)
                    }
                    
                    result['sources'].append(source_info)
                    
                    # Check credibility
                    link_lower = source_info['link'].lower()
                    
                    if any(domain in link_lower for domain in credible_domains):
                        result['credible_sources'].append(source_info)
                    
                    # Check for unreliable sources
                    if any(keyword in link_lower for keyword in unreliable_keywords):
                        result['red_flags'].append(
                            f"Found on suspicious site: {source_info['source']}"
                        )
                    
                    # Collect dates
                    if source_info['date']:
                        dates_found.append(source_info['date'])
                
                # Find earliest date
                if dates_found:
                    result['earliest_date'] = min(dates_found)
                    result['red_flags'].append(
                        f"Image first appeared: {result['earliest_date']}"
                    )
            
            # Related searches (context clues)
            if 'relatedSearches' in data:
                result['related_contexts'] = [
                    s.get('query') for s in data['relatedSearches'][:5]
                ]
            
            return result
            
        except Exception as e:
            print(f"❌ Reverse search error: {e}")
            return {
                'matches_found': 0,
                'error': str(e),
                'red_flags': [f'Reverse search failed: {str(e)}']
            }
    
    def _calculate_final_verdict(self, gemini_result, metadata, reverse_result):
        """Combine all analyses into final verdict"""
        
        # Start with Gemini's score
        score = gemini_result.get('credibility_score', 50)
        confidence = 50
        
        all_red_flags = []
        all_red_flags.extend(gemini_result.get('red_flags', []))
        all_red_flags.extend(metadata.get('red_flags', []))
        all_red_flags.extend(reverse_result.get('red_flags', []))
        
        # Adjust score based on metadata
        if metadata.get('edited'):
            score -= 10
            confidence += 10
        
        if not metadata.get('has_metadata'):
            score -= 5
            all_red_flags.append("No metadata - possible screenshot or stripped data")
        
        # Adjust based on reverse search
        matches = reverse_result.get('matches_found', 0)
        credible_matches = len(reverse_result.get('credible_sources', []))
        
        if matches > 0:
            confidence += 20
            
            if credible_matches > 0:
                score += 10
            elif matches > 10 and credible_matches == 0:
                score -= 15
                all_red_flags.append(
                    f"Found {matches} matches but none from credible sources"
                )
        
        # Manipulation detected
        if gemini_result.get('manipulation_detected'):
            score -= 25
            confidence += 15
        
        # Ensure score is in valid range
        score = max(0, min(100, score))
        confidence = max(0, min(100, confidence))
        
        # Determine verdict
        if score >= 75:
            verdict = 'LIKELY TRUE'
            color = 'green'
        elif score >= 60:
            verdict = 'MOSTLY TRUE'
            color = 'lightgreen'
        elif score >= 40:
            verdict = 'UNCERTAIN'
            color = 'yellow'
        elif score >= 25:
            verdict = 'LIKELY FALSE'
            color = 'orange'
        else:
            verdict = 'FALSE'
            color = 'red'
        
        # Build reasoning
        reasoning_parts = []
        
        if gemini_result.get('extracted_text'):
            reasoning_parts.append(
                f"Image contains text: '{gemini_result['extracted_text'][:100]}...'"
            )
        
        if gemini_result.get('manipulation_detected'):
            reasoning_parts.append("AI detected signs of image manipulation")
        
        if credible_matches > 0:
            reasoning_parts.append(
                f"Found in {credible_matches} credible sources"
            )
        
        if reverse_result.get('earliest_date'):
            reasoning_parts.append(
                f"First appeared online: {reverse_result['earliest_date']}"
            )
        
        reasoning = ". ".join(reasoning_parts[:3])
        
        return {
            'verdict': verdict,
            'credibility_score': round(score),
            'confidence': round(confidence),
            'color': color,
            'extracted_text': gemini_result.get('extracted_text', ''),
            'image_type': gemini_result.get('image_type', 'unknown'),
            'claims': gemini_result.get('claims', []),
            'manipulation_detected': gemini_result.get('manipulation_detected', False),
            'manipulation_signs': gemini_result.get('manipulation_signs', []),
            'metadata': metadata,
            'reverse_search': {
                'matches_found': reverse_result.get('matches_found', 0),
                'credible_sources_count': credible_matches,
                'earliest_appearance': reverse_result.get('earliest_date'),
                'related_contexts': reverse_result.get('related_contexts', [])
            },
            'red_flags': list(set(all_red_flags)),  # Remove duplicates
            'reasoning': reasoning,
            'timestamp': datetime.now().isoformat()
        }