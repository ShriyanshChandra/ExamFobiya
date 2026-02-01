import React, { useState, useEffect } from "react";
import { useBooks } from "../context/BookContext";
import "./Questions.css";

const MOCK_QUESTIONS = [
  // BCA
  {
    id: 1,
    course: "BCA",
    semester: 1,
    subject: "Computer Fundamental and MS-Office",
    university: "University 1",
    year: 2023,
    title: "BCA 1st Sem CF & MS-Office 2023",
    questions: [
      "Q1. What is a Computer? Explain its block diagram.",
      "Q2. Explain valid and invalid variable names in C.",
      "Q3. What is an Operating System? Explain its types.",
      "Q4. Explain the difference between Compiler and Interpreter.",
      "Q5. Write a short note on MS-Word."
    ]
  },
  {
    id: 2,
    course: "BCA",
    semester: 5,
    subject: "AI and Expert System",
    university: "University 2",
    year: 2023,
    title: "BCA 5th Sem AI 2023",
    questions: [
      "Q1. Define Artificial Intelligence.",
      "Q2. Explain various search techniques.",
      "Q3. What is an Expert System?",
      "Q4. Explain Neural Networks.",
      "Q5. Write a note on Fuzzy Logic."
    ]
  },
  {
    id: 3,
    course: "BCA",
    semester: 6,
    subject: "Computer Security and Cyber Law",
    university: "University 1",
    year: 2022,
    title: "BCA 6th Sem Cyber Law 2022",
    questions: [
      "Q1. What is Cyber Crime?",
      "Q2. Explain Digital Signature.",
      "Q3. What is a Virus? Explain its types.",
      "Q4. Explain IT Act 2000.",
      "Q5. Write a note on Firewall."
    ]
  },

  // DCA
  {
    id: 4,
    course: "DCA",
    semester: 1,
    subject: "Programming in C",
    university: "University 2",
    year: 2023,
    title: "DCA 1st Sem C Prog 2023",
    questions: [
      "Q1. Explain Data Types in C.",
      "Q2. Write a program to find the factorial of a number.",
      "Q3. Explain Loops in C.",
      "Q4. What is a Pointer?",
      "Q5. Explain File Handling in C."
    ]
  },
  {
    id: 5,
    course: "DCA",
    semester: 2,
    subject: "Internet and Web Technology",
    university: "University 1",
    year: 2023,
    title: "DCA 2nd Sem Web Tech 2023",
    questions: [
      "Q1. What is HTML? Explain its structure.",
      "Q2. Explain CSS and its types.",
      "Q3. What is JavaScript?",
      "Q4. Explain Forms in HTML.",
      "Q5. Write a note on Web Hosting."
    ]
  },
  {
    id: 6,
    course: "DCA",
    semester: 2,
    subject: "Print Technology and Desktop Publishing",
    university: "University 2",
    year: 2022,
    title: "DCA 2nd Sem DTP 2022",
    questions: [
      "Q1. What is DTP?",
      "Q2. Explain Offset Printing.",
      "Q3. What is PageMaker?",
      "Q4. Explain CorelDraw tools.",
      "Q5. Write a note on Photoshop."
    ]
  },

  // PGDCA
  {
    id: 7,
    course: "PGDCA",
    semester: 1,
    subject: "Fundamental of Computer and Information Technology",
    university: "University 1",
    year: 2023,
    title: "PGDCA 1st Sem FCIT 2023",
    questions: [
      "Q1. Explain Generations of Computer.",
      "Q2. What is Memory? Explain its types.",
      "Q3. Explain Input and Output Devices.",
      "Q4. What is Software? Explain its types.",
      "Q5. Write a note on Internet."
    ]
  },
  {
    id: 8,
    course: "PGDCA",
    semester: 2,
    subject: "System Analysis and Design",
    university: "University 2",
    year: 2023,
    title: "PGDCA 2nd Sem SAD 2023",
    questions: [
      "Q1. What is SDLC?",
      "Q2. Explain Feasibility Study.",
      "Q3. What is DFD?",
      "Q4. Explain Testing.",
      "Q5. Write a note on Implementation."
    ]
  },
  {
    id: 9,
    course: "PGDCA",
    semester: 2,
    subject: "Relational Database Management System",
    university: "University 1",
    year: 2022,
    title: "PGDCA 2nd Sem RDBMS 2022",
    questions: [
      "Q1. What is DBMS?",
      "Q2. Explain Normalization.",
      "Q3. What is SQL?",
      "Q4. Explain ER Diagram.",
      "Q5. Write a note on Keys in DBMS."
    ]
  }
];

const Questions = () => {
  const { books } = useBooks(); // Use BookContext
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

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

  // Filter Logic - Using MOCK_QUESTIONS for now as implementation asks to filter distinct Question items
  // But logic for filter remains same
  const filteredQuestions = MOCK_QUESTIONS.filter(question => {
    if (selectedCourse && question.course !== selectedCourse) return false;
    // Note: MOCK_QUESTIONS need to match book titles if we want subject filter to work perfectly
    // For now, if user selects a subject from dropdown (which comes from books), 
    // it will try to match question.subject
    if (selectedSubject && question.subject !== selectedSubject) return false;
    if (selectedUniversity && question.university !== selectedUniversity) return false;
    if (selectedYear && question.year.toString() !== selectedYear) return false;
    if (searchQuery && !question.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const showResults = !!selectedCourse || !!searchQuery;

  return (
    <div className="questions-container">
      <div className="questions-content">
        <h2>Previous Year Questions</h2>
        <p className="subtitle">Select your course details to find question papers</p>

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
              <option value="">All Subjects</option>
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
              <option value="">All Universities</option>
              <option value="University 1">University 1</option>
              <option value="University 2">University 2</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="secondary-select"
            >
              <option value="">All Years</option>
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
                        <h3>{question.title}</h3>
                        <div className="question-meta">
                          <span>{question.university}</span>
                          <span>•</span>
                          <span>{question.year}</span>
                        </div>
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
                            <li key={index}>{q}</li>
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
    </div>
  );
};

export default Questions;
