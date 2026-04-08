import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuestions } from "../context/QuestionContext";
import "./Questions.css";

const Questions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { questionPdfs } = useQuestions();

  // Handle auto-search when redirected from a BookCard
  React.useEffect(() => {
    if (location.state?.initialSearch && questionPdfs.length > 0) {
      const q = location.state.initialSearch.trim();
      setSearchQuery(q);
      
      const qLower = q.toLowerCase();
      const filtered = questionPdfs.filter(pdf =>
        (pdf.subject && pdf.subject.toLowerCase().includes(qLower)) ||
        (pdf.course && pdf.course.toLowerCase().includes(qLower)) ||
        (pdf.label && pdf.label.toLowerCase().includes(qLower))
      );
      setResults(filtered);
      setSearched(true);

      // Clear the state so refreshing the page doesn't run it again
      window.history.replaceState({}, document.title);
    }
  }, [location.state, questionPdfs]);

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    const filtered = questionPdfs.filter(pdf =>
      (pdf.subject && pdf.subject.toLowerCase().includes(q)) ||
      (pdf.course && pdf.course.toLowerCase().includes(q)) ||
      (pdf.label && pdf.label.toLowerCase().includes(q))
    );
    setResults(filtered);
    setSearched(true);
  };

  return (
    <div className="questions-container">
      <div className="questions-content">
        <h2>Previous Year Questions</h2>
        <p className="subtitle">Search by subject, course or paper name</p>

        {/* Admin: Upload Questions button */}
        {user?.role === 'admin' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              onClick={() => navigate('/upload-questions')}
              className="uq-upload-btn"
            >
              Upload Questions
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by subject, course or label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="questions-search-input"
            />
            <button className="questions-search-btn" onClick={handleSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          results.length === 0 ? (
            <p className="no-results">No question PDFs found for "{searchQuery}".</p>
          ) : (
            <div className="pdf-results-list">
              {results.map(pdf => (
                <div key={pdf.id} className="pdf-result-card-row">
                  
                  {/* Left Side: Information */}
                  <div className="pdf-row-info">
                    <span className="pdf-card-course">{pdf.course}</span>
                    <div className="pdf-row-details">
                      <span className="pdf-card-subject">{pdf.subject}</span>
                      {pdf.label && <span className="pdf-card-label-row">| {pdf.label}</span>}
                      {pdf.year && <span className="pdf-card-year-row">📅 {pdf.year}</span>}
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="pdf-row-actions">
                    {user?.role === 'admin' && (
                      <button
                        className="pdf-edit-btn"
                        onClick={(e) => { e.stopPropagation(); navigate('/edit-question-pdf', { state: { pdf } }) }}
                      >
                        Edit
                      </button>
                    )}
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-card-open-row"
                    >
                      Open PDF →
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )
        )}

        {!searched && (
          <p className="instruction-placeholder">
            Enter a subject, course, or paper name above to find question PDFs.
          </p>
        )}

      </div>
    </div>
  );
};

export default Questions;
