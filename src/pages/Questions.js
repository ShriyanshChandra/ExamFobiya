import React, { useState, useEffect } from "react";
import { useBooks } from "../context/BookContext";
import { useQuestions } from "../context/QuestionContext"; // Import QuestionContext
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import { useNavigate } from "react-router-dom"; // Import useNavigate
import DeleteQuestionModal from "../components/DeleteQuestionModal"; // Import DeleteQuestionModal
import "../components/QueSearch.css";
import QueSearch from "../components/QueSearch";
import "./Questions.css";


const Questions = () => {
  const { books } = useBooks(); // Use BookContext
  const { questions, deleteQuestion } = useQuestions(); // Use QuestionContext
  const { user } = useAuth(); // Get user for role check
  const navigate = useNavigate(); // Hook for navigation

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Reset dependent filters when parent filter changes

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    setSelectedSubject("");
  }, [selectedCourse]);

  // Derived options from Books and Questions Data
  const courses = [...new Set([
    ...books.map(book => book.category),
    ...questions.map(q => q.course)
  ])].filter(Boolean).sort();

  const subjects = selectedCourse
    ? [...new Set([
      ...books.filter(book => book.category === selectedCourse).map(book => book.title),
      ...questions.filter(q => q.course === selectedCourse).map(q => q.subject)
    ])].filter(Boolean).sort()
    : [];

  // Filter Logic
  // Helper to remove prefixes
  const cleanContent = (html) => {
    if (!html) return "";
    // Regex to match "Q:", "A:", "Question:", "Answer:" at the start, case-insensitive, optional whitespace/bold tags
    return html.replace(/^(?:<[^>]+>)*\s*(?:Q|A|Question|Answer)\s*:\s*(?:<\/[^>]+>)*\s*/i, "");
  };

  const filteredQuestions = questions.filter(question => {
    if (selectedCourse && question.course !== selectedCourse) return false;
    if (selectedSubject && question.subject !== selectedSubject) return false;
    if (selectedUniversity && question.university !== selectedUniversity) return false;
    if (selectedYear && question.year.toString() !== selectedYear) return false;

    // Search in Tags (if available) or Title (fallback)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const tagsMatch = question.tags && question.tags.some(tag => tag.toLowerCase().includes(query));
      const titleMatch = question.title && question.title.toLowerCase().includes(query);
      const subjectMatch = question.subject && question.subject.toLowerCase().includes(query);
      // Clean content before search check if needed, but search usually wants raw match. 
      // Keeping original search logic for now to avoid breaking matching.
      const qTextMatch = question.question && question.question.toLowerCase().includes(query);

      if (!tagsMatch && !titleMatch && !subjectMatch && !qTextMatch) return false;
    }
    return true;
  });

  // Only show results if (Course AND Subject) are selected, OR if there is a search query
  const showResults = (!!selectedCourse && !!selectedSubject) || !!searchQuery;

  return (
    <div className="questions-container">
      <div className="questions-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2>Previous Year Questions</h2>
            <p className="subtitle">Select your course details to find question papers</p>
          </div>
          {user?.role === 'admin' && (
            <button
              className="add-question-btn"
              onClick={() => navigate('/add-question')}
              style={{
                backgroundColor: '#ffd700',
                color: '#182848',
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Add New Questions
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <QueSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          courses={courses}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          subjects={subjects}
          selectedUniversity={selectedUniversity}
          setSelectedUniversity={setSelectedUniversity}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />

        {/* Results Area */}
        <div className="questions-results">
          {showResults ? (
            filteredQuestions.length > 0 ? (
              <div className="questions-list-container">
                {filteredQuestions.map(question => {
                  const hasUni = question.university && question.university !== "Unknown University" && question.university !== "Unknown";
                  const hasYear = question.year && question.year !== "Unknown";
                  const hasTags = question.tags && question.tags.length > 0;
                  const showMeta = hasUni || hasYear || hasTags;

                  return (
                    <div key={question.id} className="qa-box">
                      {showMeta && (
                        <div className="qa-meta">
                          {hasUni && (
                            <>
                              <span className="meta-uni">{question.university}</span>
                              {hasYear && <span className="meta-separator">•</span>}
                            </>
                          )}
                          {hasYear && <span className="meta-year">{question.year}</span>}

                          {hasTags && (
                            <div className="qa-tags">
                              {question.tags.map((tag, idx) => (
                                <span key={idx} className="qa-tag-badge">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="qa-content-section">
                        <div className="qa-question">
                          <strong>Question:</strong>
                          <div dangerouslySetInnerHTML={{ __html: cleanContent(question.question) }} />
                        </div>

                        <div className="qa-divider"></div>

                        <div className="qa-answer">
                          <strong>Answer:</strong>
                          <div dangerouslySetInnerHTML={{ __html: cleanContent(question.answer) }} />
                        </div>
                      </div>

                      {/* Admin Actions - Bottom Right */}
                      {user?.role === 'admin' && (
                        <div className="admin-actions">
                          <button
                            onClick={() => navigate(`/edit-question/${question.id}`)}
                            className="action-btn edit-btn"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setQuestionToDelete(question);
                              setShowDeleteModal(true);
                            }}
                            className="action-btn remove-btn"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-results">
                No questions found for this selection.
              </div>
            )
          ) : (
            <div className="instruction-placeholder">
              Please select a Course and Subject to view questions.
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && questionToDelete && (
          <DeleteQuestionModal
            question={questionToDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setQuestionToDelete(null);
            }}
            onConfirm={async (questionId) => {
              try {
                await deleteQuestion(questionId);
                setShowDeleteModal(false);
                setQuestionToDelete(null);
              } catch (err) {
                alert("Failed to delete question.");
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Questions;
