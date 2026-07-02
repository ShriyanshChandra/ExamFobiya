import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    variant = 'danger',
    confirmLabel = 'Yes, Proceed',
    cancelLabel = 'Cancel',
    hideCancel = false
}) => {
    if (!isOpen) return null;

    const handleConfirm = onConfirm || onClose;

    return (
        <div className="modal-overlay">
            <div className={`modal-content confirmation-modal ${variant}`}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button type="button" className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-actions">
                    {!hideCancel && (
                        <button type="button" className="cancel-btn" onClick={onClose}>{cancelLabel}</button>
                    )}
                    <button type="button" className={`confirm-btn ${variant}`} onClick={handleConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
