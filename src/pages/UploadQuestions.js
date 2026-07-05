import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pdfIcon from '../assets/pdf.png';
import { useBooks } from '../context/BookContext';
import { useQuestions } from '../context/QuestionContext';
import ConfirmationModal from '../components/ConfirmationModal';
import './UploadQuestions.css';

const COURSES = ['BCA', 'DCA', 'PGDCA'];
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

const UploadQuestions = () => {
    const navigate = useNavigate();
    const { books } = useBooks();
    const { addQuestionPdfs } = useQuestions();

    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [pdfLinks, setPdfLinks] = useState([{ label: '', url: '', month: '', year: '' }]);
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

    // Derive unique subjects from books matching the selected course
    const subjects = selectedCourse
        ? [...new Set(
            books
                .filter(b => b.category === selectedCourse && b.title)
                .map(b => b.title)
        )].sort()
        : [];

    const handleCourseChange = (e) => {
        setSelectedCourse(e.target.value);
        setSelectedSubject('');
    };

    const handleLinkChange = (index, field, value) => {
        const updated = [...pdfLinks];
        updated[index][field] = value;
        setPdfLinks(updated);
    };

    const addRow = () => setPdfLinks([...pdfLinks, { label: '', url: '', month: '', year: '' }]);

    const removeRow = (index) => {
        if (pdfLinks.length === 1) return;
        setPdfLinks(pdfLinks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const filled = pdfLinks.filter(p => p.url.trim() !== '');
        if (!selectedCourse || !selectedSubject || filled.length === 0) {
            showAlertModal({
                title: 'Missing Details',
                message: 'Please select a course, subject, and add at least one PDF link.',
                variant: 'danger'
            });
            return;
        }
        setSaving(true);
        try {
            await addQuestionPdfs(selectedCourse, selectedSubject, filled);
            showAlertModal({
                title: 'Upload Complete',
                message: `Uploaded ${filled.length} PDF(s) for "${selectedSubject}" (${selectedCourse}).`,
                onClose: () => navigate('/questions')
            });
        } catch (err) {
            showAlertModal({
                title: 'Upload Failed',
                message: `Upload failed: ${err.message}`,
                variant: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="uq-container">
            <div className="uq-card">
                <h2>Upload Question PDFs</h2>
                <p className="uq-subtitle">
                    Select the course and subject, then paste the Google Drive sharing links.
                </p>

                <form onSubmit={handleSubmit}>

                    {/* Course Select */}
                    <div className="uq-form-group">
                        <label>Course <span className="uq-required">*</span></label>
                        <div className="uq-select-wrapper">
                            <select
                                value={selectedCourse}
                                onChange={handleCourseChange}
                                required
                            >
                                <option value="">— Select Course —</option>
                                {COURSES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Subject Select */}
                    <div className="uq-form-group">
                        <label>Subject <span className="uq-required">*</span></label>
                        <div className="uq-select-wrapper">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                required
                                disabled={!selectedCourse}
                            >
                                <option value="">— Select Subject —</option>
                                {subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        {selectedCourse && subjects.length === 0 && (
                            <p className="uq-hint">No books found for this course. Add books first.</p>
                        )}
                    </div>

                    {/* PDF Links */}
                    <div className="uq-form-group">
                        <label>
                            Question PDF Links <span className="uq-required">*</span>
                        </label>
                        <p className="uq-hint">Paste Google Drive sharing links below. Add a title to identify each PDF.</p>

                        <div className="uq-pdf-list">
                            {pdfLinks.map((pdf, index) => (
                                <div key={index} className="uq-pdf-row">
                                    {/* PDF icon */}
                                    <img src={pdfIcon} alt="PDF document icon" className="uq-pdf-icon" />

                                    {/* Label */}
                                    <input
                                        type="text"
                                        className="uq-label-input"
                                        placeholder="Title of PDF"
                                        value={pdf.label}
                                        onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                                    />

                                    {/* Month */}
                                    <select
                                        className="uq-month-select"
                                        value={pdf.month}
                                        onChange={(e) => handleLinkChange(index, 'month', e.target.value)}
                                    >
                                        <option value="">Select Month</option>
                                        {MONTHS.map(month => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>

                                    {/* Year */}
                                    <select
                                        className="uq-year-select"
                                        value={pdf.year}
                                        onChange={(e) => handleLinkChange(index, 'year', e.target.value)}
                                    >
                                        <option value="">Select Year</option>
                                        {YEARS.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>

                                    {/* Drive link */}
                                    <input
                                        type="text"
                                        className="uq-url-input"
                                        placeholder="Paste Drive link here"
                                        value={pdf.url}
                                        onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                    />

                                    {/* Remove row */}
                                    <button
                                        type="button"
                                        className="uq-remove-btn"
                                        onClick={() => removeRow(index)}
                                        disabled={pdfLinks.length === 1}
                                        title="Remove row"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add row */}
                        <button type="button" className="uq-add-row-btn" onClick={addRow}>
                            + Add Another PDF
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="uq-actions">
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
                            {saving ? 'Uploading...' : 'Upload PDFs'}
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

export default UploadQuestions;
