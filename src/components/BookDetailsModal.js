import React from 'react';
import { useBooks } from '../context/BookContext';
import './BookDetailsModal.css';

const BookDetailsModal = () => {
    const { selectedBook, setSelectedBook } = useBooks();

    if (!selectedBook) return null;

    return (
        <div className="book-modal" onClick={() => setSelectedBook(null)}>
            <div className="book-modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close-btn" onClick={() => setSelectedBook(null)}>
                    &times;
                </span>
                <h2>{selectedBook.title}</h2>
                <div className="modal-body">
                    <img src={selectedBook.image} alt={selectedBook.title} className="modal-book-img" />
                    <div className="modal-text">
                        <p><strong>Description:</strong> {selectedBook.description}</p>
                        <p><strong>Contents:</strong> {selectedBook.contents}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
