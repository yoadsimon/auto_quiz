import React from 'react';
import { QuizQuestion as QuizQuestionType } from '../types/quiz';
import './QuizQuestion.css';

interface QuizQuestionProps {
  question: QuizQuestionType;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  onNextQuestion: () => void;
  onRetry: () => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNextQuestion,
  onRetry,
  showResult,
  isCorrect
}) => {
  const answerColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']; // Kahoot colors
  const answerLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="quiz-question">
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-text">
          שאלה {currentQuestionIndex + 1} מתוך {totalQuestions}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <h2 className="question-text">{question.question}</h2>
      </div>

      {/* Answer Options */}
      <div className="answers-grid">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`answer-button ${selectedAnswer === index ? 'selected' : ''} ${
              showResult ? (index === question.options.indexOf(question.correctAnswer) ? 'correct' : selectedAnswer === index ? 'incorrect' : 'neutral') : ''
            }`}
            style={{ 
              backgroundColor: selectedAnswer === index || !showResult ? answerColors[index] : undefined 
            }}
            onClick={() => !showResult && onAnswerSelect(index)}
            disabled={showResult}
          >
            <div className="answer-label">{answerLabels[index]}</div>
            <div className="answer-text">{option}</div>
          </button>
        ))}
      </div>

      {/* Result Display */}
      {showResult && (
        <div className="result-section">
          <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-emoji">{isCorrect ? '🎉' : '😔'}</div>
            <div className="result-text">{isCorrect ? 'נכון!' : 'לא נכון'}</div>
          </div>
          {isCorrect ? (
                          <button className="next-button" onClick={onNextQuestion}>
                {currentQuestionIndex + 1 < totalQuestions ? 'הבא' : 'תוצאות'}
              </button>
          ) : (
            <div className="button-group">
                              <button className="retry-button" onClick={onRetry}>
                  נסה שוב
                </button>
                <button className="next-button" onClick={onNextQuestion}>
                  {currentQuestionIndex + 1 < totalQuestions ? 'הבא' : 'תוצאות'}
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizQuestion; 