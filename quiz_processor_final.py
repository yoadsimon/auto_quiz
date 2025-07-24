#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final Hebrew Quiz Data Processor
Processes Hebrew quiz data from raw text files into structured CSV format.
Handles both multiple choice (3-4 options) and matching questions.
"""

import os
import re
import csv
import glob
from typing import List, Dict, Optional

class HebrewQuizProcessor:
    def __init__(self, raw_data_dir: str = "raw_data", output_file: str = "data/quiz_data.csv"):
        self.raw_data_dir = raw_data_dir
        self.output_file = output_file
        self.questions = []
        
    def clean_text(self, text: str) -> str:
        """Clean and normalize Hebrew text."""
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text.strip())
        return text
    
    def extract_question_sections(self, content: str) -> List[str]:
        """Extract individual question sections from content."""
        # Pattern: "שאלה X" followed by status line (like "תקין" or "שגוי")
        question_pattern = r'שאלה \d+\s*(?:תקין|שגוי|נכון|הושלם)'
        sections = re.split(question_pattern, content)
        
        # Remove the first section (header) and clean sections
        sections = [section.strip() for section in sections[1:] if section.strip()]
        return sections
    
    def extract_multiple_choice_question(self, section: str) -> Optional[Dict]:
        """Extract a regular multiple choice question (3-4 options)."""
        try:
            # Extract question text after "תוכן השאלה"
            question_match = re.search(r'תוכן השאלה\s*(.+?)(?=סמנו את התשובה|$)', section, re.DOTALL)
            if not question_match:
                return None
            
            question_text = self.clean_text(question_match.group(1))
            if not question_text or "סמנו את התשובה" in question_text:
                question_text = re.sub(r'סמנו את התשובה.*', '', question_text).strip()
            
            # Extract answer options (א, ב, ג, ד)
            options = []
            option_pattern = r'([א-ד])\.\s*\n(.+?)(?=\n[א-ד]\.|משוב|התשובה הנכונה|$)'
            option_matches = re.findall(option_pattern, section, re.DOTALL)
            
            for letter, text in option_matches:
                clean_option = self.clean_text(text)
                if clean_option:
                    options.append(clean_option)
            
            # Extract correct answer - FIXED LOGIC
            correct_answer_text = ""
            correct_match = re.search(r'התשובה הנכונה:\s*(.+?)(?=\nשאלה|\n\n|סיום שלב|$)', section, re.DOTALL)
            if correct_match:
                correct_answer_text = self.clean_text(correct_match.group(1))
            
            # Find which option index corresponds to the correct answer - IMPROVED MATCHING
            correct_index = -1
            if correct_answer_text and options:
                # Try exact match first
                for i, option in enumerate(options):
                    if option.strip() == correct_answer_text.strip():
                        correct_index = i
                        break
                
                # If no exact match, try substring matching
                if correct_index == -1:
                    for i, option in enumerate(options):
                        # Check if option text is contained in correct answer or vice versa
                        if (option.strip() in correct_answer_text or 
                            correct_answer_text in option.strip()):
                            correct_index = i
                            break
                
                # Debug output for unmatched answers
                if correct_index == -1:
                    print(f"⚠️ Could not match correct answer for question: {question_text[:50]}...")
                    print(f"   Correct answer text: '{correct_answer_text}'")
                    print(f"   Available options: {options}")
                    # Default to first option if no match found
                    correct_index = 0
            
            if len(options) >= 2 and question_text:
                return {
                    'question': question_text,
                    'options': options,
                    'correct_answer': correct_index if correct_index >= 0 else 0
                }
                
        except Exception as e:
            print(f"Error processing multiple choice question: {e}")
        
        return None
    
    def extract_matching_questions(self, section: str) -> List[Dict]:
        """Extract matching questions and convert to binary choice questions."""
        try:
            # Extract main question text
            question_match = re.search(r'תוכן השאלה\s*(.+?)(?=\n\n|תשובה|\n[א-ז])', section, re.DOTALL)
            if not question_match:
                return []
            
            main_question = self.clean_text(question_match.group(1))
            if not main_question:
                return []
            
            # Remove metadata that got included
            main_question = re.sub(r'\d+\.\d+ נקודות.*?תוכן השאלה', '', main_question).strip()
            main_question = re.sub(r'סימון שאלה.*?תוכן השאלה', '', main_question).strip()
            
            # Extract correct answers from feedback - IMPROVED PARSING
            correct_mappings = {}
            feedback_match = re.search(r'התשובה הנכונה היא:\s*(.*?)(?=\nשאלה|\n\n|סיום שלב|$)', section, re.DOTALL)
            if feedback_match:
                feedback_text = feedback_match.group(1)
                # Parse mappings like "item → answer" or "item → answer,"
                mapping_pattern = r'(.+?)\s*→\s*(.+?)(?=,\s*\n|\n|$)'
                mappings = re.findall(mapping_pattern, feedback_text, re.DOTALL)
                
                for item, answer in mappings:
                    clean_item = self.clean_text(item)
                    clean_answer = self.clean_text(answer.rstrip(','))  # Remove trailing comma
                    if clean_item and clean_answer:
                        correct_mappings[clean_item] = clean_answer
            
            # Create binary choice questions for each mapping
            sub_questions = []
            if correct_mappings:
                all_answers = list(set(correct_mappings.values()))
                
                for item, correct_answer in correct_mappings.items():
                    if len(all_answers) >= 2:
                        # Create question: "main_question: item"
                        binary_question = f"{main_question}: {item}"
                        
                        # Clean up formatting issues
                        binary_question = re.sub(r':\s*,\s*', ': ', binary_question)
                        binary_question = re.sub(r'\s+', ' ', binary_question).strip()
                        
                        # Create two options: correct answer and one incorrect
                        options = [correct_answer]
                        for other_answer in all_answers:
                            if other_answer != correct_answer:
                                options.append(other_answer)
                                break
                        
                        if len(options) == 2:
                            sub_questions.append({
                                'question': binary_question,
                                'options': options,
                                'correct_answer': 0  # First option is always correct
                            })
            
            return sub_questions
            
        except Exception as e:
            print(f"Error processing matching question: {e}")
        
        return []
    
    def process_file(self, file_path: str) -> List[Dict]:
        """Process a single file and extract all questions."""
        questions = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if not content.strip():
                return questions
            
            # Remove noise (navigation, headers, etc.)
            content = re.sub(r'שִׂים לֵב:.*?דילוג לתוכן הראשי', '', content, flags=re.DOTALL)
            content = re.sub(r'מעבר ל\.\.\..*$', '', content, flags=re.DOTALL)
            content = re.sub(r'התחיל ב:.*?ציון.*?\d+\.\d+', '', content, flags=re.DOTALL)
            
            sections = self.extract_question_sections(content)
            
            for section in sections:
                # Check if this is a matching question (contains mappings with →)
                if '→' in section and 'התשובה הנכונה היא:' in section:
                    # Try to process as matching question
                    matching_questions = self.extract_matching_questions(section)
                    if matching_questions:
                        questions.extend(matching_questions)
                    else:
                        print(f"⚠️ Failed to process matching question in section")
                elif 'סמנו את התשובה' in section:
                    # Try to process as multiple choice
                    mc_question = self.extract_multiple_choice_question(section)
                    if mc_question:
                        questions.append(mc_question)
                    else:
                        print(f"⚠️ Failed to process multiple choice question in section")
            
        except Exception as e:
            print(f"Error processing file {file_path}: {e}")
        
        return questions
    
    def process_all_files(self):
        """Process all .txt files in the raw_data directory."""
        print("🚀 Hebrew Quiz Data Processor")
        print("=" * 50)
        
        # Get all .txt files in raw_data directory
        file_pattern = os.path.join(self.raw_data_dir, "*.txt")
        files = glob.glob(file_pattern)
        files = [f for f in files if not f.endswith('README_FILES.txt')]  # Skip readme
        files.sort()  # Process in order
        
        total_questions = 0
        processed_files = 0
        
        for file_path in files:
            filename = os.path.basename(file_path)
            print(f"📄 Processing {filename}...")
            
            file_questions = self.process_file(file_path)
            if file_questions:
                self.questions.extend(file_questions)
                total_questions += len(file_questions)
                processed_files += 1
                print(f"  ✅ Extracted {len(file_questions)} questions")
            else:
                print(f"  ⚪ No questions found")
        
        print(f"\n📊 Summary:")
        print(f"  Files processed: {processed_files}/{len(files)}")
        print(f"  Total questions: {total_questions}")
        
    def save_to_csv(self):
        """Save processed questions to CSV file with 4-option support."""
        if not self.questions:
            print("❌ No questions to save!")
            return
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(self.output_file), exist_ok=True)
        
        # Headers for up to 4 options
        headers = ['question', 'possible_answer_0', 'possible_answer_1', 'possible_answer_2', 'possible_answer_3', 'correct_answer']
        
        # Write to CSV
        with open(self.output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(headers)
            
            for question in self.questions:
                row = [question['question']]
                
                # Add all possible answers, padding with "None" if needed
                for i in range(4):  # Support up to 4 options
                    if i < len(question['options']):
                        row.append(question['options'][i])
                    else:
                        row.append("None")
                
                # Add correct answer index
                row.append(question['correct_answer'])
                
                writer.writerow(row)
        
        print(f"\n💾 Quiz data saved to: {self.output_file}")
        print(f"📈 Total questions: {len(self.questions)}")
        print(f"📋 CSV structure: {len(headers)} columns")
        
        # Show question type breakdown
        multiple_choice = sum(1 for q in self.questions if len(q['options']) > 2)
        binary_choice = sum(1 for q in self.questions if len(q['options']) == 2)
        print(f"📊 Question breakdown:")
        print(f"  Multiple choice (3-4 options): {multiple_choice}")
        print(f"  Binary choice (2 options): {binary_choice}")
        
        # Show correct answer distribution
        from collections import Counter
        answer_distribution = Counter(q['correct_answer'] for q in self.questions)
        print(f"📈 Correct answer distribution:")
        for answer_index, count in sorted(answer_distribution.items()):
            print(f"  Option {answer_index}: {count} questions")
    
    def show_sample_questions(self, num_samples: int = 5):
        """Display sample questions to verify processing."""
        if not self.questions:
            print("❌ No questions processed yet!")
            return
        
        print(f"\n🔍 Sample Questions (showing first {min(num_samples, len(self.questions))}):")
        print("-" * 60)
        
        for i, q in enumerate(self.questions[:num_samples]):
            print(f"\n📝 Question {i+1}:")
            print(f"   Q: {q['question']}")
            for j, option in enumerate(q['options']):
                marker = "✅" if j == q['correct_answer'] else "  "
                print(f"   {j}: {option} {marker}")
            
            # Show None padding for demonstration
            if len(q['options']) < 4:
                for k in range(len(q['options']), 4):
                    print(f"   {k}: None")


def main():
    """Main execution function."""
    processor = HebrewQuizProcessor()
    
    # Process all files
    processor.process_all_files()
    
    # Show sample questions
    processor.show_sample_questions(3)
    
    # Save to CSV
    processor.save_to_csv()
    
    print("\n🎉 Processing complete!")


if __name__ == "__main__":
    main() 