"""
NLP Enhancement Service
======================

Enterprise NLP enhancement service for improving and enriching text content
using advanced natural language processing techniques.

This service provides:
- Content enhancement and improvement
- Grammar and style correction
- Content structure optimization
- Readability improvement
- Technical content enhancement
- Content summarization and expansion
- Context-aware content modification
- Multi-language content enhancement
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import re
import json
from collections import Counter

logger = logging.getLogger(__name__)


class NLPEnhancementService:
    """Enterprise NLP enhancement service"""
    
    def __init__(self):
        self.enhancement_rules = self._load_enhancement_rules()
        self.style_guide = self._load_style_guide()
        self.technical_terms = self._load_technical_terms()
    
    def _load_enhancement_rules(self) -> Dict[str, List[str]]:
        """Load content enhancement rules"""
        return {
            'clarity': [
                'Use active voice instead of passive voice',
                'Break long sentences into shorter ones',
                'Use specific nouns instead of generic ones',
                'Eliminate unnecessary words and phrases',
                'Use consistent terminology'
            ],
            'structure': [
                'Add clear headings and subheadings',
                'Use bullet points for lists',
                'Group related information together',
                'Use logical flow and progression',
                'Add transitions between sections'
            ],
            'technical': [
                'Define technical terms when first used',
                'Use consistent technical terminology',
                'Provide examples for complex concepts',
                'Include relevant context and background',
                'Use appropriate technical level for audience'
            ],
            'readability': [
                'Use simple, clear language',
                'Avoid jargon and technical terms when possible',
                'Use short paragraphs',
                'Include examples and analogies',
                'Use visual formatting for emphasis'
            ]
        }
    
    def _load_style_guide(self) -> Dict[str, str]:
        """Load style guide for content improvement"""
        return {
            'data_governance': 'Use consistent data governance terminology',
            'compliance': 'Follow compliance documentation standards',
            'technical': 'Use technical writing best practices',
            'user_guide': 'Use clear, step-by-step instructions',
            'api_documentation': 'Use consistent API documentation format'
        }
    
    def _load_technical_terms(self) -> Dict[str, str]:
        """Load technical terms and their definitions"""
        return {
            'data_catalog': 'A comprehensive inventory of data assets',
            'data_lineage': 'The tracking of data as it moves through systems',
            'data_classification': 'The process of categorizing data by sensitivity',
            'compliance_rule': 'A rule that ensures data meets regulatory requirements',
            'scan_rule': 'A rule that defines how to scan and discover data',
            'metadata': 'Data that describes other data',
            'data_profiling': 'The analysis of data to understand its structure and quality',
            'data_quality': 'The measure of data accuracy, completeness, and consistency',
            'data_stewardship': 'The management and oversight of data assets',
            'data_privacy': 'The protection of personal and sensitive data'
        }
    
    async def enhance_content(
        self,
        content: str,
        content_type: str = "general",
        enhancement_options: Optional[Dict[str, bool]] = None
    ) -> str:
        """Enhance content using NLP techniques"""
        try:
            if not content:
                return content
            
            enhanced_content = content
            
            # Apply enhancement options
            if enhancement_options:
                if enhancement_options.get("improve_clarity", False):
                    enhanced_content = self._improve_clarity(enhanced_content)
                
                if enhancement_options.get("add_structure", False):
                    enhanced_content = self._add_structure(enhanced_content)
                
                if enhancement_options.get("enhance_readability", False):
                    enhanced_content = self._enhance_readability(enhanced_content)
                
                if enhancement_options.get("add_examples", False):
                    enhanced_content = self._add_examples(enhanced_content, content_type)
                
                if enhancement_options.get("fix_grammar", False):
                    enhanced_content = self._fix_grammar(enhanced_content)
            
            # Apply content-type specific enhancements
            enhanced_content = self._apply_content_type_enhancements(enhanced_content, content_type)
            
            return enhanced_content
            
        except Exception as e:
            logger.error(f"Error enhancing content: {e}")
            return content
    
    def _improve_clarity(self, content: str) -> str:
        """Improve content clarity"""
        try:
            # Replace passive voice with active voice
            content = re.sub(r'\b(is|are|was|were|be|been|being)\s+(\w+ed)\b', r'\2', content, flags=re.IGNORECASE)
            
            # Break long sentences
            sentences = re.split(r'[.!?]+', content)
            improved_sentences = []
            
            for sentence in sentences:
                sentence = sentence.strip()
                if len(sentence) > 100:  # Long sentence
                    # Try to break at conjunctions
                    parts = re.split(r'\s+(and|or|but|however|therefore|furthermore|moreover|nevertheless|notwithstanding)\s+', sentence)
                    if len(parts) > 1:
                        improved_sentences.extend(parts)
                    else:
                        improved_sentences.append(sentence)
                else:
                    improved_sentences.append(sentence)
            
            return '. '.join(improved_sentences) + '.'
            
        except Exception as e:
            logger.error(f"Error improving clarity: {e}")
            return content
    
    def _add_structure(self, content: str) -> str:
        """Add structure to content"""
        try:
            # Add headings for sections
            paragraphs = content.split('\n\n')
            structured_content = []
            
            for i, paragraph in enumerate(paragraphs):
                paragraph = paragraph.strip()
                if not paragraph:
                    continue
                
                # Add heading for first paragraph if it's substantial
                if i == 0 and len(paragraph) > 100:
                    structured_content.append("## Overview")
                
                structured_content.append(paragraph)
                
                # Add subheadings for long paragraphs
                if len(paragraph) > 200:
                    sentences = re.split(r'[.!?]+', paragraph)
                    if len(sentences) > 3:
                        # Add a subheading before the paragraph
                        structured_content.insert(-1, "### Key Points")
            
            return '\n\n'.join(structured_content)
            
        except Exception as e:
            logger.error(f"Error adding structure: {e}")
            return content
    
    def _enhance_readability(self, content: str) -> str:
        """Enhance content readability"""
        try:
            # Replace complex words with simpler alternatives
            word_replacements = {
                'utilize': 'use',
                'implement': 'use',
                'facilitate': 'help',
                'subsequently': 'then',
                'consequently': 'so',
                'furthermore': 'also',
                'moreover': 'also',
                'nevertheless': 'but',
                'notwithstanding': 'despite'
            }
            
            for complex_word, simple_word in word_replacements.items():
                content = re.sub(r'\b' + complex_word + r'\b', simple_word, content, flags=re.IGNORECASE)
            
            # Add bullet points for lists
            lines = content.split('\n')
            enhanced_lines = []
            
            for line in lines:
                line = line.strip()
                if line.startswith('-') or line.startswith('•'):
                    enhanced_lines.append(line)
                elif re.match(r'^\d+\.', line):
                    enhanced_lines.append(line)
                elif any(keyword in line.lower() for keyword in ['first', 'second', 'third', 'finally', 'lastly']):
                    # Convert numbered lists to bullet points
                    line = re.sub(r'^(first|second|third|finally|lastly)[:.]?\s*', '• ', line, flags=re.IGNORECASE)
                    enhanced_lines.append(line)
                else:
                    enhanced_lines.append(line)
            
            return '\n'.join(enhanced_lines)
            
        except Exception as e:
            logger.error(f"Error enhancing readability: {e}")
            return content
    
    def _add_examples(self, content: str, content_type: str) -> str:
        """Add relevant examples to content"""
        try:
            examples = self._get_examples_for_content_type(content_type)
            
            if examples:
                content += "\n\n## Examples\n\n"
                for example in examples[:3]:  # Limit to 3 examples
                    content += f"**Example:** {example}\n\n"
            
            return content
            
        except Exception as e:
            logger.error(f"Error adding examples: {e}")
            return content
    
    def _get_examples_for_content_type(self, content_type: str) -> List[str]:
        """Get examples for specific content type"""
        examples = {
            'data_governance': [
                'A data catalog entry might include metadata such as data source, owner, classification level, and last updated date.',
                'Data lineage tracking shows how customer data flows from the CRM system through the data warehouse to the reporting dashboard.',
                'A compliance rule might require that all personally identifiable information (PII) is encrypted at rest and in transit.'
            ],
            'compliance': [
                'GDPR compliance requires that organizations can demonstrate how personal data is processed and stored.',
                'A compliance audit might check that all data access is logged and monitored for suspicious activity.',
                'Data retention policies ensure that data is kept only for the minimum time required by regulations.'
            ],
            'technical': [
                'API endpoints should include proper authentication and authorization checks before processing requests.',
                'Database queries should be optimized to minimize response time and resource usage.',
                'Error handling should provide meaningful messages while not exposing sensitive system information.'
            ],
            'general': [
                'Clear documentation helps users understand how to use the system effectively.',
                'Regular backups ensure that data can be recovered in case of system failures.',
                'Monitoring and alerting help identify and resolve issues before they impact users.'
            ]
        }
        
        return examples.get(content_type, examples['general'])
    
    def _fix_grammar(self, content: str) -> str:
        """Fix common grammar issues"""
        try:
            # Fix common grammar mistakes
            fixes = [
                (r'\b(its)\s+(\w+ing)\b', r'it\'s \2'),  # its -> it's
                (r'\b(youre)\b', r'you\'re'),  # youre -> you're
                (r'\b(theyre)\b', r'they\'re'),  # theyre -> they're
                (r'\b(weve)\b', r'we\'ve'),  # weve -> we've
                (r'\b(cant)\b', r'can\'t'),  # cant -> can't
                (r'\b(dont)\b', r'don\'t'),  # dont -> don't
                (r'\b(wont)\b', r'won\'t'),  # wont -> won't
                (r'\b(shouldnt)\b', r'shouldn\'t'),  # shouldnt -> shouldn't
            ]
            
            for pattern, replacement in fixes:
                content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
            
            # Fix capitalization at sentence beginnings
            sentences = re.split(r'([.!?]+)', content)
            fixed_sentences = []
            
            for i, sentence in enumerate(sentences):
                if i % 2 == 0:  # Sentence content
                    if sentence.strip():
                        sentence = sentence.strip()
                        if sentence and not sentence[0].isupper():
                            sentence = sentence[0].upper() + sentence[1:]
                fixed_sentences.append(sentence)
            
            return ''.join(fixed_sentences)
            
        except Exception as e:
            logger.error(f"Error fixing grammar: {e}")
            return content
    
    def _apply_content_type_enhancements(self, content: str, content_type: str) -> str:
        """Apply content-type specific enhancements"""
        try:
            if content_type == "data_governance":
                content = self._enhance_data_governance_content(content)
            elif content_type == "compliance":
                content = self._enhance_compliance_content(content)
            elif content_type == "technical":
                content = self._enhance_technical_content(content)
            elif content_type == "user_guide":
                content = self._enhance_user_guide_content(content)
            
            return content
            
        except Exception as e:
            logger.error(f"Error applying content type enhancements: {e}")
            return content
    
    def _enhance_data_governance_content(self, content: str) -> str:
        """Enhance data governance specific content"""
        try:
            # Add technical term definitions
            for term, definition in self.technical_terms.items():
                if term in content.lower() and f"({definition})" not in content:
                    # Add definition in parentheses after first occurrence
                    pattern = rf'\b({term})\b'
                    replacement = r'\1 (' + definition + ')'
                    content = re.sub(pattern, replacement, content, count=1, flags=re.IGNORECASE)
            
            # Add data governance best practices
            if 'data catalog' in content.lower():
                content += "\n\n**Best Practice:** Ensure your data catalog is regularly updated and includes comprehensive metadata for all data assets."
            
            if 'data lineage' in content.lower():
                content += "\n\n**Best Practice:** Document data lineage at both the table and column level to ensure complete traceability."
            
            return content
            
        except Exception as e:
            logger.error(f"Error enhancing data governance content: {e}")
            return content
    
    def _enhance_compliance_content(self, content: str) -> str:
        """Enhance compliance specific content"""
        try:
            # Add compliance requirements
            if 'gdpr' in content.lower():
                content += "\n\n**Compliance Note:** GDPR requires organizations to demonstrate accountability and provide data subjects with rights to access, rectification, and erasure."
            
            if 'audit' in content.lower():
                content += "\n\n**Compliance Note:** Maintain detailed audit logs for all data access and modifications to support compliance audits."
            
            return content
            
        except Exception as e:
            logger.error(f"Error enhancing compliance content: {e}")
            return content
    
    def _enhance_technical_content(self, content: str) -> str:
        """Enhance technical specific content"""
        try:
            # Add technical best practices
            if 'api' in content.lower():
                content += "\n\n**Technical Note:** APIs should include proper versioning, authentication, and rate limiting to ensure security and scalability."
            
            if 'database' in content.lower():
                content += "\n\n**Technical Note:** Database queries should be optimized and include proper indexing to ensure optimal performance."
            
            return content
            
        except Exception as e:
            logger.error(f"Error enhancing technical content: {e}")
            return content
    
    def _enhance_user_guide_content(self, content: str) -> str:
        """Enhance user guide specific content"""
        try:
            # Add step-by-step formatting
            if any(word in content.lower() for word in ['step', 'procedure', 'process']):
                # Convert numbered steps to proper formatting
                content = re.sub(r'(\d+)\.\s*', r'**Step \1:** ', content)
            
            # Add tips and warnings
            if 'important' in content.lower() or 'critical' in content.lower():
                content += "\n\n**Tip:** Always test changes in a development environment before applying them to production."
            
            return content
            
        except Exception as e:
            logger.error(f"Error enhancing user guide content: {e}")
            return content
    
    async def summarize_content(self, content: str, max_length: int = 200) -> str:
        """Create a summary of the content"""
        try:
            if not content:
                return ""
            
            # Simple extractive summarization
            sentences = re.split(r'[.!?]+', content)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if len(sentences) <= 2:
                return content
            
            # Score sentences by word frequency
            word_freq = Counter()
            for sentence in sentences:
                words = re.findall(r'\b\w+\b', sentence.lower())
                word_freq.update(words)
            
            sentence_scores = {}
            for sentence in sentences:
                words = re.findall(r'\b\w+\b', sentence.lower())
                score = sum(word_freq[word] for word in words)
                sentence_scores[sentence] = score
            
            # Select top sentences
            sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
            summary_sentences = []
            current_length = 0
            
            for sentence, score in sorted_sentences:
                if current_length + len(sentence) <= max_length:
                    summary_sentences.append(sentence)
                    current_length += len(sentence)
                else:
                    break
            
            return '. '.join(summary_sentences) + '.'
            
        except Exception as e:
            logger.error(f"Error summarizing content: {e}")
            return content[:max_length] if content else ""
    
    async def expand_content(self, content: str, target_length: int = 500) -> str:
        """Expand content to meet target length"""
        try:
            if not content:
                return content
            
            current_length = len(content)
            if current_length >= target_length:
                return content
            
            # Add more details and explanations
            expanded_content = content
            
            # Add definitions for technical terms
            for term, definition in self.technical_terms.items():
                if term in content.lower() and f"({definition})" not in content:
                    pattern = rf'\b({term})\b'
                    replacement = r'\1 (' + definition + ')'
                    expanded_content = re.sub(pattern, replacement, expanded_content, count=1, flags=re.IGNORECASE)
            
            # Add examples if content is still too short
            if len(expanded_content) < target_length:
                examples = self._get_examples_for_content_type("general")
                expanded_content += "\n\n## Examples\n\n"
                for example in examples:
                    expanded_content += f"• {example}\n"
                    if len(expanded_content) >= target_length:
                        break
            
            return expanded_content
            
        except Exception as e:
            logger.error(f"Error expanding content: {e}")
            return content

