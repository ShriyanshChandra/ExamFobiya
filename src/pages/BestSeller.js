import React from 'react';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/BookCard';

const BestSeller = () => {
  const { getBooksBySection } = useBooks();
  const bestSellerBooks = getBooksBySection('Best Seller');

  return (
    <section className="best-sellers">
      <h2>Best Sellers</h2>
      <div className="book-grid">
        {bestSellerBooks.map((book, index) => (
          <BookCard key={book.id} book={book} index={index} />
        ))}
      </div>
    </section>
  );
};

export default BestSeller;