import React from "react";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import BookCard from '../components/BookCard';
import "./NewArrivals.css";

const NewArrivals = ({ limit }) => {
  const { getBooksBySection } = useBooks();
  const newArrivals = getBooksBySection("New Arrivals");
  const hasOverflow = typeof limit === "number" && newArrivals.length > limit;
  const visibleBooks = hasOverflow
    ? newArrivals
    : typeof limit === "number"
      ? newArrivals.slice(0, limit)
      : newArrivals;

  return (
    <section className="new-arrivals">
      <div className="section-header">
        <div>
          <span className="section-kicker">Fresh picks</span>
          <h2>New Arrivals</h2>
          <p className="section-subtitle">
            Recently added titles that deserve attention before they disappear into the full catalog.
          </p>
        </div>
        <Link to="/books" className="browse-all-link">Browse all books</Link>
      </div>
      {newArrivals.length === 0 ? (
        <p>No new arrivals at the moment.</p>
      ) : (
        <div className={`book-grid home-book-shelf ${hasOverflow ? "is-scrollable" : "is-compact"}`}>
          {visibleBooks.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

export default NewArrivals;
