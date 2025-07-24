import React from 'react';
import './MainMenu.css';

interface MainMenuProps {
  onStart: () => void;
  questionsCount: number;
  questions: any[];
  onStartFromQuestion: (index: number) => void;
  showBrowser?: boolean;
  onBackToMenu?: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, questionsCount, questions, onStartFromQuestion, showBrowser: initialShowBrowser = false, onBackToMenu }) => {
  const [showBrowser, setShowBrowser] = React.useState(initialShowBrowser);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [markedQuestions, setMarkedQuestions] = React.useState({});
  const [filterType, setFilterType] = React.useState('all'); // 'all', 'marked', 'unmarked'

  // Load marked questions from localStorage on component mount
  React.useEffect(() => {
    const savedMarked: any = {};
    questions.forEach((question: any) => {
      const isMarked = localStorage.getItem(`question_${question.id}_known`) === 'true';
      savedMarked[question.id] = isMarked;
    });
    setMarkedQuestions(savedMarked);
  }, [questions, showBrowser]); // Reload when showBrowser changes to pick up new marks

  const toggleQuestionKnown = (questionId: any) => {
    const newStatus = !(markedQuestions as any)[questionId];
    localStorage.setItem(`question_${questionId}_known`, newStatus.toString());
    setMarkedQuestions((prev: any) => ({
      ...prev,
      [questionId]: newStatus
    }));
  };

  const getMarkedCount = () => {
    return Object.values(markedQuestions as any).filter(Boolean).length;
  };

  if (showBrowser) {
    const filteredQuestions = questions.filter((question: any) => {
      // Search filter
      const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Mark filter
      const isMarked = (markedQuestions as any)[question.id];
      let matchesFilter = true;
      if (filterType === 'marked') {
        matchesFilter = isMarked;
      } else if (filterType === 'unmarked') {
        matchesFilter = !isMarked;
      }
      
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="main-menu">
        <div className="browser-header">
          <h2 className="browser-title">עיון בשאלות</h2>
        </div>



        <div className="search-container">
          <input
            type="text"
            placeholder="חפש שאלות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filter-controls">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">הכל ({questions.length})</option>
              <option value="marked">ידועות ({getMarkedCount()})</option>
              <option value="unmarked">לא ידועות ({questions.length - getMarkedCount()})</option>
            </select>
          </div>
        </div>

                          <div className="questions-list">
            {filteredQuestions.map((question: any, index: any) => {
              const originalIndex = questions.findIndex((q: any) => q.id === question.id);
              const isKnown = (markedQuestions as any)[question.id];
              return (
                <div key={question.id} className={`question-card ${isKnown ? 'known-question' : ''}`}>
                  <div className="question-header">
                    <button
                      className={`knowledge-toggle ${isKnown ? 'known' : ''}`}
                      onClick={() => toggleQuestionKnown(question.id)}
                      title={isKnown ? 'סמן כלא ידוע' : 'סמן כידוע'}
                    >
                      {isKnown ? '✅' : '⚪'}
                    </button>
                    <span className="question-number">שאלה {question.id}</span>
                    {question.category && (
                      <span className="question-category">{question.category}</span>
                    )}
                  </div>
                  <div className="question-content">
                    <p className="question-text">{question.question}</p>
                  </div>
                  <div className="question-actions">
                    <button
                      className="start-from-button"
                      onClick={() => {
                        setShowBrowser(false);
                        setTimeout(() => {
                          onStartFromQuestion(originalIndex);
                        }, 100);
                      }}
                    >
                      🚀 התחל מכאן
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
  return (
    <div className="main-menu">
      <div className="welcome-section">
        <h2 className="welcome-title">ברוכים הבאים!</h2>
        <p className="welcome-description">
          בדקו את הידע שלכם בעברית ובמקורות יהודיים
        </p>
      </div>



      <button className="start-button" onClick={onStart}>
        <span className="button-icon">🚀</span>
        התחילו את החידון!
      </button>




    </div>
  );
};

export default MainMenu; 