import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useBooks } from "../context/BookContext";
import "./NewArrivals.css";

const NewArrivals = () => {
  const { getBooksBySection } = useBooks();
  // Fetch books for 'New Arrivals' (Standardized plural name)
  const newArrivals = getBooksBySection("New Arrivals");

  return (
    <section className="new-arrivals">
      <h2>New Arrivals</h2>
      {newArrivals.length === 0 ? (
        <p>No new arrivals at the moment.</p>
      ) : (
        <div className="book-grid">
          {newArrivals.map((book, index) => (
            <motion.div
              key={book.id}
              className="book-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <img src={book.image} alt={book.title} className="book-img" />
              <h3>{book.title}</h3>
              {/* <p>by {book.author}</p> REMOVED AUTHOR */}
              <Link to="/books" className="view-btn">View Details</Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewArrivals;
