import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './BookDetailsModal.css';

const BookDetailsModal = ({ book, onClose }) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!book) return null;

    return ReactDOM.createPortal(
        <div className="book-details-modal-overlay" onClick={onClose}>
            <div className="book-details-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>×</button>

                <div className="modal-body">
                    {/* Left Section - Book Image and Title */}
                    <div className="modal-left-section">
                        <img
                            src={book.image}
                            alt={book.title}
                            className="modal-book-image"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                            }}
                        />
                        <h3 className="modal-book-title">{book.title}</h3>
                        {book.price !== undefined && book.price !== null && (
                            <p className="modal-book-price">₹ {book.price}</p>
                        )}
                    </div>

                    {/* Right Section - Topics Covered */}
                    <div className="modal-right-section">
                        <h2 className="topics-heading">Topics Covered</h2>
                        <div className="topics-list-container">
                            <ol className="topics-list">
                                {book.contents ? (
                                    Array.isArray(book.contents)
                                        ? book.contents.map((topic, i) => <li key={i}>{topic}</li>)
                                        : book.contents.split('\n').filter(line => line.trim() !== '').map((topic, i) => (
                                            <li key={i}>{topic.replace(/^\d+\.\s*/, '')}</li>
                                        ))
                                ) : (
                                    <li>No specific topics listed.</li>
                                )}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BookDetailsModal;
