import React from 'react';
import ReactDOM from 'react-dom';
import './RemoveBookModal.css'; // Reuse the same styling

const DeleteQuestionModal = ({ question, onClose, onConfirm }) => {
    if (!question) return null;

    const handleConfirmDelete = () => {
        onConfirm(question.id);
    };

    const modalContent = (
        <div className="modal-overlay">
            <div className="frosted-modal">
                <h2>Confirm Deletion</h2>

                <div className="book-info">
                    <p><strong>Question:</strong> {question.question?.substring(0, 100)}{question.question?.length > 100 ? '...' : ''}</p>
                    {question.subject && <p><strong>Subject:</strong> {question.subject}</p>}
                    {question.course && <p><strong>Course:</strong> {question.course}</p>}
                </div>

                <div className="confirmation-view">
                    <p className="confirmation-message">
                        Are you sure you want to delete this question? This action cannot be undone.
                    </p>
                    <div className="modal-actions">
                        <button className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button
                            className="confirm-remove-btn"
                            onClick={handleConfirmDelete}
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render the modal using a portal to ensure it's always centered on screen
    return ReactDOM.createPortal(modalContent, document.body);
};

export default DeleteQuestionModal;
