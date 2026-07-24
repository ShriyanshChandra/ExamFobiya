import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';
import ConfirmationModal from '../components/ConfirmationModal';
import Loader from '../components/Loader';
import './ProgrammingSolutions.css';

const COURSES = ['BCA', 'DCA', 'PGDCA'];
const PROGRAMMING_LANGUAGES = ['C', 'C#', 'C++', 'Java', 'Python'];

// Normalises old single-solution books into a 1-item array so all code can work
// uniformly with the new programmingSolutions array format.
const normalizeSolutions = (book) => {
    if (Array.isArray(book?.programmingSolutions) && book.programmingSolutions.length > 0) {
        return book.programmingSolutions;
    }
    if (book?.programmingSolution && Object.keys(book.programmingSolution).length > 0) {
        return [{ ...book.programmingSolution, id: 'legacy' }];
    }
    return [];
};

const AddProgrammingSolution = () => {
    const navigate = useNavigate();
    const { bookId, solutionId } = useParams();
    const { user } = useAuth();
    const { books, loading, addProgrammingSolution, updateProgrammingSolution } = useBooks();
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBookId, setSelectedBookId] = useState('');
    const [solutionTitle, setSolutionTitle] = useState('');
    const [solutionLanguage, setSolutionLanguage] = useState('');
    const [solutionDescription, setSolutionDescription] = useState('');
    const [solutionInput, setSolutionInput] = useState('');
    const [solutionCode, setSolutionCode] = useState('');
    const [solutionOutput, setSolutionOutput] = useState('');
    const [saving, setSaving] = useState(false);
    const [alertModal, setAlertModal] = useState(null);
    const inputLineNumberRef = useRef(null);
    const lineNumberRef = useRef(null);
    const outputLineNumberRef = useRef(null);
    const solutionInputLineCount = Math.max(solutionInput.split('\n').length, 1);
    const solutionCodeLineCount = Math.max(solutionCode.split('\n').length, 1);
    const solutionOutputLineCount = Math.max(solutionOutput.split('\n').length, 1);
    const isEditing = Boolean(bookId && solutionId);

    const availableCourses = useMemo(() => {
        // Show all courses that have at least one book, not just those flagged with hasProgrammingSolution
        const allCourses = new Set(
            books
                .filter(item => item.category)
                .map(item => item.category)
        );

        return COURSES.filter(course => allCourses.has(course));
    }, [books]);

    const courseBooks = useMemo(() => {
        if (!selectedCourse) return [];

        // Show ALL books in the course so admin can add a solution to any subject
        return books
            .filter(item => item.category === selectedCourse)
            .sort((firstBook, secondBook) => (firstBook.title || '').localeCompare(secondBook.title || ''));
    }, [books, selectedCourse]);

    const showAlertModal = ({ title, message, variant = 'yellow', onClose }) => {
        setAlertModal({ title, message, variant, onClose });
    };

    const closeAlertModal = () => {
        const closeAction = alertModal?.onClose;
        setAlertModal(null);
        if (closeAction) closeAction();
    };

    // Populate form when editing an existing solution
    useEffect(() => {
        if (!isEditing || loading) return;

        const selectedBook = books.find(item => item.id?.toString() === bookId.toString());
        if (!selectedBook) return;

        const solutions = normalizeSolutions(selectedBook);
        const existingSolution = solutions.find(s => s.id === solutionId);
        if (!existingSolution) return;

        setSelectedCourse(selectedBook.category || '');
        setSelectedBookId(selectedBook.id);
        setSolutionTitle(existingSolution.title || '');
        setSolutionLanguage(existingSolution.language || '');
        setSolutionDescription(existingSolution.description || '');
        setSolutionInput(existingSolution.input || '');
        setSolutionCode(existingSolution.code || '');
        setSolutionOutput(existingSolution.output || '');
    }, [books, bookId, solutionId, isEditing, loading]);

    const handleCourseChange = (event) => {
        setSelectedCourse(event.target.value);
        setSelectedBookId('');
        setSolutionTitle('');
        setSolutionLanguage('');
        setSolutionDescription('');
        setSolutionInput('');
        setSolutionCode('');
        setSolutionOutput('');
    };

    const handleBookChange = (event) => {
        const nextBookId = event.target.value;
        setSelectedBookId(nextBookId);

        // In add mode always clear; in edit mode pre-fill with existing solution
        if (isEditing) {
            const selectedBook = books.find(item => item.id === nextBookId);
            const solutions = normalizeSolutions(selectedBook);
            const existingSolution = solutions.find(s => s.id === solutionId) || {};
            setSolutionTitle(existingSolution.title || '');
            setSolutionLanguage(existingSolution.language || '');
            setSolutionDescription(existingSolution.description || '');
            setSolutionInput(existingSolution.input || '');
            setSolutionCode(existingSolution.code || '');
            setSolutionOutput(existingSolution.output || '');
        } else {
            setSolutionTitle('');
            setSolutionLanguage('');
            setSolutionDescription('');
            setSolutionInput('');
            setSolutionCode('');
            setSolutionOutput('');
        }
    };

    const handleEditorKeyDown = (setter) => (event) => {
        if (event.key !== 'Tab') return;

        event.preventDefault();

        const { selectionStart, selectionEnd, value } = event.target;
        const updatedValue = `${value.slice(0, selectionStart)}\t${value.slice(selectionEnd)}`;

        setter(updatedValue);

        requestAnimationFrame(() => {
            event.target.selectionStart = selectionStart + 1;
            event.target.selectionEnd = selectionStart + 1;
        });
    };

    const handleEditorScroll = (ref) => (event) => {
        if (ref.current) {
            ref.current.scrollTop = event.target.scrollTop;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedCourse || !selectedBookId || !solutionTitle.trim() || !solutionLanguage.trim() || !solutionCode.trim()) {
            showAlertModal({
                title: 'Missing Details',
                message: 'Please select a course, subject, title, language, and add solution code.',
                variant: 'danger'
            });
            return;
        }

        setSaving(true);

        const solutionData = {
            title: solutionTitle.trim(),
            language: solutionLanguage.trim(),
            description: solutionDescription.trim(),
            input: solutionInput,
            code: solutionCode,
            output: solutionOutput
        };

        try {
            if (isEditing) {
                await updateProgrammingSolution(bookId, solutionId, solutionData);
            } else {
                await addProgrammingSolution(selectedBookId, solutionData);
            }

            showAlertModal({
                title: 'Solution Saved',
                message: 'Programming solution saved successfully.',
                onClose: () => navigate('/programming-solutions')
            });
        } catch (error) {
            console.error('Error saving programming solution:', error);
            showAlertModal({
                title: 'Save Failed',
                message: `Could not save solution: ${error.message}`,
                variant: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    // Secondary guard — ProtectedRoute in App.js is the primary gate, this is defence-in-depth
    if (user && user.role !== 'admin') {
        navigate('/', { replace: true });
        return null;
    }

    if (loading) {
        return (
            <main className="programming-solution-page">
                <Loader text="Loading subjects..." size={140} />
            </main>
        );
    }

    return (
        <main className="programming-solution-page">
            <section className="solution-admin-card">
                <h2>{isEditing ? 'Edit Programming Solution' : 'Add Programming Solution'}</h2>
                <p className="solution-admin-subtitle">
                    {isEditing
                        ? 'Update the selected subject solution.'
                        : 'Select a course and subject, then add the text-based code solution.'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="solution-admin-grid">
                        <label className="solution-form-field">
                            <span>Course <strong>*</strong></span>
                            <select value={selectedCourse} onChange={handleCourseChange} disabled={isEditing} required>
                                <option value="">Select Course</option>
                                {availableCourses.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </label>

                        <label className="solution-form-field">
                            <span>Subject <strong>*</strong></span>
                            <select
                                value={selectedBookId}
                                onChange={handleBookChange}
                                disabled={!selectedCourse || isEditing}
                                required
                            >
                                <option value="">Select Subject</option>
                                {courseBooks.map(courseBook => (
                                    <option key={courseBook.id} value={courseBook.id}>{courseBook.title}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {selectedCourse && courseBooks.length === 0 && (
                        <p className="solution-form-hint">
                            No subjects found in this course. Add books under this course first.
                        </p>
                    )}

                    <div className="solution-admin-grid">
                        <label className="solution-form-field">
                            <span>Solution Title <strong>*</strong></span>
                            <input
                                type="text"
                                value={solutionTitle}
                                onChange={(event) => setSolutionTitle(event.target.value)}
                                placeholder="Example: Check Prime Number"
                                required
                            />
                        </label>

                        <label className="solution-form-field">
                            <span>Programming Language <strong>*</strong></span>
                            <select
                                value={solutionLanguage}
                                onChange={(event) => setSolutionLanguage(event.target.value)}
                                required
                            >
                                <option value="">Select Language</option>
                                {PROGRAMMING_LANGUAGES.map(language => (
                                    <option key={language} value={language}>{language}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="solution-form-field">
                        <span>Description</span>
                        <textarea
                            className="solution-description-input"
                            value={solutionDescription}
                            onChange={(event) => setSolutionDescription(event.target.value)}
                            placeholder="Write a short explanation for this solution."
                        />
                    </label>

                    <label className="solution-form-field">
                        <span>Input</span>
                        <div className="solution-code-editor solution-io-editor">
                            <div className="solution-editor-lines" ref={inputLineNumberRef} aria-hidden="true">
                                {Array.from({ length: solutionInputLineCount }, (_, index) => (
                                    <span key={index}>{index + 1}</span>
                                ))}
                            </div>
                            <textarea
                                className="solution-code-input"
                                value={solutionInput}
                                onChange={(event) => setSolutionInput(event.target.value)}
                                onKeyDown={handleEditorKeyDown(setSolutionInput)}
                                onScroll={handleEditorScroll(inputLineNumberRef)}
                                wrap="off"
                                placeholder="Enter sample input (optional) ..."
                                spellCheck="false"
                            />
                        </div>
                    </label>

                    <label className="solution-form-field">
                        <span>Solution Code <strong>*</strong></span>
                        <div className="solution-code-editor">
                            <div className="solution-editor-lines" ref={lineNumberRef} aria-hidden="true">
                                {Array.from({ length: solutionCodeLineCount }, (_, index) => (
                                    <span key={index}>{index + 1}</span>
                                ))}
                            </div>
                            <textarea
                                className="solution-code-input"
                                value={solutionCode}
                                onChange={(event) => setSolutionCode(event.target.value)}
                                onKeyDown={handleEditorKeyDown(setSolutionCode)}
                                onScroll={handleEditorScroll(lineNumberRef)}
                                wrap="off"
                                placeholder="Write/paste your code here ..."
                                spellCheck="false"
                                required
                            />
                        </div>
                    </label>

                    <label className="solution-form-field">
                        <span>Output</span>
                        <div className="solution-code-editor solution-io-editor">
                            <div className="solution-editor-lines" ref={outputLineNumberRef} aria-hidden="true">
                                {Array.from({ length: solutionOutputLineCount }, (_, index) => (
                                    <span key={index}>{index + 1}</span>
                                ))}
                            </div>
                            <textarea
                                className="solution-code-input"
                                value={solutionOutput}
                                onChange={(event) => setSolutionOutput(event.target.value)}
                                onKeyDown={handleEditorKeyDown(setSolutionOutput)}
                                onScroll={handleEditorScroll(outputLineNumberRef)}
                                wrap="off"
                                placeholder="Enter expected output (optional) ..."
                                spellCheck="false"
                            />
                        </div>
                    </label>

                    <div className="solution-admin-actions">
                        <button type="button" className="solution-cancel-btn" onClick={() => navigate('/programming-solutions')}>
                            Cancel
                        </button>
                        <button type="submit" className="solution-submit-btn" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Solution'}
                        </button>
                    </div>
                </form>
            </section>

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
        </main>
    );
};

export default AddProgrammingSolution;
