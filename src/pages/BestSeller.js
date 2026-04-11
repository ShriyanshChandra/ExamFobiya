import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/BookCard';

const BestSeller = ({ limit }) => {
  const { getBooksBySection } = useBooks();
  const bestSellerBooks = getBooksBySection('Best Seller');
  const visibleBooks = typeof limit === 'number' ? bestSellerBooks.slice(0, limit) : bestSellerBooks;

  return (
    <section className="best-sellers">
      <div className="section-header">
        <div>
          <span className="section-kicker">Popular now</span>
          <h2>Best Sellers</h2>
          <p className="section-subtitle">
            Reliable crowd favorites that make good first stops when you want proven material.
          </p>
        </div>
        <Link to="/books" className="browse-all-link">See full library</Link>
      </div>
      {bestSellerBooks.length === 0 ? (
        <p>No best sellers available right now.</p>
      ) : (
        <div className="book-grid">
          {visibleBooks.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BestSeller;
