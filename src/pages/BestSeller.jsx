import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/BookCard';

const BestSeller = ({ limit }) => {
  const { getBooksBySection } = useBooks();
  const bestSellerBooks = getBooksBySection('Best Seller');
  const hasOverflow = typeof limit === 'number' && bestSellerBooks.length > limit;
  const visibleBooks = hasOverflow
    ? bestSellerBooks
    : typeof limit === 'number'
      ? bestSellerBooks.slice(0, limit)
      : bestSellerBooks;

  return (
    <section className="best-sellers">
      <div className="section-icon-bg">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
      </div>
      <div className="section-header">
        <div>
          <span className="section-kicker">Popular now</span>
          <h2>Best Sellers</h2>
        </div>
        <Link to="/books" className="browse-all-link">See full library</Link>
      </div>
      {bestSellerBooks.length === 0 ? (
        <p>No best sellers available right now.</p>
      ) : (
        <div className={`book-grid home-book-shelf ${hasOverflow ? 'is-scrollable' : 'is-compact'}`}>
          {visibleBooks.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BestSeller;
