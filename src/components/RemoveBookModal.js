import React, { useState } from 'react';
import './RemoveBookModal.css';

const RemoveBookModal = ({ book, onClose, onConfirm }) => {
    // State to track which sections to remove
    const [selectedSectionsToRemove, setSelectedSectionsToRemove] = useState([]);
    const [removeFromAll, setRemoveFromAll] = useState(false);

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

    const handleConfirm = () => {
        if (selectedSectionsToRemove.length === 0 && !removeFromAll) {
            alert("Please select at least one option.");
            return;
        }

        if (window.confirm("Are you sure you want to proceed with the selected changes?")) {
            onConfirm({
                bookId: book.id,
                sectionsToRemove: selectedSectionsToRemove,
                removeFromAll
            });
        }
    };

    if (!book) return null;

    return (
        <div className="modal-overlay">
            <div className="frosted-modal">
                <h2>Remove Book</h2>
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
                        onClick={handleConfirm}
                        disabled={selectedSectionsToRemove.length === 0 && !removeFromAll}
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveBookModal;
