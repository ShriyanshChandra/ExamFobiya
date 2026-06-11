import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import BookDetailsModal from './BookDetailsModal';
import { useAuth } from '../context/AuthContext';
import './BookCard.css';

const BookCard = ({ book, index, canEdit, onRemove, onEdit, onSaveClick }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveError, setSaveError] = useState("");
    const navigate = useNavigate();
    const { user, toggleSavedItem } = useAuth();
    const savedBookIds = user?.savedBooks || user?.savedBookIds || [];
    const isSaved = savedBookIds.includes(book.id);

    const openDetails = () => setIsModalOpen(true);

    const handleSaveClick = async (event) => {
        event.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setSaveError("");
            if (onSaveClick) {
                onSaveClick(book);
                return;
            }

            await toggleSavedItem('book', book.id);
        } catch (error) {
            console.error('Error saving book:', error);
            setSaveError('Could not update saved books.');
        }
    };

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
                <button
                    type="button"
                    className={`book-save-btn ${isSaved ? 'saved' : ''}`}
                    onClick={handleSaveClick}
                    onKeyDown={(event) => event.stopPropagation()}
                    aria-label={isSaved ? `Remove ${book.title} from saved books` : `Save ${book.title}`}
                    aria-pressed={isSaved}
                    title={isSaved ? 'Remove from saved books' : 'Save book'}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 3.75C6 2.78 6.78 2 7.75 2h8.5C17.22 2 18 2.78 18 3.75V21l-6-3.5L6 21V3.75Z" />
                    </svg>
                </button>
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
                {saveError && <p className="book-save-error">{saveError}</p>}

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
