import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import { useAuth } from "../context/AuthContext";
import RemoveBookModal from "../components/RemoveBookModal";
import BookCard from "../components/BookCard";
import Loader from "../components/Loader";
import "./Books.css";

function Books() {
  const { books, removeBook, updateBook, loading } = useBooks();
  const { user } = useAuth();
  
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "BCA", "DCA", "PGDCA"];

  const filteredBooks = books.filter(book => {
    return selectedCategory === "All" || book.category === selectedCategory;
  }).sort((a, b) => a.title.localeCompare(b.title));

  const canAddBook = user && (user.role === 'admin' || user.role === 'developer');

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

  return (
    <div className="books-page">
      <div className="books-content">
        {loading && <Loader text="Loading library..." size={150} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Available Books</h1>
          {canAddBook && (
            <div className="add-book-action">
              <Link to="/add-book" className="add-book-btn">Add New Book</Link>
            </div>
          )}
        </div>

        <div className="category-filter-container" style={{ marginBottom: '20px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                marginRight: '10px',
                backgroundColor: selectedCategory === cat ? '#ffd700' : '#f0f0f0',
                color: selectedCategory === cat ? '#333' : '#666',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="books-grid">
          {filteredBooks.map((book, index) => (
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
