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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [markedQuestions, setMarkedQuestions] = React.useState({});
  const [filterType, setFilterType] = React.useState('all'); // 'all', 'marked', 'unmarked'
  const [isSearching, setIsSearching] = React.useState(false);

  // Load marked questions from localStorage on component mount
  React.useEffect(() => {
    const savedMarked: any = {};
    questions.forEach((question: any) => {
      const isMarked = localStorage.getItem(`question_${question.id}_known`) === 'true';
      savedMarked[question.id] = isMarked;
    });
    setMarkedQuestions(savedMarked);
  }, [questions, showBrowser]); // Reload when showBrowser changes to pick up new marks

  // Debounced search effect - smooth UX
  React.useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300); // 300ms delay for smooth typing

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const toggleQuestionKnown = (questionId: any) => {
    const newStatus = !(markedQuestions as any)[questionId];
    localStorage.setItem(`question_${questionId}_known`, newStatus.toString());
    setMarkedQuestions((prev: any) => ({
      ...prev,
      [questionId]: newStatus
    }));
  };



  if (showBrowser) {

    return (
      <div className="main-menu">
        {/* Fixed Header - Never moves */}
        <div className="browser-header-fixed">
          <h2 className="browser-title">עיון בשאלות</h2>
        </div>

        {/* Fixed Search Area - Never moves */}
        <div className="search-area-fixed">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="search"
                inputMode="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="חפש שאלות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`search-input ${isSearching ? 'searching' : ''}`}
                aria-label="חיפוש שאלות"
              />
  
            </div>
            <div className="filter-controls">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">
                  הכל ({questions.filter((q: any) => {
                    const searchText = debouncedSearchTerm.toLowerCase().trim();
                    return searchText.length === 0 || q.question.toLowerCase().includes(searchText);
                  }).length})
                </option>
                <option value="marked">
                  ידועות ({questions.filter((q: any) => {
                    const searchText = debouncedSearchTerm.toLowerCase().trim();
                    const matchesSearch = searchText.length === 0 || q.question.toLowerCase().includes(searchText);
                    const isMarked = (markedQuestions as any)[q.id];
                    return matchesSearch && isMarked;
                  }).length})
                </option>
                <option value="unmarked">
                  לא ידועות ({questions.filter((q: any) => {
                    const searchText = debouncedSearchTerm.toLowerCase().trim();
                    const matchesSearch = searchText.length === 0 || q.question.toLowerCase().includes(searchText);
                    const isMarked = (markedQuestions as any)[q.id];
                    return matchesSearch && !isMarked;
                  }).length})
                </option>
              </select>
            </div>
          </div>


        </div>

        {/* Scrollable Content Area - Only this scrolls */}
        <div className="scrollable-content">
          <div className="questions-list">
            {questions.map((question: any, index: any) => {
              const isKnown = (markedQuestions as any)[question.id];
              
              // Check if this question matches the current search/filter
              const searchText = debouncedSearchTerm.toLowerCase().trim();
              const matchesSearch = searchText.length === 0 || 
                                   question.question.toLowerCase().includes(searchText);
              
              const isMarked = (markedQuestions as any)[question.id];
              let matchesFilter = true;
              if (filterType === 'marked') {
                matchesFilter = isMarked;
              } else if (filterType === 'unmarked') {
                matchesFilter = !isMarked;
              }
              
              const isVisible = matchesSearch && matchesFilter;
              
              return (
                <div 
                  key={question.id} 
                  className={`question-card ${isKnown ? 'known-question' : ''} ${!isVisible ? 'filtered-out' : ''}`}
                >
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
                          onStartFromQuestion(index);
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
      </div>
    );
  }
  return (
    <div className="main-menu">
      <div className="welcome-section">
        <h2 className="welcome-title">ברוכים הבאים!</h2>
      </div>



      <button className="start-button" onClick={onStart}>
        <span className="button-icon">🚀</span>
        התחילו את החידון!
      </button>




    </div>
  );
};

export default MainMenu; 