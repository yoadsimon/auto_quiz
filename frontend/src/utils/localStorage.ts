import { QuizQuestion, QuizState } from '../types/quiz';

const QUIZ_DATA_KEY = 'hebrew_quiz_data';
const QUIZ_STATE_KEY = 'hebrew_quiz_state';
const QUIZ_STATS_KEY = 'hebrew_quiz_stats';
const QUESTION_PROGRESS_KEY = 'hebrew_quiz_progress';

// Question Progress Interface
export interface QuestionProgress {
  [questionId: number]: {
    isMarkedCorrect: boolean;
    lastAttempted?: string;
  }
}

// Quiz Data Storage (for offline capability)
export const saveQuizDataToStorage = (questions: QuizQuestion[]): void => {
  try {
    localStorage.setItem(QUIZ_DATA_KEY, JSON.stringify(questions));
    console.log(`Saved ${questions.length} questions to localStorage`);
  } catch (error) {
    console.error('Failed to save quiz data to localStorage:', error);
  }
};

export const loadQuizDataFromStorage = (): QuizQuestion[] | null => {
  try {
    const data = localStorage.getItem(QUIZ_DATA_KEY);
    if (data) {
      const questions = JSON.parse(data) as QuizQuestion[];
      console.log(`Loaded ${questions.length} questions from localStorage`);
      return questions;
    }
  } catch (error) {
    console.error('Failed to load quiz data from localStorage:', error);
  }
  return null;
};

// Quiz State Storage (for resuming quizzes)
export const saveQuizState = (state: QuizState): void => {
  try {
    localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save quiz state:', error);
  }
};

export const loadQuizState = (): QuizState | null => {
  try {
    const data = localStorage.getItem(QUIZ_STATE_KEY);
    if (data) {
      return JSON.parse(data) as QuizState;
    }
  } catch (error) {
    console.error('Failed to load quiz state:', error);
  }
  return null;
};

// Check if quiz data exists in storage
export const hasStoredQuizData = (): boolean => {
  return localStorage.getItem(QUIZ_DATA_KEY) !== null;
};

// Clear all quiz-related data
export const clearAllQuizData = (): void => {
  try {
    localStorage.removeItem(QUIZ_DATA_KEY);
    localStorage.removeItem(QUIZ_STATE_KEY);
    localStorage.removeItem(QUIZ_STATS_KEY);
    console.log('Cleared all quiz data from localStorage');
  } catch (error) {
    console.error('Failed to clear quiz data:', error);
  }
};

// Force refresh data from CSV (for development/testing)
export const forceRefreshQuizData = (): void => {
  clearAllQuizData();
  console.log('🔄 Forced refresh: localStorage cleared, will reload from CSV');
};

// Question Progress Storage
export const saveQuestionProgress = (progress: QuestionProgress): void => {
  try {
    localStorage.setItem(QUESTION_PROGRESS_KEY, JSON.stringify(progress));
    console.log('Saved question progress to localStorage');
  } catch (error) {
    console.error('Failed to save question progress to localStorage:', error);
  }
};

export const loadQuestionProgress = (): QuestionProgress => {
  try {
    const data = localStorage.getItem(QUESTION_PROGRESS_KEY);
    if (data) {
      return JSON.parse(data) as QuestionProgress;
    }
  } catch (error) {
    console.error('Failed to load question progress from localStorage:', error);
  }
  return {};
};

export const markQuestionAsCorrect = (questionId: number, isCorrect: boolean): void => {
  const progress = loadQuestionProgress();
  progress[questionId] = {
    isMarkedCorrect: isCorrect,
    lastAttempted: new Date().toISOString()
  };
  saveQuestionProgress(progress);
};

export const isQuestionMarkedCorrect = (questionId: number): boolean => {
  const progress = loadQuestionProgress();
  return progress[questionId]?.isMarkedCorrect || false;
};

export const getMarkedCorrectCount = (): number => {
  const progress = loadQuestionProgress();
  let count = 0;
  for (const key in progress) {
    if (progress[key].isMarkedCorrect) {
      count++;
    }
  }
  return count;
}; 