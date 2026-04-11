import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import BookDetailsModal from './BookDetailsModal';
import './BookCard.css';

const BookCard = ({ book, index, canEdit, onRemove, onEdit }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const openDetails = () => setIsModalOpen(true);

    const handleCardKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
        }
    };

    return (
        <>
            <motion.div
                className="book-card"
                role="button"
                tabIndex={0}
                onClick={openDetails}
                onKeyDown={handleCardKeyDown}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                viewport={{ once: true }}
            >
                <img
                    src={book.image}
                    alt={book.title}
                    className="book-img"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Load+Error';
                    }}
                />
                <div className="book-content">
                    <div className="book-card-meta-row">
                        {book.category && (
                            <span className="book-category-badge">{book.category}</span>
                        )}
                    </div>
                    <h3 className="book-card-title">{book.title}</h3>
                    <div className="book-card-btns">
                        <button
                            className="action-btn questions-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/questions', { state: { initialSearch: book.title } });
                            }}
                        >
                            Questions
                        </button>
                        <button
                            className="action-btn syllabus-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                openDetails();
                            }}
                        >
                            Syllabus
                        </button>
                    </div>
                </div>

                {/* Admin edit/remove buttons */}
                {canEdit && (
                    <div className="book-actions admin-actions-row" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/edit-book/${book.id}`} className="action-btn edit-btn">Edit</Link>
                        <button onClick={() => onRemove(book)} className="action-btn remove-btn">Remove</button>
                    </div>
                )}
            </motion.div>

            {isModalOpen && (
                <BookDetailsModal book={book} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
};

export default BookCard;
