import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuestions } from "../context/QuestionContext";
import "./Questions.css";

const Questions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    course: "",
    year: "",
    subject: ""
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { questionPdfs } = useQuestions();

  const uniqueCourses = [...new Set(questionPdfs.map((pdf) => pdf.course).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const uniqueYears = [...new Set(questionPdfs.map((pdf) => pdf.year).filter(Boolean))].sort((a, b) => String(b).localeCompare(String(a)));
  const uniqueSubjects = [...new Set(questionPdfs.map((pdf) => pdf.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const applySearchAndFilters = (query = searchQuery, activeFilters = filters) => {
    const q = query.trim().toLowerCase();

    return questionPdfs.filter((pdf) => {
      const matchesQuery = !q || (
        (pdf.subject && pdf.subject.toLowerCase().includes(q)) ||
        (pdf.course && pdf.course.toLowerCase().includes(q)) ||
        (pdf.label && pdf.label.toLowerCase().includes(q))
      );

      const matchesCourse = !activeFilters.course || pdf.course === activeFilters.course;
      const matchesYear = !activeFilters.year || String(pdf.year) === activeFilters.year;
      const matchesSubject = !activeFilters.subject || pdf.subject === activeFilters.subject;

      return matchesQuery && matchesCourse && matchesYear && matchesSubject;
    });
  };

  // Handle auto-search when redirected from a BookCard
  React.useEffect(() => {
    if (location.state?.initialSearch && questionPdfs.length > 0) {
      const q = location.state.initialSearch.trim();
      setSearchQuery(q);
      const qLower = q.toLowerCase();
      const filtered = questionPdfs.filter((pdf) =>
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
    const hasActiveFilters = Object.values(filters).some(Boolean);
    const q = searchQuery.trim();

    if (!q && !hasActiveFilters) {
      setResults([]);
      setSearched(false);
      return;
    }

    const filtered = applySearchAndFilters(searchQuery, filters);
    setResults(filtered);
    setSearched(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, [key]: value };

      if (searched) {
        const filtered = applySearchAndFilters(searchQuery, nextFilters);
        setResults(filtered);
      }

      return nextFilters;
    });
  };

  const clearFilters = () => {
    const resetFilters = { course: "", year: "", subject: "" };
    setFilters(resetFilters);

    if (searched) {
      const hasQuery = searchQuery.trim();
      if (!hasQuery) {
        setResults([]);
        setSearched(false);
      } else {
        setResults(applySearchAndFilters(searchQuery, resetFilters));
      }
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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

          <button
            type="button"
            className={`questions-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <span>Filters</span>
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
        </div>

        {showFilters && (
          <div className="questions-filters-panel">
            <div className="questions-filter-grid">
              <label className="questions-filter-field">
                <span>Course</span>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                >
                  <option value="">All courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </label>

              <label className="questions-filter-field">
                <span>Year</span>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="">All years</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={String(year)}>{year}</option>
                  ))}
                </select>
              </label>

              <label className="questions-filter-field">
                <span>Subject</span>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                >
                  <option value="">All subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="questions-filter-actions">
              <button type="button" className="questions-clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        )}

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
