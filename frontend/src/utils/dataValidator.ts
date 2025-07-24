import { QuizQuestion } from '../types/quiz';

// Validation rules for quiz questions
export const validateQuizQuestion = (question: QuizQuestion): boolean => {
  console.log('🔍 Validating question:', question);
  
  // Check if question has required fields
  if (!question.id) {
    console.log('❌ Missing id:', question.id);
    return false;
  }
  
  if (!question.question) {
    console.log('❌ Missing question text:', question.question);
    return false;
  }
  
  if (!question.options) {
    console.log('❌ Missing options:', question.options);
    return false;
  }
  
  if (!question.correctAnswer) {
    console.log('❌ Missing correctAnswer:', question.correctAnswer);
    return false;
  }

  // Check if question text is not empty
  if (question.question.trim().length === 0) {
    console.log('❌ Empty question text');
    return false;
  }

  // Check if there are at least 2 options
  if (question.options.length < 2) {
    console.log('❌ Too few options:', question.options.length);
    return false;
  }

  // Check if all options are non-empty strings
  if (question.options.some(option => !option || option.trim().length === 0)) {
    console.log('❌ Empty option found:', question.options);
    return false;
  }

  // Check if correct answer exists in options
  if (question.options.indexOf(question.correctAnswer) === -1) {
    console.log('❌ Correct answer not in options. correctAnswer:', question.correctAnswer, 'options:', question.options);
    return false;
  }

  console.log('✅ Question passed validation');
  return true;
};

// Validate array of quiz questions
export const validateQuizData = (questions: QuizQuestion[]): {
  valid: boolean;
  validQuestions: QuizQuestion[];
  invalidQuestions: number[];
  errors: string[];
} => {
  const validQuestions: QuizQuestion[] = [];
  const invalidQuestions: number[] = [];
  const errors: string[] = [];

  if (!questions || questions.length === 0) {
    return {
      valid: false,
      validQuestions: [],
      invalidQuestions: [],
      errors: ['No questions provided']
    };
  }

  console.log('🔍 Starting validation of', questions.length, 'questions');
  console.log('📊 Sample question structure:', questions[0]);

  questions.forEach((question, index) => {
    console.log(`\n--- Validating Question ${index + 1} ---`);
    if (validateQuizQuestion(question)) {
      validQuestions.push(question);
    } else {
      invalidQuestions.push(index);
      errors.push(`Question ${index + 1} is invalid`);
    }
  });

  console.log('📊 Validation summary:', {
    total: questions.length,
    valid: validQuestions.length,
    invalid: invalidQuestions.length
  });

  return {
    valid: invalidQuestions.length === 0,
    validQuestions,
    invalidQuestions,
    errors
  };
};

// Check for duplicate questions
export const findDuplicateQuestions = (questions: QuizQuestion[]): number[] => {
  const duplicates: number[] = [];
  const seen = new Set<string>();

  questions.forEach((question, index) => {
    const questionText = question.question.trim().toLowerCase();
    if (seen.has(questionText)) {
      duplicates.push(index);
    } else {
      seen.add(questionText);
    }
  });

  return duplicates;
};

// Summary statistics for quiz data
export const getQuizDataStats = (questions: QuizQuestion[]): {
  totalQuestions: number;
  averageOptionsCount: number;
  questionsWithCategories: number;
  questionsWithExplanations: number;
} => {
  const totalQuestions = questions.length;
  const averageOptionsCount = questions.reduce((sum, q) => sum + q.options.length, 0) / totalQuestions;
  const questionsWithCategories = questions.filter(q => q.category).length;
  const questionsWithExplanations = questions.filter(q => q.explanation).length;

  return {
    totalQuestions,
    averageOptionsCount: Math.round(averageOptionsCount * 100) / 100,
    questionsWithCategories,
    questionsWithExplanations
  };
}; 