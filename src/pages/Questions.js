import React, { useState, useEffect } from "react";
import { useBooks } from "../context/BookContext";
import { useQuestions } from "../context/QuestionContext"; // Import QuestionContext
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Questions.css";

import AnswerModal from "../components/AnswerModal"; // Import AnswerModal

const Questions = () => {
  const { books } = useBooks(); // Use BookContext
  const { questions } = useQuestions(); // Use QuestionContext
  const navigate = useNavigate(); // Hook for navigation

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // AI Answer Modal State
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);

  const handleGetAnswer = (questionText) => {
    setCurrentQuestion(questionText);
    setIsAnswerModalOpen(true);
    setAnswerLoading(true);

    // Mock AI API Call
    setTimeout(() => {
      const mockAnswer = `Here is a sample AI explanation for: "${questionText}"\n\nThis is a generated placeholder answer. In a real implementation, this would call an AI API (like OpenAI or Gemini) to provide a detailed explanation.\n\nKey Concepts:\n1. Concept A\n2. Concept B\n3. Application`;
      setCurrentAnswer(mockAnswer);
      setAnswerLoading(false);
    }, 1500);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    setSelectedSubject("");
  }, [selectedCourse]);

  // Derived options from Books Data
  const courses = [...new Set(books.map(book => book.category).filter(Boolean))];

  const subjects = selectedCourse
    ? [...new Set(books.filter(book => book.category === selectedCourse).map(book => book.title).filter(Boolean))]
    : [];

  // Filter Logic
  const filteredQuestions = questions.filter(question => {
    if (selectedCourse && question.course !== selectedCourse) return false;
    // Note: questions need to match book titles if we want subject filter to work perfectly
    // For now, if user selects a subject from dropdown (which comes from books), 
    // it will try to match question.subject
    if (selectedSubject && question.subject !== selectedSubject) return false;
    if (selectedUniversity && question.university !== selectedUniversity) return false;
    if (selectedUniversity && question.university !== selectedUniversity) return false;
    if (selectedYear && question.year.toString() !== selectedYear) return false;

    // Search in Tags (if available) or Title (fallback)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const tagsMatch = question.tags && question.tags.some(tag => tag.toLowerCase().includes(query));
      const titleMatch = question.title && question.title.toLowerCase().includes(query);
      const subjectMatch = question.subject && question.subject.toLowerCase().includes(query);

      if (!tagsMatch && !titleMatch && !subjectMatch) return false;
    }
    return true;
  });

  const showResults = !!selectedCourse || !!searchQuery;

  return (
    <div className="questions-container">
      <div className="questions-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2>Previous Year Questions</h2>
            <p className="subtitle">Select your course details to find question papers</p>
          </div>
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
        </div>

        {/* Global Search */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="questions-search-input"
            />
            <button className="questions-search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="filters-grid">
          {/* Course Selection */}
          <div className="filter-group">
            <label>Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="filter-select"
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div className="filter-group">
            <label>Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="filter-select"
              disabled={!selectedCourse}
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Filters (University/Year) */}
        <div className="secondary-filters">
          <div className="dropdown-filters">
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="secondary-select"
            >
              <option value="">Select University</option>
              <option value="University 1">University 1</option>
              <option value="University 2">University 2</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="secondary-select"
            >
              <option value="">Select Year</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>
        </div>

        {/* Results Area */}
        <div className="questions-results">
          {showResults ? (
            filteredQuestions.length > 0 ? (
              <div className="questions-grid">
                {filteredQuestions.map(question => (
                  <div key={question.id} className={`question-card ${expandedId === question.id ? 'expanded' : ''}`}>
                    <div className="question-header">
                      <div className="question-icon">📄</div>
                      <div className="question-info">
                        <h3>{question.subject || question.title}</h3>
                        <div className="question-meta">
                          <span>{question.university}</span>
                          <span>•</span>
                          <span>{question.year}</span>
                        </div>
                        {question.tags && question.tags.length > 0 && (
                          <div className="question-tags" style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
                            {question.tags.map((tag, idx) => (
                              <span key={idx} style={{
                                backgroundColor: '#e0efff',
                                color: '#007bff',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem'
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        className="download-btn"
                        onClick={() => toggleExpand(question.id)}
                      >
                        {expandedId === question.id ? 'Hide Questions' : 'Show Questions'}
                      </button>
                    </div>
                    {expandedId === question.id && (
                      <div className="questions-list">
                        <h4>Questions:</h4>
                        <ul>
                          {question.questions?.map((q, index) => (
                            <li key={index} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{q}</span>
                              <button
                                className="download-btn"
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '5px 10px',
                                  marginLeft: '10px',
                                  backgroundColor: '#ffd700',
                                  color: '#182848',
                                  border: 'none'
                                }}
                                onClick={() => handleGetAnswer(q)}
                              >
                                Get Answer ✨
                              </button>
                            </li>
                          )) || <li>No questions available.</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                No questions found for this selection.
              </div>
            )
          ) : (
            <div className="instruction-placeholder">
              Please select a Course or Search to view questions.
            </div>
          )}
        </div>
      </div>

      <AnswerModal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        question={currentQuestion}
        answer={currentAnswer}
        loading={answerLoading}
      />
    </div>
  );
};

export default Questions;
