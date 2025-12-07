import React from 'react';
import { useBooks } from '../context/BookContext';

const BestSeller = () => {
  const { getBooksBySection } = useBooks();
  const bestSellerBooks = getBooksBySection('Best Seller');

  return (
    <section className="best-sellers">
      <h2>Best Sellers</h2>
      <div className="book-grid">
        {bestSellerBooks.map((book) => (
          <div key={book.id} className="book-card">
            <img src={book.image} alt={book.title} className="book-img" />
            <h3>{book.title}</h3>
            {/* <p>{book.author}</p> REMOVED */}
            <button className="view-btn">View Details</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSeller;