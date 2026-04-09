import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import { useQuestions } from "../context/QuestionContext";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";
import RemoveBookModal from "../components/RemoveBookModal";
import Loader from "../components/Loader";
import "./Books.css";
import "./Questions.css";
import "./Search.css";

function Search({ searchQuery }) {
  const { books, removeBook, updateBook, loading } = useBooks(); 
  const { questionPdfs } = useQuestions();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modals for Book Removal (if admin removes from search page)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  // Pagination limits
  const [booksLimit, setBooksLimit] = useState(8);
  const [questionsLimit, setQuestionsLimit] = useState(7);

  // Reset limits when search changes
  React.useEffect(() => {
    setBooksLimit(8);
    setQuestionsLimit(7);
  }, [searchQuery]);

  // Filter books
  const filteredBooks = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return books.filter(book => 
      (book.title && book.title.toLowerCase().includes(q)) ||
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
      (pdf.label && pdf.label.toLowerCase().includes(q))
    );
  }, [searchQuery, questionPdfs]);

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

  if (!searchQuery) {
    return (
      <div className="search-results-page">
        <h1 style={{ marginBottom: "20px" }}>Search</h1>
        <p className="search-summary-text">Type something in the navbar to begin your search.</p>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <h1 style={{ marginBottom: "10px" }}>Search Results</h1>
      <p className="search-summary-text">
        Showing results for: "{searchQuery}"<br />
        <span style={{ fontSize: '0.9rem', marginTop: '5px', display: 'block' }}>
          Found {filteredBooks.length} Books &amp; {filteredQuestions.length} Questions
        </span>
      </p>

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
          <h2 className="search-section-heading">Papers &amp; Questions</h2>
          <div className="pdf-results-list">
            {filteredQuestions.slice(0, questionsLimit).map(pdf => (
              <div key={pdf.id} className="pdf-result-card-row">

                <div className="pdf-row-info">
                  <span className="pdf-card-course">{pdf.course}</span>
                  <div className="pdf-row-details">
                    <span className="pdf-card-subject">{pdf.subject}</span>
                    {pdf.label && <span className="pdf-card-label-row">| {pdf.label}</span>}
                    {pdf.year && <span className="pdf-card-year-row">📅 {pdf.year}</span>}
                  </div>
                </div>

                <div className="pdf-row-actions">
                  {user?.role === 'admin' && (
                    <button
                      className="pdf-edit-btn"
                      onClick={(e) => { e.stopPropagation(); navigate('/edit-question-pdf', { state: { pdf } }); }}
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

      {/* NO RESULTS */}
      {filteredBooks.length === 0 && filteredQuestions.length === 0 && !loading && (
        <div className="search-no-results">
          <h2>No matching results found 😞</h2>
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
    </div>
  );
}

export default Search;
