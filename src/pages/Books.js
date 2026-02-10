import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import { useAuth } from "../context/AuthContext";
import RemoveBookModal from "../components/RemoveBookModal";
import BookCard from "../components/BookCard";
import Loader from "../components/Loader";
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

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "BCA", "DCA", "PGDCA"];

  // Filter books based on search query and category
  const filteredBooks = books.filter(book => {
    const matchesSearch = searchQuery
      ? (book.title && book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.title.localeCompare(b.title));

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
        {loading && <Loader text="Loading library..." size={150} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Available Books</h1>
          {canAddBook && (
            <div className="add-book-action">
              <Link to="/add-book" className="add-book-btn">Add New Book</Link>
            </div>
          )}
        </div>

        {/* Category Filter UI */}
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
