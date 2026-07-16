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
      <div className="section-icon-bg">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>
      <div className="section-header">
        <div>
          <span className="section-kicker">Fresh picks</span>
          <h2>New Arrivals</h2>
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
