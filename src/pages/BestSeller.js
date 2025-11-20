import React from 'react';

const bestSellerBooks = [
  {
    id: 1,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    image: "https://m.media-amazon.com/images/I/71aG+xDKSYL.jpg",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    image: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg",
  },
  {
    id: 3,
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    image: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
  },
  {
    id: 4,
    title: "Ikigai",
    author: "Héctor García",
    image: "https://m.media-amazon.com/images/I/81l3rZK4lnL.jpg",
  }
];

const BestSeller = () => {
  return (
    <section className="best-sellers">
      <h2>Best Sellers</h2>
      <div className="book-grid">
        {bestSellerBooks.map((book) => (
          <div key={book.id} className="book-card">
            <img src={book.image} alt={book.title} className="book-img" />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <button className="view-btn">View Details</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSeller;