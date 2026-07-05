import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import { useQuestions } from "../context/QuestionContext";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";
import RemoveBookModal from "../components/RemoveBookModal";
import ConfirmationModal from "../components/ConfirmationModal";
import Loader from "../components/Loader";
import useSEO from "../utils/useSEO";
import "./Books.css";
import "./Questions.css";
import "./ProgrammingSolutions.css";
import "./Search.css";

// Normalises old single-solution books into a 1-item array
const normalizeSolutions = (book) => {
  if (Array.isArray(book?.programmingSolutions) && book.programmingSolutions.length > 0) {
    return book.programmingSolutions;
  }
  if (book?.programmingSolution && Object.keys(book.programmingSolution).length > 0) {
    return [{ ...book.programmingSolution, id: "legacy" }];
  }
  return [];
};

function Search({ searchQuery }) {
  const { books, removeBook, updateBook, deleteProgrammingSolution, loading } = useBooks(); 
  const { questionPdfs, deleteQuestionPdf } = useQuestions();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modals for Book Removal (if admin removes from search page)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  // Modals for Solution Removal
  const [deleteSolutionTarget, setDeleteSolutionTarget] = useState(null);
  const [isDeletingSolution, setIsDeletingSolution] = useState(false);

  // Modals for Question Removal
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  // Pagination limits
  const [booksLimit, setBooksLimit] = useState(8);
  const [questionsLimit, setQuestionsLimit] = useState(7);
  const [solutionsLimit, setSolutionsLimit] = useState(7);
  const formatQuestionDate = (pdf) => [pdf.month, pdf.year].filter(Boolean).join(' ');

  useSEO({
    title: 'Search Results',
    description: 'Search across books, questions, and programming solutions on ExamFobiya.',
    path: '/#/search'
  });

  // Reset limits when search changes
  React.useEffect(() => {
    setBooksLimit(8);
    setQuestionsLimit(7);
    setSolutionsLimit(7);
  }, [searchQuery]);

  // Filter books
  const filteredBooks = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return books.filter(book =>
      (book.title && book.title.toLowerCase().includes(q)) ||
      (book.author && book.author.toLowerCase().includes(q)) ||
      (book.category && book.category.toLowerCase().includes(q)) ||
      (book.semester && book.semester.toLowerCase().includes(q)) ||
      (book.description && book.description.toLowerCase().includes(q))
    ).sort((a, b) => a.title.localeCompare(b.title));
  }, [searchQuery, books]);

  // Filter questions
  const filteredQuestions = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return questionPdfs.filter(pdf => 
      (pdf.subject && pdf.subject.toLowerCase().includes(q)) ||
      (pdf.course && pdf.course.toLowerCase().includes(q)) ||
      (pdf.label && pdf.label.toLowerCase().includes(q)) ||
      (pdf.month && pdf.month.toLowerCase().includes(q))
    );
  }, [searchQuery, questionPdfs]);

  // Filter programming solutions
  const filteredSolutions = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    const rows = [];
    books.filter(book => book.hasProgrammingSolution).forEach(book => {
      normalizeSolutions(book).forEach(solution => {
        const matches =
          (book.title && book.title.toLowerCase().includes(q)) ||
          (book.category && book.category.toLowerCase().includes(q)) ||
          (solution.title && solution.title.toLowerCase().includes(q)) ||
          (solution.language && solution.language.toLowerCase().includes(q)) ||
          (solution.description && solution.description.toLowerCase().includes(q));
        if (matches) {
          rows.push({ book, solution, rowId: `${book.id}__${solution.id}` });
        }
      });
    });
    return rows;
  }, [searchQuery, books]);

  const canAddBook = user && user.role === 'admin';

  // Book Removal Handlers
  const handleRemoveClick = (book) => {
    setBookToRemove(book);
    setIsRemoveModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRemoveModalOpen(false);
  };

  const handleConfirmRemove = ({ bookId, sectionsToRemove, removeFromAll }) => {
    if (removeFromAll) {
      removeBook(bookId);
    } else if (sectionsToRemove && sectionsToRemove.length > 0) {
      const book = books.find(b => b.id === bookId);
      if (book) {
        const currentSections = book.sections || [];
        const updatedSections = currentSections.filter(s => !sectionsToRemove.includes(s));
        updateBook(bookId, { sections: updatedSections });
      }
    }
    setIsRemoveModalOpen(false);
    setBookToRemove(null);
  };

  const handleDeleteSolution = async () => {
    if (!deleteSolutionTarget) return;
    setIsDeletingSolution(true);
    try {
      await deleteProgrammingSolution(deleteSolutionTarget.bookId, deleteSolutionTarget.solutionId);
    } catch (error) {
      console.error("Error deleting programming solution:", error);
    } finally {
      setIsDeletingSolution(false);
      setDeleteSolutionTarget(null);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionTarget) return;
    setIsDeletingQuestion(true);
    try {
      await deleteQuestionPdf(deleteQuestionTarget.docPath);
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      setIsDeletingQuestion(false);
      setDeleteQuestionTarget(null);
    }
  };

  if (!searchQuery) {
    return (
      <div className="search-results-page">
        <div className="search-header-container">
          <h1 style={{ marginBottom: "15px" }}>Search</h1>
          <p className="search-summary-text" style={{ margin: 0 }}>Type something in the navbar to begin your search.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-header-container">
        <h1 style={{ marginBottom: "15px", textAlign: "center" }}>Search Results</h1>
        <p className="search-summary-text" style={{ margin: 0, padding: 0, background: "transparent", backdropFilter: "none", boxShadow: "none" }}>
          Showing results for: "{searchQuery}"<br />
          <span style={{ fontSize: '0.9rem', marginTop: '5px', display: 'block' }}>
            Found {filteredBooks.length} Books, {filteredQuestions.length} Questions &amp; {filteredSolutions.length} Solutions
          </span>
        </p>
      </div>

      {loading && <Loader text="Searching database..." size={150} />}

      {/* --- BOOKS SECTION --- */}
      {filteredBooks.length > 0 && (
        <div className="search-section-block">
          <h2 className="search-section-heading">Books</h2>
          <div className="books-grid">
            {filteredBooks.slice(0, booksLimit).map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                index={index}
                canEdit={canAddBook}
                onRemove={(b) => handleRemoveClick(b)}
                onEdit={() => { }}
              />
            ))}
          </div>

          {filteredBooks.length > booksLimit && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setBooksLimit(prev => prev + 12)}
                className="search-view-more-btn"
              >
                View More Books ({filteredBooks.length - booksLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- QUESTIONS SECTION --- */}
      {filteredQuestions.length > 0 && (
        <div className="search-section-block">
          <h2 className="search-section-heading">Questions</h2>
          <div className="pdf-results-list">
            {filteredQuestions.slice(0, questionsLimit).map(pdf => (
              <div key={pdf.id} className="pdf-result-card-row">

                <div className="pdf-row-info">
                  <span className="pdf-card-course">{pdf.course}</span>
                  <div className="pdf-row-details">
                    <span className="pdf-card-subject">{pdf.subject}</span>
                    {(pdf.label || pdf.month || pdf.year) && (
                      <span className="pdf-card-label-row">
                        {[pdf.label, formatQuestionDate(pdf)].filter(Boolean).join(' | ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pdf-row-actions">
                  {user?.role === 'admin' && (
                    <>
                    <button
                      className="pdf-edit-btn"
                      onClick={(e) => { e.stopPropagation(); navigate('/edit-question-pdf', { state: { pdf } }); }}
                    >
                      Edit
                    </button>
                    <button
                      className="pdf-edit-btn solution-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDeleteQuestionTarget(pdf); }}
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

          {filteredQuestions.length > questionsLimit && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setQuestionsLimit(prev => prev + 10)}
                className="search-view-more-btn"
              >
                View More Questions ({filteredQuestions.length - questionsLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- PROGRAMMING SOLUTIONS SECTION --- */}
      {filteredSolutions.length > 0 && (
        <div className="search-section-block">
          <h2 className="search-section-heading">Programming Solutions</h2>
          <div className="pdf-results-list">
            {filteredSolutions.slice(0, solutionsLimit).map(({ book, solution, rowId }) => (
              <div key={rowId} className="pdf-result-card-row solution-result-card">
                <div className="pdf-row-info">
                  <span className="pdf-card-course">{book.category || book.semester || "All"}</span>
                  <div className="pdf-row-details">
                    <div className="pdf-card-top-row">
                      <span className="pdf-card-subject">{book.title}</span>
                      {solution.language && <span className="pdf-card-subject">| {solution.language}</span>}
                    </div>
                  </div>
                </div>

                <div className="solution-text-content">
                  {solution.title && (
                    <span className="pdf-card-label-row">{solution.title}</span>
                  )}
                  {solution.description && (
                    <p className="solution-description solution-inline-description">{solution.description}</p>
                  )}
                </div>

                <div className="pdf-row-actions">
                  {user?.role === "admin" && (
                    <>
                      <button
                        type="button"
                        className="pdf-edit-btn"
                        onClick={() => navigate(`/edit-programming-solution/${book.id}/${solution.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pdf-edit-btn solution-delete-btn"
                        onClick={() => setDeleteSolutionTarget({ bookId: book.id, solutionId: solution.id, title: solution.title || book.title })}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="pdf-card-open-row solution-toggle-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/programming-solutions`);
                  }}
                >
                  View Solution
                </button>
              </div>
            ))}
          </div>

          {filteredSolutions.length > solutionsLimit && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setSolutionsLimit(prev => prev + 10)}
                className="search-view-more-btn"
              >
                View More Solutions ({filteredSolutions.length - solutionsLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* NO RESULTS */}
      {filteredBooks.length === 0 && filteredQuestions.length === 0 && filteredSolutions.length === 0 && !loading && (
        <div className="search-no-results">
          <h2>No matching results found</h2>
          <p>Try exploring other subjects or courses!</p>
        </div>
      )}

      {isRemoveModalOpen && (
        <RemoveBookModal
          book={bookToRemove}
          onClose={handleCloseModal}
          onConfirm={handleConfirmRemove}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteSolutionTarget}
        onClose={() => setDeleteSolutionTarget(null)}
        onConfirm={handleDeleteSolution}
        title="Delete Programming Solution"
        message={`Are you sure you want to delete "${deleteSolutionTarget?.title}"? This action cannot be undone.`}
        confirmLabel={isDeletingSolution ? "Deleting..." : "Yes, Delete"}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={!!deleteQuestionTarget}
        onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question PDF"
        message={`Are you sure you want to delete "${deleteQuestionTarget?.label || deleteQuestionTarget?.url}" for ${deleteQuestionTarget?.subject}?`}
        confirmLabel={isDeletingQuestion ? "Deleting..." : "Yes, Delete"}
        variant="danger"
      />
    </div>
  );
}

export default Search;
