import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBooks } from '../context/BookContext';
import './ExploreSection.css';

const ExploreSection = () => {
    const { books } = useBooks();

    return (
        <section className="explore-section">
            <h2>Explore Books</h2>
            <div className="explore-grid">
                {books.slice(0, 8).map((book, index) => (
                    <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        className="explore-book-card-wrapper"
                    >
                        <div className="explore-book-card">
                            <img src={book.image} alt={book.title} className="explore-book-img" />
                            <div className="explore-book-info">
                                <h3>{book.title}</h3>
                                {/* <p>{book.author}</p> REMOVED */}
                                <Link to="/books" className="explore-view-btn">View Details</Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="explore-footer">
                <Link to="/books" className="view-all-btn">View All Books</Link>
            </div>
        </section>
    );
};

export default ExploreSection;
