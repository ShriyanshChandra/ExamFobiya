import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuestions } from '../context/QuestionContext';
import ConfirmationModal from '../components/ConfirmationModal';
import './UploadQuestions.css';
import '../components/RemoveBookModal.css'; // Reuse modal styles from RemoveBookModal

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2010 + 1 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const EditQuestionPdf = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateQuestionPdf } = useQuestions();

    // pdf data is passed via navigation state
    const pdf = location.state?.pdf;

    const [label, setLabel] = useState(pdf?.label || '');
    const [url, setUrl] = useState(pdf?.url || '');
    const [month, setMonth] = useState(pdf?.month || '');
    const [year, setYear] = useState(pdf?.year || '');
    const [saving, setSaving] = useState(false);
    const [alertModal, setAlertModal] = useState(null);

    const showAlertModal = ({ title, message, variant = 'yellow', onClose }) => {
        setAlertModal({ title, message, variant, onClose });
    };

    const closeAlertModal = () => {
        const closeAction = alertModal?.onClose;
        setAlertModal(null);
        if (closeAction) closeAction();
    };

    useEffect(() => {
        if (!pdf) navigate('/questions');
    }, [pdf, navigate]);

    if (!pdf) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        if (!url.trim()) {
            showAlertModal({
                title: 'Missing PDF Link',
                message: 'PDF link is required.',
                variant: 'danger'
            });
            return;
        }
        setSaving(true);
        try {
            await updateQuestionPdf(pdf.docPath, {
                label: label.trim(),
                url: url.trim(),
                month: month || '',
                year: year || ''
            });
            showAlertModal({
                title: 'PDF Updated',
                message: 'Question PDF updated successfully.',
                onClose: () => navigate('/questions')
            });
        } catch (err) {
            showAlertModal({
                title: 'Update Failed',
                message: `Update failed: ${err.message}`,
                variant: 'danger'
            });
        } finally {
            setSaving(false);
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
                            placeholder="enter PDF label here..."
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </div>

                    {/* Month */}
                    <div className="uq-form-group">
                        <label>Month</label>
                        <div className="uq-select-wrapper">
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                <option value="">Select Month</option>
                                {MONTHS.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
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
                            placeholder="paste drive link here..."
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

                </form>
            </div>

            <ConfirmationModal
                isOpen={!!alertModal}
                onClose={closeAlertModal}
                onConfirm={closeAlertModal}
                title={alertModal?.title}
                message={alertModal?.message}
                variant={alertModal?.variant || 'yellow'}
                confirmLabel="OK"
                hideCancel
            />
        </div>
    );
};

export default EditQuestionPdf;
