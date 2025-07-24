import React from 'react';
import { QuizQuestion } from '../types/quiz';
import './QuizResults.css';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  userAnswers: (number | null)[];
  onRestart: () => void;
  onBackToMenu: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  questions,
  userAnswers,
  onRestart,
  onBackToMenu
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getScoreEmoji = () => {
    if (percentage >= 90) return { emoji: '🏆', color: 'gold' };
    if (percentage >= 80) return { emoji: '🎉', color: 'green' };
    if (percentage >= 70) return { emoji: '👍', color: 'blue' };
    if (percentage >= 60) return { emoji: '😊', color: 'orange' };
    return { emoji: '📚', color: 'red' };
  };

  const scoreInfo = getScoreEmoji();

  return (
    <div className="quiz-results">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <div className="score-circle" data-color={scoreInfo.color}>
            <div className="score-number">{score}</div>
            <div className="score-total">מתוך {totalQuestions}</div>
          </div>
          <div className="score-percentage">{percentage}%</div>
        </div>

        {/* Score Message */}
        <div className="score-message">
          <div className="score-emoji">{scoreInfo.emoji}</div>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card correct">
            <div className="stat-number">✅ {score}</div>
          </div>
          <div className="stat-card incorrect">
            <div className="stat-number">❌ {totalQuestions - score}</div>
          </div>
          <div className="stat-card percentage">
            <div className="stat-number">{percentage}%</div>
          </div>
        </div>

        {/* Question Summary */}
        <div className="question-summary">
          <div className="summary-list">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.options.indexOf(question.correctAnswer);
              
              return (
                <div key={index} className={`summary-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="summary-icon">
                    {isCorrect ? '✅' : '❌'}
                  </div>
                  <div className="summary-content">
                    <div className="summary-question">
                      {index + 1}. {question.question}
                    </div>
                    <div className="summary-answers">
                      <div className="correct-answer">
                        ✅ {question.correctAnswer}
                      </div>
                      {!isCorrect && userAnswer !== null && (
                        <div className="user-answer">
                          ❌ {question.options[userAnswer]}
                        </div>
                      )}
                      {userAnswer === null && (
                        <div className="no-answer">⚪</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="restart-button" onClick={onRestart}>
            🔄
          </button>
          <button className="menu-button" onClick={onBackToMenu}>
            🏠
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults; 