import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuestions } from '../context/QuestionContext';
import './UploadQuestions.css';
import '../components/RemoveBookModal.css'; // Reuse modal styles from RemoveBookModal

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2010 + 1 }, (_, i) => CURRENT_YEAR - i);

const EditQuestionPdf = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateQuestionPdf, deleteQuestionPdf } = useQuestions();

    // pdf data is passed via navigation state
    const pdf = location.state?.pdf;

    const [label, setLabel] = useState(pdf?.label || '');
    const [url, setUrl] = useState(pdf?.url || '');
    const [year, setYear] = useState(pdf?.year || '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        if (!pdf) navigate('/questions');
    }, [pdf, navigate]);

    if (!pdf) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        if (!url.trim()) {
            alert('PDF link is required.');
            return;
        }
        setSaving(true);
        try {
            await updateQuestionPdf(pdf.docPath, {
                label: label.trim(),
                url: url.trim(),
                year: year || ''
            });
            alert('✅ Question PDF updated successfully.');
            navigate('/questions');
        } catch (err) {
            alert(`❌ Update failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = () => {
        setIsConfirmingDelete(true);
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            await deleteQuestionPdf(pdf.docPath);
            alert('🗑 PDF deleted.');
            navigate('/questions');
        } catch (err) {
            alert(`❌ Delete failed: ${err.message}`);
        } finally {
            setDeleting(false);
            setIsConfirmingDelete(false);
        }
    };

    return (
        <div className="uq-container">
            <div className="uq-card">
                <h2>Edit Question PDF</h2>
                <p className="uq-subtitle">
                    Editing PDF for <strong>{pdf.subject}</strong> ({pdf.course})
                </p>

                <form onSubmit={handleSave}>

                    {/* Label */}
                    <div className="uq-form-group">
                        <label>Label</label>
                        <input
                            type="text"
                            className="uq-url-input"
                            placeholder="e.g. Unit 1 Paper"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </div>

                    {/* Year */}
                    <div className="uq-form-group">
                        <label>Year</label>
                        <div className="uq-select-wrapper">
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                <option value="">Select Year</option>
                                {YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* URL */}
                    <div className="uq-form-group">
                        <label>PDF Link <span className="uq-required">*</span></label>
                        <input
                            type="text"
                            className="uq-url-input"
                            placeholder="https://drive.google.com/file/d/..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="uq-actions" style={{ marginBottom: '15px' }}>
                        <button
                            type="button"
                            className="uq-cancel-btn"
                            onClick={() => navigate('/questions')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="uq-submit-btn"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    {/* Delete */}
                    <div style={{ textAlign: 'center', borderTop: '1px solid rgba(150,150,150,0.2)', paddingTop: '15px' }}>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            disabled={deleting}
                            style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 32px',
                                fontWeight: '700',
                                fontSize: '1.05rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: deleting ? 0.5 : 1,
                                width: '100%',
                                marginTop: '10px'
                            }}
                            onMouseOver={(e) => {
                                if (!deleting) e.target.style.background = '#c82333';
                                if (!deleting) e.target.style.transform = 'scale(1.03)';
                            }}
                            onMouseOut={(e) => {
                                if (!deleting) e.target.style.background = '#dc3545';
                                if (!deleting) e.target.style.transform = 'scale(1)';
                            }}
                        >
                            Delete
                        </button>
                    </div>

                </form>
            </div>

            {/* Confirmation Modal */}
            {isConfirmingDelete && (
                <div className="modal-overlay">
                    <div className="frosted-modal">
                        <h2>Confirm Removal</h2>
                        <div className="confirmation-view">
                            <p className="confirmation-message">
                                Are you sure you want to remove the question PDF "{label || url}" for {pdf.subject}?
                            </p>
                            <div className="modal-actions">
                                <button className="cancel-btn" onClick={() => setIsConfirmingDelete(false)}>Back</button>
                                <button
                                    className="confirm-remove-btn"
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Removing...' : 'Yes, Remove'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditQuestionPdf;
