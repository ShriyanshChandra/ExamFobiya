import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import { useAuth } from "../context/AuthContext";
import RemoveBookModal from "../components/RemoveBookModal";
import BookCard from "../components/BookCard";
import Loader from "../components/Loader";
import useSEO from "../utils/useSEO";
import "./Books.css";

function Books() {
  const { books, removeBook, updateBook, loading } = useBooks();
  const { user } = useAuth();
  const location = useLocation();

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || "All");
  const [selectedSemester, setSelectedSemester] = useState(location.state?.semester || "All");
  const [searchTerm, setSearchTerm] = useState(location.state?.search || "");
  const [sortBy, setSortBy] = useState("title-asc");

  const categories = ["All", "BCA", "DCA", "PGDCA"];
  const semesters = ["All", "BCA 1st Semester", "BCA 2nd Semester", "BCA 3rd Semester", "BCA 4th Semester", "BCA 5th Semester", "BCA 6th Semester", "BCA 7th Semester", "BCA 8th Semester"];
  const canAddBook = user && user.role === "admin";

  useSEO({
    title: 'Books Library',
    description: 'Browse and discover BCA, DCA, and PGDCA textbooks. Filter by course, semester, and search by title or author.',
    path: '/books'
  });

  const filteredBooks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleBooks = books.filter((book) => {
      const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
      const matchesSemester =
        selectedCategory !== "BCA" ||
        selectedSemester === "All" ||
        book.semester === selectedSemester;
      const matchesSearch =
        !normalizedSearch ||
        book.title?.toLowerCase().includes(normalizedSearch) ||
        book.author?.toLowerCase().includes(normalizedSearch) ||
        book.category?.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSemester && matchesSearch;
    });

    return visibleBooks.sort((a, b) => {
      if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      }

      if (sortBy === "category") {
        return (a.category || "").localeCompare(b.category || "") || a.title.localeCompare(b.title);
      }

      return a.title.localeCompare(b.title);
    });
  }, [books, searchTerm, selectedCategory, selectedSemester, sortBy]);

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
      const book = books.find((item) => item.id === bookId);
      if (book) {
        const currentSections = book.sections || [];
        const updatedSections = currentSections.filter((section) => !sectionsToRemove.includes(section));
        updateBook(bookId, { sections: updatedSections });
      }
    }

    setIsRemoveModalOpen(false);
    setBookToRemove(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSemester("All"); // reset semester whenever category changes
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSemester("All");
    setSearchTerm("");
    setSortBy("title-asc");
  };

  return (
    <div className="books-page">
      <div className="books-content">
        {loading && <Loader text="Loading library..." size={150} />}

        <div className="books-hero">
          <div className="books-hero-copy">
            <span className="books-eyebrow">Library</span>
            <h1>Browse books with less scrolling and faster discovery.</h1>
          </div>

          {canAddBook && (
            <div className="add-book-action">
              <Link to="/add-book" className="add-book-btn">Add Book</Link>
            </div>
          )}
        </div>

        <div className="books-toolbar">
          <div className="books-toolbar-top">
            <div className="results-summary">
              <strong>{filteredBooks.length}</strong> {filteredBooks.length === 1 ? "book" : "books"} available
            </div>

            <label className="books-sort">
              <span>Sort by</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="category">Category</option>
              </select>
            </label>
          </div>

          <div className="books-toolbar-main">
            <label className="books-search">
              <span>Search</span>
              <input
                type="search"
                placeholder="Search by title, author, or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="category-filter-container">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategorySelect(category)}
              className={`category-chip ${selectedCategory === category ? "active" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>

        {selectedCategory === "BCA" && (
          <div className="semester-filter-container">
            <span className="semester-filter-label">Semester</span>
            <div className="semester-chips">
              {semesters.map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  className={`semester-chip ${selectedSemester === sem ? "active" : ""}`}
                >
                  {sem === "All" ? "All Semesters" : sem.replace("BCA ", "")}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredBooks.length > 0 ? (
          <div className="books-grid">
            {filteredBooks.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                index={index}
                canEdit={canAddBook}
                onRemove={(selectedBook) => handleRemoveClick(selectedBook)}
                onEdit={() => { }}
              />
            ))}
          </div>
        ) : (
          <div className="books-empty-state">
            <h2>No books match this view yet.</h2>
            <p>
              Try another category or clear the search to explore the full library again.
            </p>
            <button type="button" className="reset-filters-btn" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}
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
