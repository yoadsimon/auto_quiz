import React from 'react';

interface QuizIntroProps {
  onStart: () => void;
}

const QuizIntro: React.FC<QuizIntroProps> = ({ onStart }) => {
  return (
    <div className="quiz-intro">
      <h2>ברוכים הבאים לחידון העברית!</h2>
      <p>האם אתם מוכנים לאתגר את הידע שלכם?</p>
      <button onClick={onStart}>התחל חידון</button>
    </div>
  );
};

export default QuizIntro; 