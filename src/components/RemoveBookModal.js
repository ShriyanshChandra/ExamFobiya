import React, { useState } from 'react';
import './RemoveBookModal.css';

const RemoveBookModal = ({ book, onClose, onConfirm }) => {
    // State to track which sections to remove
    const [selectedSectionsToRemove, setSelectedSectionsToRemove] = useState([]);
    const [removeFromAll, setRemoveFromAll] = useState(() => {
        // If the book has no sections, default to true (delete completely)
        // Check if book exists to avoid errors on first render if book is null (though filtered by parent)
        return book && (!book.sections || book.sections.length === 0);
    });

    // State for confirmation view
    const [isConfirming, setIsConfirming] = useState(false);



    // Filterable sections (excluding implicitly "General" if not tracked, or just show all tags)
    // Assuming book.sections contains "Best Seller", "New Arrivals" etc.
    const removableSections = book.sections || [];

    const handleSectionToggle = (section) => {
        setSelectedSectionsToRemove(prev => {
            if (prev.includes(section)) {
                return prev.filter(s => s !== section);
            } else {
                return [...prev, section];
            }
        });
        if (removeFromAll) setRemoveFromAll(false);
    };

    const handleInitialConfirm = () => {
        if (selectedSectionsToRemove.length === 0 && !removeFromAll) {
            alert("Please select at least one option.");
            return;
        }
        setIsConfirming(true);
    };

    const handleFinalConfirm = () => {
        onConfirm({
            bookId: book.id,
            sectionsToRemove: selectedSectionsToRemove,
            removeFromAll
        });
    };

    const getConfirmMessage = () => {
        if (removeFromAll) {
            return `Are you sure you want to remove "${book.title}" completely from the library?`;
        } else {
            const sectionText = selectedSectionsToRemove.length === 1
                ? `the "${selectedSectionsToRemove[0]}" section`
                : `these sections: ${selectedSectionsToRemove.join(', ')}`;
            return `Are you sure you want to remove "${book.title}" from ${sectionText}?`;
        }
    };

    if (!book) return null;

    return (
        <div className="modal-overlay">
            <div className="frosted-modal">
                <h2>{isConfirming ? "Confirm Removal" : "Remove Book"}</h2>

                {!isConfirming ? (
                    <>
                        <div className="book-info">
                            <p><strong>Title:</strong> {book.title}</p>
                            <p><strong>Current Sections:</strong> {removableSections.join(', ') || 'General Library'}</p>
                        </div>

                        <div className="options-group">
                            {removableSections.length > 0 && (
                                <>
                                    <p>Remove from specific sections:</p>
                                    {removableSections.map(section => (
                                        <label key={section} className="checkbox-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedSectionsToRemove.includes(section)}
                                                onChange={() => handleSectionToggle(section)}
                                            />
                                            Remove from "{section}"
                                        </label>
                                    ))}
                                </>
                            )}

                            <div className="divider" style={{ margin: '10px 0', borderTop: '1px solid #ccc' }}></div>

                            <label className="checkbox-option" style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                <input
                                    type="checkbox"
                                    checked={removeFromAll}
                                    onChange={(e) => {
                                        setRemoveFromAll(e.target.checked);
                                        if (e.target.checked) setSelectedSectionsToRemove([]); // UI cleanliness
                                    }}
                                />
                                Delete Book Completely (Remove from Library)
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={onClose}>Cancel</button>
                            <button
                                className="confirm-remove-btn"
                                onClick={handleInitialConfirm}
                                disabled={selectedSectionsToRemove.length === 0 && !removeFromAll}
                            >
                                Remove
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="confirmation-view">
                        <p className="confirmation-message">{getConfirmMessage()}</p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setIsConfirming(false)}>Back</button>
                            <button
                                className="confirm-remove-btn"
                                onClick={handleFinalConfirm}
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoveBookModal;
