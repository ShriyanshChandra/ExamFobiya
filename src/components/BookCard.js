import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BookDetailsModal from './BookDetailsModal';
import './BookCard.css';

const BookCard = ({ book, index, canEdit, onRemove, onEdit }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <motion.div
                className="book-card"
                onClick={handleCardClick}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                viewport={{ once: true }}
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
                </div>

                {canEdit && (
                    <div className="book-actions" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/edit-book/${book.id}`} className="action-btn edit-btn">Edit</Link>
                        <button onClick={() => onRemove(book)} className="action-btn remove-btn">Remove</button>
                    </div>
                )}
            </motion.div>

            {isModalOpen && (
                <BookDetailsModal book={book} onClose={handleCloseModal} />
            )}
        </>
    );
};

export default BookCard;
