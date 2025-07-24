import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import QuizQuestion from './components/QuizQuestion';
import QuizResults from './components/QuizResults';

import { QuizQuestion as QuizQuestionType } from './types/quiz';
import { loadQuizData } from './utils/csvParser';
import { saveQuizDataToStorage, loadQuizDataFromStorage, hasStoredQuizData, clearAllQuizData, forceRefreshQuizData } from './utils/localStorage';
import { validateQuizData, getQuizDataStats } from './utils/dataValidator';

// Helper function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Hebrew Quiz App - RTL and Hebrew support enabled
const App: React.FC = () => {
  // App state
  const [gameState, setGameState] = useState<'menu' | 'quiz' | 'results' | 'browser'>('menu');
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<QuizQuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationInfo, setValidationInfo] = useState<string>('');
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  
  const hasLoadedRef = useRef(false);

  // Load quiz data on app start
  useEffect(() => {
    // Prevent double loading in React strict mode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading quiz data...');
      
      let quizData: QuizQuestionType[] = [];
      
      // Try to load from localStorage first
      if (hasStoredQuizData()) {
        console.log('📦 Found stored quiz data, loading from localStorage...');
        const storedData = loadQuizDataFromStorage();
        if (storedData) {
          quizData = storedData;
        }
      } else {
        console.log('📁 No stored data found, loading from CSV...');
        quizData = await loadQuizData();
        console.log(`📊 Loaded ${quizData.length} questions from CSV`);
        
        if (quizData.length > 0) {
          saveQuizDataToStorage(quizData);
          console.log('💾 Saved quiz data to localStorage for offline use');
        }
      }
      
      // Validate the data
      const validationResult = validateQuizData(quizData);
      const validQuestions = validationResult.validQuestions;
      const stats = getQuizDataStats(validQuestions);
      
      console.log('📋 Quiz data validation results:', stats);
      setValidationInfo(`✅ ${validQuestions.length} שאלות תקינות נטענו בהצלחה`);
      
      if (validQuestions.length === 0) {
        throw new Error('לא נמצאו שאלות תקינות. אנא בדוק את קובץ הנתונים.');
      }
      
      // Set the valid questions
      setQuestions(validQuestions);
      setOriginalQuestions(validQuestions);
      setUserAnswers(new Array(validQuestions.length).fill(null));
      
      console.log(`✅ Successfully loaded ${validQuestions.length} valid Hebrew questions`);
      
      // Show correct answer distribution for development
      const answerDistribution = validQuestions.reduce((acc, q) => {
        const correctIndex = q.options.indexOf(q.correctAnswer);
        acc[correctIndex] = (acc[correctIndex] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      console.log('📊 Correct answer distribution:', answerDistribution);
      
    } catch (error) {
      console.error('❌ Error loading quiz data:', error);
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת השאלות');
      
      // Clear potentially corrupted data
      clearAllQuizData();
    } finally {
      setLoading(false);
    }
  };



  // Quiz handlers
  const startQuiz = (startFromIndex: number = 0) => {
    console.log('Starting quiz from index:', startFromIndex);
    console.log('Original questions length:', originalQuestions.length);
    
    // Apply randomization if enabled
    const questionsToUse = randomizeQuestions ? shuffleArray(originalQuestions) : originalQuestions;
    console.log('Questions to use length:', questionsToUse.length);
    setQuestions(questionsToUse);
    
    // Validate the start index
    const validIndex = Math.max(0, Math.min(startFromIndex, questionsToUse.length - 1));
    console.log('Valid index:', validIndex);
    
    setGameState('quiz');
    setCurrentQuestionIndex(validIndex);
    setSelectedAnswer(null);
    setShowResult(false);
    setUserAnswers(new Array(questionsToUse.length).fill(null));
    setScore(0);
  };



  // Auto-mark question as known when answered correctly
  const markQuestionAsKnown = (questionId: any) => {
    try {
      localStorage.setItem(`question_${questionId}_known`, 'true');
    } catch (error) {
      console.error('Error saving question progress:', error);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    
    // Wait a moment then show result
    setTimeout(() => {
      setShowResult(true);
      
      // Update user answers
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestionIndex] = answerIndex;
      setUserAnswers(newUserAnswers);
      
      // Check if correct and update score
      const currentQuestion = questions[currentQuestionIndex];
      const correctAnswerIndex = currentQuestion.options.indexOf(currentQuestion.correctAnswer);
      if (answerIndex === correctAnswerIndex) {
        setScore((prevScore: number) => prevScore + 1);
        // Auto-mark question as known when answered correctly
        markQuestionAsKnown(currentQuestion.id);
      }
    }, 300);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz finished, show results
      setGameState('results');
    }
  };

  const handleRetry = () => {
    // Reset current question state to allow retry
    setSelectedAnswer(null);
    setShowResult(false);
    
    // Remove the current answer from userAnswers if it was incorrect
    const newUserAnswers = [...userAnswers];
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.options.indexOf(currentQuestion.correctAnswer);
    const previousAnswer = newUserAnswers[currentQuestionIndex];
    
    if (previousAnswer !== null && previousAnswer !== correctAnswerIndex) {
      // Deduct from score if we previously counted an incorrect answer
      setScore((prevScore) => Math.max(0, prevScore - 1));
    }
    
    newUserAnswers[currentQuestionIndex] = null;
    setUserAnswers(newUserAnswers);
  };

  const handleRestart = () => {
    startQuiz();
  };

  const handleBackToMenu = () => {
    setGameState('menu');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setUserAnswers(new Array(questions.length).fill(null));
    setScore(0);
  };

  const openQuestionBrowser = () => {
    setGameState('browser');
  };

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">טוען שאלות...</div>
          {validationInfo && <div className="validation-info">{validationInfo}</div>}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // Main app render
  return (
    <div className="app">
      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-panel-left">
          {/* Browse questions button */}
          {gameState === 'menu' && (
            <button 
              className="control-button browse-button"
              onClick={openQuestionBrowser}
            >
              📖 עיון בשאלות
            </button>
          )}
          
          {/* Back to menu button during browser */}
          {gameState === 'browser' && (
            <button 
              className="control-button back-menu-button"
              onClick={handleBackToMenu}
              title="חזור לתפריט הראשי"
            >
              ← חזור לתפריט
            </button>
          )}
          
          {/* Back to menu button during quiz */}
          {gameState === 'quiz' && (
            <button 
              className="control-button back-menu-button"
              onClick={handleBackToMenu}
              title="חזור לתפריט הראשי"
            >
              ← חזור לתפריט
            </button>
          )}
        </div>
        
        <div className="control-panel-right">
          {/* Randomization toggle */}
          {(gameState === 'menu' || gameState === 'browser') && (
            <button 
              className="control-button toggle-button"
              onClick={() => setRandomizeQuestions(!randomizeQuestions)}
            >
              <span className="control-toggle-text">ערבב</span>
              <div className="control-toggle-switch">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  readOnly
                />
                <span className="control-toggle-slider"></span>
              </div>
            </button>
          )}
          
          {/* Browse questions button during quiz */}
          {gameState === 'quiz' && (
            <button 
              className="control-button browse-button"
              onClick={openQuestionBrowser}
            >
              📖 עיון בשאלות
            </button>
          )}
        </div>
      </div>

      {gameState === 'menu' && (
        <MainMenu 
          questionsCount={questions.length}
          onStart={() => startQuiz()}
          questions={questions}
          onStartFromQuestion={(index) => startQuiz(index)}
        />
      )}

      {gameState === 'browser' && (
        <MainMenu 
          questionsCount={questions.length}
          onStart={() => startQuiz()}
          questions={questions}
          onStartFromQuestion={(index) => startQuiz(index)}
          showBrowser={true}
          onBackToMenu={handleBackToMenu}
        />
      )}
      
      {gameState === 'quiz' && questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && questions[currentQuestionIndex] && (
        <QuizQuestion
          question={questions[currentQuestionIndex]}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onNextQuestion={handleNextQuestion}
          showResult={showResult}
          isCorrect={selectedAnswer !== null ? selectedAnswer === questions[currentQuestionIndex].options.indexOf(questions[currentQuestionIndex].correctAnswer) : null}
          onRetry={handleRetry}
        />
      )}

      {gameState === 'quiz' && questions.length === 0 && (
        <div className="loading-container">
          <div className="loading-text">טוען שאלות...</div>
        </div>
      )}
      
      {gameState === 'results' && (
        <QuizResults
          score={score}
          totalQuestions={questions.length}
          questions={questions}
          userAnswers={userAnswers}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};

export default App;
