import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './BookDetailsModal.css';

const BookDetailsModal = ({ book, onClose }) => {
    // Prevent body/html scroll when modal is open
    useEffect(() => {
        // Save original styles
        const originalBodyStyle = window.getComputedStyle(document.body).overflow;
        const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;

        // Lock both
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            // Restore both
            document.body.style.overflow = originalBodyStyle;
            document.documentElement.style.overflow = originalHtmlStyle;
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
                            <div className="topics-content">
                                {renderTopics(book.contents)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// Helper to render topics (supports both legacy text and new HTML)
const renderTopics = (contents) => {
    if (!contents) return <p>No specific topics listed.</p>;

    // Check if contents are array (legacy data support)
    if (Array.isArray(contents)) {
        return <ul>{contents.map((t, i) => <li key={i}>{t}</li>)}</ul>;
    }

    // Check if contents contain HTML tags (heuristic)
    const hasHtml = /<[a-z][\s\S]*>/i.test(contents);

    if (hasHtml) {
        return (
            <div
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: contents }}
            />
        );
    }

    // Fallback for plain text (legacy)
    return (
        <ul className="hierarchical-topics">
            {contents.split('\n').filter(l => l.trim()).map((line, i) => <li key={i}>{line}</li>)}
        </ul>
    );
};

export default BookDetailsModal;
