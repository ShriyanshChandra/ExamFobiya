import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import BookDetailsModal from './BookDetailsModal';
import './BookCard.css';

const BookCard = ({ book, index, canEdit, onRemove, onEdit, onSaveClick }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const openDetails = () => setIsModalOpen(true);



    const handleCardKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
        }
    };

    const optimizedImage = React.useMemo(() => {
        let url = book.image || '';
        if (url.includes('lh3.googleusercontent.com')) {
            // Replace existing size parameters (like =w800) with =w400-rw (400px width, WebP format)
            if (url.match(/=[ws]\d+/)) {
                return url.replace(/=[ws]\d+/, '=w400-rw');
            }
            // Or append it if it doesn't exist
            return url.includes('?') ? url + '&sz=w400-rw' : url + '=w400-rw';
        }
        return url;
    }, [book.image]);

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
                {book.hasProgrammingSolution && (
                    <button
                        type="button"
                        className="book-code-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/programming-solutions', { 
                                state: { 
                                    initialSearch: book.title,
                                    categoryFilter: book.category 
                                } 
                            });
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                        aria-label={`Programming solutions for ${book.title}`}
                        title="Programming Solutions"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1.4rem' }}>
                            code_xml
                        </span>
                    </button>
                )}
                <img
                    src={optimizedImage}
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

                        <div className="book-card-primary-btns">
                            <button
                                className="action-btn questions-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/questions', { 
                                        state: { 
                                            initialSearch: book.title,
                                            categoryFilter: book.category
                                        } 
                                    });
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
                </div>

                {/* Admin edit/remove buttons */}
                {canEdit && (
                    <div className="book-actions admin-actions-row" onClick={(e) => e.stopPropagation()}>
                        <Link
                            to={`/edit-book/${book.id}`}
                            state={{ book }}
                            className="action-btn edit-btn"
                        >
                            Edit
                        </Link>
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
