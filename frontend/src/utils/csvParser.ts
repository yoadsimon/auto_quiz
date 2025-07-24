import { QuizQuestion } from '../types/quiz';

// CSV Parser for quiz data
export const parseCSVToQuizQuestions = (csvText: string): QuizQuestion[] => {
  console.log('CSV parsing started, text length:', csvText.length);
  
  const lines = csvText.trim().split('\n');
  console.log('Total lines:', lines.length);
  
  const questions: QuizQuestion[] = [];
  
  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines
    
    // Parse CSV line with proper handling of quoted strings containing commas
    const columns = parseCSVLine(line);
    console.log(`Line ${i} columns:`, columns.length, columns);
    
    if (columns.length >= 6) {
      // Build options array from columns 1-4 (possible_answer_0 to possible_answer_3)
      const allOptions = [
        cleanQuotedString(columns[1]), // possible_answer_0
        cleanQuotedString(columns[2]), // possible_answer_1
        cleanQuotedString(columns[3]), // possible_answer_2
        cleanQuotedString(columns[4])  // possible_answer_3
      ];
      
      // Filter out None, null, undefined, empty strings
      const validOptions = allOptions.filter(option => 
        option && 
        option.trim() !== '' && 
        option.trim().toLowerCase() !== 'none'
      );
      
      // Get correct answer index (0-3) and find the actual answer text
      const correctIndex = parseInt(columns[5]);
      const correctAnswerText = allOptions[correctIndex]; // Direct mapping to options array
      
      console.log(`Question ${i}: ${validOptions.length} valid options, correct index: ${correctIndex}, correct answer: "${correctAnswerText}"`);
      
      // Only include questions that have valid correct answers
      if (validOptions.length >= 2 && correctAnswerText && correctAnswerText.toLowerCase() !== 'none') {
        const question: QuizQuestion = {
          id: i, // Use line number as ID
          question: cleanQuotedString(columns[0]),
          options: validOptions,
          correctAnswer: correctAnswerText
        };
        
        questions.push(question);
        console.log(`✅ Added question ${i}`);
      } else {
        console.warn(`❌ Skipping invalid question at line ${i}:`, { 
          validOptionsCount: validOptions.length, 
          correctIndex, 
          correctAnswerText,
          allOptions 
        });
      }
    } else {
      console.warn(`❌ Line ${i} has insufficient columns:`, columns.length);
    }
  }
  
  console.log(`Final result: ${questions.length} questions parsed successfully`);
  return questions;
};

// Helper function to clean quoted strings and handle escaped quotes
const cleanQuotedString = (str: string): string => {
  if (!str) return '';
  
  let cleaned = str.trim();
  
  // Remove outer quotes if present
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Handle escaped quotes (double quotes become single quotes)
  cleaned = cleaned.replace(/""/g, '"');
  
  return cleaned;
};

// Helper function to parse CSV line with quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
};

// Function to load quiz data from the original data directory via symbolic link
export const loadQuizData = async (): Promise<QuizQuestion[]> => {
  try {
    console.log('🔄 Starting to load quiz data from original source...');
    // Access via symbolic link to avoid duplication
    const response = await fetch('/quiz_data.csv');
    console.log('📡 Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('📄 CSV text loaded, length:', csvText.length);
    
    const questions = parseCSVToQuizQuestions(csvText);
    console.log('✅ Final parsed questions count:', questions.length);
    return questions;
  } catch (error) {
    console.error('❌ Failed to load quiz data:', error);
    return [];
  }
}; 