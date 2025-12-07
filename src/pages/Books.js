import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import { useAuth } from "../context/AuthContext";
import RemoveBookModal from "../components/RemoveBookModal";
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
  const { books, removeBook, updateBook } = useBooks(); // Added updateBook
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState(null);

  // Modal state
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  // Filter books based on search query
  const filteredBooks = books.filter(book =>
    searchQuery
      ? book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const canAddBook = user && (user.role === 'admin' || user.role === 'developer');

  const handleRemoveClick = (e, book) => {
    e.stopPropagation();
    setBookToRemove(book);
    setIsRemoveModalOpen(true);
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

  return (
    <div className="books-page">
      <div className="books-content">
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
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="book-card"
              onClick={() => setSelectedBook(book)}
              style={{ position: 'relative' }}
            >
              <img src={book.image} alt={book.title} />
              <h3>{book.title}</h3>
              {/* <p>{book.author}</p> REMOVED AUTHOR */}

              {canAddBook && (
                <>
                  <Link
                    to={`/edit-book/${book.id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '90px', // Spaced from Remove button
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      zIndex: 10,
                      textDecoration: 'none',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                  >
                    Edit
                  </Link>

                  <button
                    onClick={(e) => handleRemoveClick(e, book)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      zIndex: 10,
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedBook && (
        <div className="book-modal">
          <div className="book-modal-content">
            <span className="close-btn" onClick={() => setSelectedBook(null)}>
              &times;
            </span>
            <h2>{selectedBook.title}</h2>
            {/* <p><strong>Author:</strong> {selectedBook.author}</p> REMOVED */}
            <p><strong>Description:</strong> {selectedBook.description}</p>
            <p><strong>Contents:</strong> {selectedBook.contents}</p>
          </div>
        </div>
      )}

      {isRemoveModalOpen && (
        <RemoveBookModal
          book={bookToRemove}
          onClose={() => setIsRemoveModalOpen(false)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  );
}

export default Books;
