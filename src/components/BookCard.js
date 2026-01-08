import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book, index, canEdit, onRemove, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine authorization if not passed as prop, though typically passed from parent (Books.js)
    // For consistency with existing pages:
    // NewArrivals uses motion, BestSeller doesn't.
    // We will make this component generic.

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <motion.div
            className={`book-card ${isExpanded ? 'expanded' : ''}`}
            onClick={toggleExpand}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index ? index * 0.1 : 0 }}
            viewport={{ once: true }}
            layout // Helper for smooth resizing
        >
            <img
                src={book.image}
                alt={book.title}
                className="book-img"
                referrerPolicy="no-referrer"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=Load+Error';
                }}
            />
            <div className="book-content">
                {book.category && (
                    <span className="book-category-badge">{book.category}</span>
                )}
                <h3>{book.title}</h3>
                <p className="book-price">
                    {book.price !== undefined && book.price !== null ? `₹ ${book.price}` : '₹ 0'}
                </p>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="book-details-dropdown"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="book-topics">
                                <strong>Topics Covered:</strong>
                                <ol style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                    {book.contents ? (
                                        Array.isArray(book.contents)
                                            ? book.contents.map((topic, i) => <li key={i}>{topic}</li>)
                                            : book.contents.split('\n').filter(line => line.trim() !== '').map((topic, i) => (
                                                <li key={i}>{topic.replace(/^\d+\.\s*/, '')}</li> /* Remove existing numbering if present */
                                            ))
                                    ) : (
                                        <li>No specific topics listed.</li>
                                    )}
                                </ol>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {canEdit && (
                <div className="book-actions" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/edit-book/${book.id}`} className="action-btn edit-btn">Edit</Link>
                    <button onClick={() => onRemove(book)} className="action-btn remove-btn">Remove</button>
                </div>
            )}
        </motion.div>
    );
};

export default BookCard;
