import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';
import { auth } from '../firebase';
import { getApiUrl } from '../utils/api';
import ConfirmationModal from '../components/ConfirmationModal';
import Loader from '../components/Loader';
import useSEO from '../utils/useSEO';
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

const getSolutionCandidates = (books, language, currentBookId, currentSolutionId) => books.flatMap(book =>
    normalizeSolutions(book)
        .filter(solution => solution.language?.trim().toLowerCase() === language.trim().toLowerCase())
        .filter(solution => !(String(book.id) === String(currentBookId) && String(solution.id) === String(currentSolutionId)))
        .map(solution => ({
            id: `${book.id}__${solution.id}`,
            subject: book.title || 'Untitled subject',
            title: solution.title || '',
            description: solution.description || '',
            input: solution.input || '',
            output: solution.output || '',
            code: solution.code || ''
        }))
);

const normalizeComparisonText = (value) => String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const getComparisonSource = (solution) => [
    solution.title,
    solution.input,
    solution.code,
    solution.output
].map(normalizeComparisonText).join(' - ');

const createSolutionHash = async (solution) => {
    const source = getComparisonSource(solution);

    if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
        const buffer = await globalThis.crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(source)
        );
        return Array.from(new Uint8Array(buffer))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    // Deterministic fallback for non-secure older browser contexts.
    let hash = 2166136261;
    for (let index = 0; index < source.length; index += 1) {
        hash ^= source.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return `fallback-${(hash >>> 0).toString(16)}`;
};

const getComparisonTokens = (solution) => new Set(
    getComparisonSource(solution)
        .split(/[^a-z0-9+#]+/i)
        .filter(token => token.length > 1)
);

const getLocalSimilarityScore = (firstSolution, secondSolution) => {
    const firstTokens = getComparisonTokens(firstSolution);
    const secondTokens = getComparisonTokens(secondSolution);
    if (firstTokens.size === 0 || secondTokens.size === 0) return 0;

    let overlap = 0;
    firstTokens.forEach(token => {
        if (secondTokens.has(token)) overlap += 1;
    });

    return overlap / Math.sqrt(firstTokens.size * secondTokens.size);
};

const AddProgrammingSolution = () => {
    const navigate = useNavigate();
    const { bookId, solutionId } = useParams();
    const { user } = useAuth();
    const { books, loading, addProgrammingSolution, updateProgrammingSolution } = useBooks();

    useSEO({
        title: 'Add Programming Solution - Code Management',
        description: 'Add or edit programming solutions with source code for BCA, DCA, and PGDCA courses.',
        path: '/add-solution',
        noindex: true
    });
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
    const [similarModal, setSimilarModal] = useState(null);
    const [previewSolution, setPreviewSolution] = useState(null);
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

    const saveSolution = async (solutionData) => {
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
    };

    const checkForSimilarSolutions = async (solutionData) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return [];

        const candidates = getSolutionCandidates(
            books,
            solutionData.language,
            isEditing ? bookId : null,
            isEditing ? solutionId : null
        );
        if (candidates.length === 0) return [];

        const currentHash = await createSolutionHash(solutionData);
        const candidatesWithHashes = await Promise.all(candidates.map(async candidate => ({
            ...candidate,
            hash: await createSolutionHash(candidate)
        })));

        const exactMatches = candidatesWithHashes
            .filter(candidate => candidate.hash === currentHash)
            .map(candidate => ({
                id: candidate.id,
                score: 1,
                reason: 'This solution has the same normalized topic, input, code, and output.',
                solution: candidate
            }));

        if (exactMatches.length > 0) return exactMatches;

        // Only send the most promising local candidates to AI instead of the full language set.
        const shortlistedCandidates = candidatesWithHashes
            .map(candidate => ({
                ...candidate,
                localScore: getLocalSimilarityScore(solutionData, candidate)
            }))
            .filter(candidate => candidate.localScore >= 0.12)
            .sort((first, second) => second.localScore - first.localScore)
            .slice(0, 5);

        if (shortlistedCandidates.length === 0) return [];

        const token = await currentUser.getIdToken();
        const response = await fetch(getApiUrl('/api/ai/check-similar-programming-solutions'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                solution: {
                    title: solutionData.title,
                    language: solutionData.language,
                    description: solutionData.description,
                    input: solutionData.input,
                    output: solutionData.output
                },
                candidates: shortlistedCandidates
                    .map(candidate => ({ ...candidate, description: candidate.description.slice(0, 700), input: candidate.input.slice(0, 500), output: candidate.output.slice(0, 500), code: candidate.code.slice(0, 2500), hash: undefined, localScore: undefined }))
            })
        });

        if (!response.ok) throw new Error('Similarity check unavailable');
        const data = await response.json();
        const candidateMap = new Map(candidates.map(candidate => [candidate.id, candidate]));
        return (data.matches || []).map(match => ({ ...match, solution: candidateMap.get(match.id) })).filter(match => match.solution);
    };

    const dismissSimilarityModal = () => {
        // Dismissing this advisory must leave the current edit completely untouched.
        setPreviewSolution(null);
        setSimilarModal(null);
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
            let matches = [];
            try {
                matches = await checkForSimilarSolutions(solutionData);
            } catch (similarityError) {
                // Similarity is an advisory check. Preserve the normal save path if AI is unavailable.
                console.warn('Programming-solution similarity check unavailable:', similarityError.message);
            }

            if (matches.length > 0) {
                setSimilarModal({ matches, solutionData });
                return;
            }
            await saveSolution(solutionData);
        } catch (error) {
            console.error('Error saving programming solution:', error);
            showAlertModal({ title: 'Save Failed', message: `Could not save solution: ${error.message}`, variant: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    const proceedAfterSimilarityCheck = async () => {
        if (!similarModal) return;
        setSimilarModal(null);
        setSaving(true);
        try {
            await saveSolution(similarModal.solutionData);
        } catch (error) {
            console.error('Error saving programming solution:', error);
            showAlertModal({ title: 'Save Failed', message: `Could not save solution: ${error.message}`, variant: 'danger' });
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
                <h1>{isEditing ? 'Edit Programming Solution' : 'Add Programming Solution'}</h1>
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

            {similarModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="similar-solutions-title">
                    <div className="modal-content confirmation-modal similar-solutions-modal">
                        <div className="modal-header">
                            <h3 id="similar-solutions-title">Similar question found</h3>
                            <button type="button" className="close-btn" onClick={dismissSimilarityModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>A similar {solutionLanguage} programming question already exists. Do you still want to proceed?</p>
                            <div className="similar-solutions-list">
                                {similarModal.matches.map(match => (
                                    <div className="similar-solution-item" key={match.id}>
                                        <div>
                                            <strong>{match.solution.title}</strong>
                                            <span>{match.solution.subject}</span>
                                            <small>{match.reason}</small>
                                        </div>
                                        <button type="button" className="similar-preview-btn" onClick={() => setPreviewSolution(match.solution)}>Preview</button>
                                    </div>
                                ))}
                            </div>
                            {previewSolution && (
                                <div className="similar-solution-preview">
                                    <div className="similar-preview-heading">
                                        <strong>{previewSolution.title}</strong>
                                        <button type="button" onClick={() => setPreviewSolution(null)}>Close preview</button>
                                    </div>
                                    <p><strong>Subject:</strong> {previewSolution.subject}</p>
                                    {previewSolution.description && <p>{previewSolution.description}</p>}
                                    {previewSolution.input && <pre><strong>Input</strong>{`\n${previewSolution.input}`}</pre>}
                                    {previewSolution.output && <pre><strong>Output</strong>{`\n${previewSolution.output}`}</pre>}
                                    {previewSolution.code && <pre className="similar-solution-code"><strong>Solution</strong>{`\n${previewSolution.code}`}</pre>}
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={dismissSimilarityModal}>No, Cancel</button>
                            <button type="button" className="confirm-btn yellow" onClick={proceedAfterSimilarityCheck}>Yes, Proceed</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AddProgrammingSolution;
