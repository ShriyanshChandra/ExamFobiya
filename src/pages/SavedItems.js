import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBooks } from "../context/BookContext";
import { useQuestions } from "../context/QuestionContext";
import ConfirmationModal from "../components/ConfirmationModal";
import BookCard from "../components/BookCard";
import useSEO from "../utils/useSEO";
import "./SavedItems.css";

const SavedItems = () => {
  const [activeTab, setActiveTab] = useState("books");
  const [bookFilter, setBookFilter] = useState("All");
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [removeError, setRemoveError] = useState("");
  const { user, toggleSavedItem } = useAuth();
  const { books } = useBooks();
  const { questionPdfs } = useQuestions();
  const navigate = useNavigate();
  const bookFilters = ["All", "BCA", "DCA", "PGDCA"];
  const formatQuestionDate = (pdf) => [pdf.month, pdf.year].filter(Boolean).join(" ");

  useSEO({
    title: 'Saved Items',
    description: 'View your saved books and question papers on ExamFobiya.',
    path: '/#/saved-items'
  });

  const savedBooks = useMemo(() => {
    const savedBookIds = user?.savedBooks || user?.savedBookIds || [];
    return books.filter((book) => savedBookIds.includes(book.id));
  }, [books, user]);

  const filteredSavedBooks = useMemo(() => {
    if (bookFilter === "All") {
      return savedBooks;
    }

    return savedBooks.filter((book) => book.category === bookFilter);
  }, [bookFilter, savedBooks]);

  const savedQuestions = useMemo(() => {
    const savedQuestionIds = user?.savedQuestions || user?.savedQuestionIds || user?.savedQuestionPdfs || [];
    return questionPdfs.filter((pdf) => savedQuestionIds.includes(pdf.id) || savedQuestionIds.includes(pdf.docPath));
  }, [questionPdfs, user]);

  const getSavedQuestionId = (pdf) => {
    const savedQuestionIds = user?.savedQuestions || user?.savedQuestionIds || user?.savedQuestionPdfs || [];

    if (pdf.docPath && savedQuestionIds.includes(pdf.docPath)) {
      return pdf.docPath;
    }

    if (pdf.id && savedQuestionIds.includes(pdf.id)) {
      return pdf.id;
    }

    return pdf.docPath || pdf.id;
  };

  const requestRemoval = (type, item) => {
    setRemoveError("");
    setPendingRemoval({ type, item });
  };

  const closeRemovalModal = () => {
    setPendingRemoval(null);
  };

  const confirmRemoval = async () => {
    if (!pendingRemoval) {
      return;
    }

    const { type, item } = pendingRemoval;
    const itemId = type === "book" ? item.id : getSavedQuestionId(item);

    try {
      await toggleSavedItem(type, itemId);
      setPendingRemoval(null);
    } catch (error) {
      console.error("Error removing saved item:", error);
      setRemoveError("Could not remove this item from saved items. Please try again.");
      setPendingRemoval(null);
    }
  };

  const pendingRemovalName = pendingRemoval?.type === "book"
    ? pendingRemoval.item.title
    : pendingRemoval?.item.subject || pendingRemoval?.item.label || "this question PDF";

  return (
    <div className="saved-items-page">
      <div className="saved-items-shell">
        <header className="saved-items-header">
          <div>
            <span className="saved-items-eyebrow">Account Library</span>
            <h1>Saved Items</h1>
            <p>Keep your important books and question PDFs in one focused place.</p>
          </div>
          <div className="saved-items-summary" aria-label="Saved item counts">
            <div>
              <strong>{savedBooks.length}</strong>
              <span>Books</span>
            </div>
            <div>
              <strong>{savedQuestions.length}</strong>
              <span>Questions</span>
            </div>
          </div>
        </header>

        <div className="saved-tabs" role="tablist" aria-label="Saved item type">
          <button
            type="button"
            className={activeTab === "books" ? "active" : ""}
            onClick={() => setActiveTab("books")}
            role="tab"
            aria-selected={activeTab === "books"}
          >
            Saved Books
          </button>
          <button
            type="button"
            className={activeTab === "questions" ? "active" : ""}
            onClick={() => setActiveTab("questions")}
            role="tab"
            aria-selected={activeTab === "questions"}
          >
            Saved Questions
          </button>
        </div>

        {removeError && <p className="saved-remove-error">{removeError}</p>}

        {activeTab === "books" && (
          savedBooks.length > 0 ? (
            <>
              <div className="saved-book-filters" aria-label="Filter saved books by course">
                {bookFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={bookFilter === filter ? "active" : ""}
                    onClick={() => setBookFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {filteredSavedBooks.length > 0 ? (
                <div className="saved-grid">
                  {filteredSavedBooks.map((book, index) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      index={index}
                      onSaveClick={(selectedBook) => requestRemoval("book", selectedBook)}
                    />
                  ))}
                </div>
              ) : (
                <div className="saved-empty-state">
                  <h2>No saved {bookFilter} books yet.</h2>
                  <p>Switch filters or save a {bookFilter} book from the library.</p>
                  <button type="button" onClick={() => setBookFilter("All")}>Show All</button>
                </div>
              )}
            </>
          ) : (
            <div className="saved-empty-state">
              <h2>No saved books yet.</h2>
              <p>Tap the bookmark on any book to keep it here for quick access.</p>
              <button type="button" onClick={() => navigate("/books")}>Browse Books</button>
            </div>
          )
        )}

        {activeTab === "questions" && (
          savedQuestions.length > 0 ? (
            <div className="saved-list">
              {savedQuestions.map((pdf) => (
                <article key={pdf.docPath || pdf.id} className="saved-question-row">
                  <div className="saved-question-info">
                    <button
                      type="button"
                      className="saved-bookmark-btn saved inline"
                      onClick={() => requestRemoval("question", pdf)}
                      aria-label={`Remove ${pdf.subject || pdf.label || "question"} from saved questions`}
                      aria-pressed={true}
                      title="Remove from saved questions"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 3.75C6 2.78 6.78 2 7.75 2h8.5C17.22 2 18 2.78 18 3.75V21l-6-3.5L6 21V3.75Z" />
                      </svg>
                    </button>
                    <div>
                      <span className="saved-card-meta">{pdf.course || "Question PDF"}</span>
                      <h2>{pdf.subject || pdf.label || "Saved Question"}</h2>
                      <p>{[pdf.label, formatQuestionDate(pdf)].filter(Boolean).join(" | ")}</p>
                    </div>
                  </div>
                  {pdf.url && (
                    <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                      Open PDF
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="saved-empty-state">
              <h2>No saved questions yet.</h2>
              <p>Tap the bookmark beside a question PDF to collect it here.</p>
              <button type="button" onClick={() => navigate("/questions")}>Find Questions</button>
            </div>
          )
        )}
      </div>

      <ConfirmationModal
        isOpen={Boolean(pendingRemoval)}
        onClose={closeRemovalModal}
        onConfirm={confirmRemoval}
        title="Remove Saved Item?"
        message={`Are you sure you want to remove "${pendingRemovalName}" from your saved items?`}
        variant="danger"
        confirmLabel="Yes, Remove"
      />
    </div>
  );
};

export default SavedItems;
