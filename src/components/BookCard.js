import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BookCard.css';

const BookCard = ({ book, index, canEdit, onRemove, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { user } = useAuth();

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
            <h3>{book.title}</h3>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="book-details-dropdown"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="book-desc"><strong>Description:</strong> {book.description}</p>
                        <p className="book-contents"><strong>Contents:</strong> {book.contents}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <p className="book-publisher">by Smart Publications</p>

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
