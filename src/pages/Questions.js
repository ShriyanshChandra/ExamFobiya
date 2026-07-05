import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuestions } from "../context/QuestionContext";
import ConfirmationModal from "../components/ConfirmationModal";
import useSEO from "../utils/useSEO";
import "./Questions.css";

const Questions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [filters, setFilters] = useState({
    course: "",
    year: "",
    subject: ""
  });

  const { user, toggleSavedItem } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { questionPdfs, deleteQuestionPdf } = useQuestions();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const formatQuestionDate = (pdf) => [pdf.month, pdf.year].filter(Boolean).join(' ');

  useSEO({
    title: 'Previous Year Questions',
    description: 'Find previous year question papers for BCA, DCA, and PGDCA courses. Filter by course, year, and subject.',
    path: '/#/questions'
  });

  const uniqueCourses = [...new Set(questionPdfs.map((pdf) => pdf.course).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const uniqueYears = [...new Set(questionPdfs.map((pdf) => pdf.year).filter(Boolean))].sort((a, b) => String(b).localeCompare(String(a)));
  const uniqueSubjects = [...new Set(questionPdfs.map((pdf) => pdf.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const applySearchAndFilters = (query = searchQuery, activeFilters = filters) => {
    const q = query.trim().toLowerCase();

    return questionPdfs.filter((pdf) => {
      const matchesQuery = !q || (
        (pdf.subject && pdf.subject.toLowerCase().includes(q)) ||
        (pdf.course && pdf.course.toLowerCase().includes(q)) ||
        (pdf.label && pdf.label.toLowerCase().includes(q)) ||
        (pdf.month && pdf.month.toLowerCase().includes(q))
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
        (pdf.label && pdf.label.toLowerCase().includes(qLower)) ||
        (pdf.month && pdf.month.toLowerCase().includes(qLower))
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

  const getQuestionSaveId = (pdf) => pdf.docPath || pdf.id;

  const isQuestionSaved = (pdf) => {
    const savedQuestionIds = user?.savedQuestions || user?.savedQuestionIds || user?.savedQuestionPdfs || [];
    const saveId = getQuestionSaveId(pdf);
    return savedQuestionIds.includes(saveId) || savedQuestionIds.includes(pdf.id) || savedQuestionIds.includes(pdf.docPath);
  };

  const handleQuestionSave = async (pdf) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSaveError("");
      await toggleSavedItem('question', getQuestionSaveId(pdf));
    } catch (error) {
      console.error('Error saving question:', error);
      setSaveError('Could not update saved questions.');
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteQuestionPdf(deleteTarget.docPath);
      setResults((prev) => prev.filter((pdf) => pdf.id !== deleteTarget.id));
    } catch (error) {
      console.error('Error deleting question PDF:', error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="questions-container">
      <div className="questions-content">
        <h2>Previous Year Questions</h2>


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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
              {saveError && <p className="question-save-error">{saveError}</p>}
              {results.map(pdf => (
                <div key={pdf.id} className="pdf-result-card-row">
                  
                  {/* Left Side: Information */}
                  <div className="pdf-row-info">
                    <button
                      type="button"
                      className={`question-save-btn ${isQuestionSaved(pdf) ? 'saved' : ''}`}
                      onClick={() => handleQuestionSave(pdf)}
                      aria-label={isQuestionSaved(pdf) ? `Remove ${pdf.subject || pdf.label || 'question'} from saved questions` : `Save ${pdf.subject || pdf.label || 'question'}`}
                      aria-pressed={isQuestionSaved(pdf)}
                      title={isQuestionSaved(pdf) ? 'Remove from saved questions' : 'Save question'}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 3.75C6 2.78 6.78 2 7.75 2h8.5C17.22 2 18 2.78 18 3.75V21l-6-3.5L6 21V3.75Z" />
                      </svg>
                    </button>
                    <div className="pdf-row-info-body">
                      <div className="pdf-row-info-header">
                        <span className="pdf-card-course">{pdf.course}</span>
                        <span className="pdf-card-subject">{pdf.subject}</span>
                      </div>
                      {(pdf.label || pdf.month || pdf.year) && (
                        <span className="pdf-card-label-row">
                          {[pdf.label, formatQuestionDate(pdf)].filter(Boolean).join(' | ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="pdf-row-actions">
                    {user?.role === 'admin' && (
                      <>
                      <button
                        className="pdf-edit-btn"
                        onClick={(e) => { e.stopPropagation(); navigate('/edit-question-pdf', { state: { pdf } }) }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pdf-edit-btn solution-delete-btn"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: pdf.id, docPath: pdf.docPath || pdf.id, title: pdf.subject || pdf.label || 'this question' }); }}
                      >
                        Delete
                      </button>
                      </>
                    )}
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-card-open-row"
                    >
                      Open PDF
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )
        )}

        {!searched && (
          <p className="instruction-placeholder">
            Enter a subject, course, or question label above to find question PDFs.
          </p>
        )}

      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question PDF"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
        variant="danger"
      />
    </div>
  );
};

export default Questions;
