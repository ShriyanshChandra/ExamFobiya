import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import { useAuth } from "../context/AuthContext";
import RemoveBookModal from "../components/RemoveBookModal";
import BookCard from "../components/BookCard";
import "./Books.css";

// Search results styling
const searchResultsStyle = `
.search-results {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
}
.add-book-action {
    margin-bottom: 20px;
    text-align: right;
}
.add-book-btn {
    background-color: #ffd700;
    color: #182848;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    display: inline-block;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.add-book-btn:hover {
    background-color: #ffed4a;
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
    color: #182848;
}
`;

// Add styles to head
const styleSheet = document.createElement("style");
styleSheet.innerText = searchResultsStyle;
document.head.appendChild(styleSheet);



function Books({ searchQuery }) {
  const { books, removeBook, updateBook, loading } = useBooks(); // Added updateBook, loading
  const { user } = useAuth();
  // removed local selectedBook and location logic as we use global state now

  // Modal state
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  // Filter books based on search query
  const filteredBooks = books.filter(book =>
    searchQuery
      ? (book.title && book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const canAddBook = user && (user.role === 'admin' || user.role === 'developer');

  const handleRemoveClick = (book) => {
    console.log("Removing book:", book?.title);
    setBookToRemove(book);
    setIsRemoveModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal (handleCloseModal called)");
    setIsRemoveModalOpen(false);
  };

  const handleConfirmRemove = ({ bookId, sectionsToRemove, removeFromAll }) => {
    if (removeFromAll) {
      removeBook(bookId);
    } else if (sectionsToRemove && sectionsToRemove.length > 0) {
      // Find the book to get its current sections
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

  console.log("Books render. Modal open:", isRemoveModalOpen);

  return (
    <div className="books-page">
      <div className="books-content">
        {loading && <p style={{ textAlign: "center", padding: "2rem" }}>Loading library...</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Available Books</h1>
          {canAddBook && (
            <div className="add-book-action">
              <Link to="/add-book" className="add-book-btn">Add New Book</Link>
            </div>
          )}
        </div>

        {searchQuery && (
          <p className="search-results">
            Showing results for: "{searchQuery}" ({filteredBooks.length} books found)
          </p>
        )}
        <div className="books-grid">
          {filteredBooks.map((book, index) => (
            <BookCard
              key={book.id}
              book={book}
              index={index}
              canEdit={canAddBook}
              onRemove={(b) => handleRemoveClick(b)} // Wrap to avoid event object issue if any
              onEdit={() => { }} // Link is handled inside BookCard if canEdit is true
            />
          ))}
        </div>
      </div>

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

export default Books;
