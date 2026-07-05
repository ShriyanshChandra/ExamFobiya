import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { extractTextFromFile, formatToTopics } from '../utils/documentUtils';
import './AddBook.css';
import ConfirmationModal from '../components/ConfirmationModal';
import Loader from '../components/Loader';

const decodeHtmlForNotepad = (value) => {
    if (!value) return '';
    if (Array.isArray(value)) return value.join('\n');

    const text = String(value);
    const hasHtmlSyntax = /<[a-z][\s\S]*>/i.test(text) || /&[a-z0-9#]+;/i.test(text);

    if (!hasHtmlSyntax) return text;

    const withLineBreaks = text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
        .replace(/<li[^>]*>/gi, '- ');

    if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
        return withLineBreaks
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/\u00a0/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    const parsed = new window.DOMParser().parseFromString(withLineBreaks, 'text/html');

    return parsed.body.textContent
        .replace(/\u00a0/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const AddBook = () => {
    const { addBook, updateBook, books, loading: booksLoading } = useBooks();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = !!id;

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [semester, setSemester] = useState('');
    const [sections, setSections] = useState([]);
    const [image, setImage] = useState(null);
    const [contents, setContents] = useState('');
    const [loading, setLoading] = useState(false);
    const [entryMode, setEntryMode] = useState('pdf');

    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [alertModal, setAlertModal] = useState(null);

    const showAlertModal = ({ title, message, variant = 'yellow', onClose }) => {
        setAlertModal({ title, message, variant, onClose });
    };

    const closeAlertModal = () => {
        const closeAction = alertModal?.onClose;
        setAlertModal(null);
        if (closeAction) closeAction();
    };

    // Load book data if editing


    // Load book data if editing
    useEffect(() => {
        if (isEditMode) {
            if (booksLoading) return;

            const bookToEdit = books.find(b => b.id.toString() === id);
            if (bookToEdit) {
                setTitle(bookToEdit.title);
                setCategory(bookToEdit.category || ''); // Load category
                setSemester(bookToEdit.semester || ''); // Load semester
                // Handle legacy 'section' or new 'sections'
                if (bookToEdit.sections) {
                    setSections(bookToEdit.sections);
                } else if (bookToEdit.section) {
                    setSections([bookToEdit.section]);
                } else {
                    setSections([]);
                }

                setImage(bookToEdit.image);
                setContents(decodeHtmlForNotepad(bookToEdit.contents));
                setEntryMode('manual'); // Default to manual to show existing contents
            } else {
                showAlertModal({
                    title: 'Book Not Found',
                    message: 'This book could not be found.',
                    onClose: () => navigate('/books')
                });
            }
        }
    }, [id, books, booksLoading, isEditMode, navigate]);

    // Load from localStorage on mount (only in add mode, not edit mode)
    useEffect(() => {
        if (!isEditMode) {
            const savedData = localStorage.getItem('addBookFormData');
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    setTitle(parsedData.title || '');
                    setCategory(parsedData.category || '');
                    setSemester(parsedData.semester || '');
                    setSections(parsedData.sections || []);
                    setImage(parsedData.image || null);
                    setContents(decodeHtmlForNotepad(parsedData.contents));
                } catch (error) {
                    console.error('Error loading saved form data:', error);
                }
            }
        }
    }, [isEditMode]);

    // Save to localStorage whenever form data changes (only in add mode)
    useEffect(() => {
        if (!isEditMode) {
            const formData = {
                title,
                category,
                semester,
                sections,
                image,
                contents
            };
            localStorage.setItem('addBookFormData', JSON.stringify(formData));
        }
    }, [title, category, semester, sections, image, contents, isEditMode]);

    const [imageUrlInput, setImageUrlInput] = useState('');

    // Helper to convert Drive links to direct view links
    const convertToDirectLink = (url) => {
        if (!url) return '';

        // Extract ID from various Google Drive URL formats
        // 1. /file/d/ID/view
        // 2. /open?id=ID
        // 3. /uc?id=ID (Previously converted links)
        let id = null;
        if (url.includes('drive.google.com/file/d/')) {
            const match = url.match(/file\/d\/([-a-zA-Z0-9_]+)/);
            if (match) id = match[1];
        } else if (url.includes('id=')) {
            const match = url.match(/id=([-a-zA-Z0-9_]+)/);
            if (match) id = match[1];
        }

        if (id) {
            // Use the 'thumbnail' endpoint which is more reliable for images than 'uc'
            // sz=w800 requests a width of 800px (high quality cover)
            return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
        }
        return url; // Return original if not a Drive link
    };

    const handleUrlChange = (e) => {
        const val = e.target.value;
        setImageUrlInput(val);
        const directUrl = convertToDirectLink(val);
        setImage(directUrl); // Update preview immediately
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const text = await extractTextFromFile(file);
                // Format the extracted text to a simpler representation for details
                const formatted = formatToTopics(text);
                setContents(formatted);
            } catch (err) {
                console.error(err);
                showAlertModal({
                    title: 'Extraction Failed',
                    message: 'Failed to extract text from file.',
                    variant: 'danger'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSectionChange = (e) => {
        const { value, checked } = e.target;
        setSections(prev => {
            if (checked) {
                return [...prev, value];
            } else {
                return prev.filter(s => s !== value);
            }
        });
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Trigger native browser validation UI (highlights required fields inline)
        if (!e.target.checkValidity()) {
            e.target.reportValidity();
            return;
        }

        // Normalize title for comparison
        const normalizedTitle = title.trim().toLowerCase();

        // Check for duplicates
        const isDuplicate = books.some(book => {
            const bookTitle = book.title ? book.title.trim().toLowerCase() : "";

            // In edit mode, ignore the current book being edited
            if (isEditMode && book.id.toString() === id) return false;
            return bookTitle === normalizedTitle;
        });

        if (isDuplicate) {
            setShowDuplicateWarning(true);
            return;
        }

        // If not duplicate, show confirmation modal
        setShowConfirmModal(true);
    };

    const handleSyllabusKeyDown = (e) => {
        if (e.key !== 'Tab') return;

        e.preventDefault();

        const { selectionStart, selectionEnd, value } = e.target;
        const updatedContents = `${value.slice(0, selectionStart)}\t${value.slice(selectionEnd)}`;

        setContents(updatedContents);

        requestAnimationFrame(() => {
            e.target.selectionStart = selectionStart + 1;
            e.target.selectionEnd = selectionStart + 1;
        });
    };

    // Reset form to initial state
    const resetForm = () => {
        setTitle('');
        setCategory('');
        setSemester('');
        setSections([]);
        setImage(null);
        setImageUrlInput('');
        setContents('');
        setEntryMode('pdf');

        // Clear localStorage
        localStorage.removeItem('addBookFormData');
    };

    const saveBook = async () => {
        setLoading(true);
        // No more Firebase Storage upload logic needed for cover
        const finalImage = image || 'https://via.placeholder.com/150';

        try {
            const bookData = {
                title,
                category, // Save category
                semester: category === 'BCA' ? semester : null, // Save semester only if BCA
                author: "Smart Publications",
                sections,
                image: finalImage,
                contents: contents || 'No contents available.',
                createdAt: new Date().toISOString() // Add timestamp for stats
            };

            if (isEditMode) {
                await updateBook(id, bookData);
                showAlertModal({
                    title: 'Book Updated',
                    message: 'Book updated successfully!',
                    onClose: () => navigate('/books')
                });
            } else {
                await addBook(bookData);
                // Reset form only when adding (not editing)
                resetForm();
                showAlertModal({
                    title: 'Book Added',
                    message: 'Book added successfully!',
                    onClose: () => navigate('/books')
                });
            }
        } catch (error) {
            console.error("Error saving book:", error);
            showAlertModal({
                title: 'Operation Failed',
                message: `Operation failed: ${error.message}`,
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-book-container">
            <div className="add-book-card">
                <h2>{isEditMode ? 'Edit Book' : 'Add New Book'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row form-row-two">
                        <div className="form-group">
                            <label>Title:</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label>Course Category:</label>
                            <div className="select-wrapper">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="category-select"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="BCA">BCA</option>
                                    <option value="DCA">DCA</option>
                                    <option value="PGDCA">PGDCA</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {category === 'BCA' && (
                        <div className="form-group">
                            <label>Semester:</label>
                            <div className="select-wrapper">
                                <select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="category-select"
                                    required
                                >
                                    <option value="">Select Semester</option>
                                    <option value="BCA 1st Semester">1st Semester</option>
                                    <option value="BCA 2nd Semester">2nd Semester</option>
                                    <option value="BCA 3rd Semester">3rd Semester</option>
                                    <option value="BCA 4th Semester">4th Semester</option>
                                    <option value="BCA 5th Semester">5th Semester</option>
                                    <option value="BCA 6th Semester">6th Semester</option>
                                    <option value="BCA 7th Semester">7th Semester</option>
                                    <option value="BCA 8th Semester">8th Semester</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Author removed - defaulted to Smart Publications */}

                    <div className="form-group">
                        <label>Sections:</label>
                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    value="Best Seller"
                                    checked={sections.includes("Best Seller")}
                                    onChange={handleSectionChange}
                                />
                                Best Seller
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    value="New Arrivals"
                                    checked={sections.includes("New Arrivals")}
                                    onChange={handleSectionChange}
                                />
                                New Arrivals
                            </label>
                            {category === 'BCA' && (
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="BCA Spotlight"
                                        checked={sections.includes("BCA Spotlight")}
                                        onChange={handleSectionChange}
                                    />
                                    BCA Spotlight
                                </label>
                            )}
                            {category === 'DCA' && (
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="DCA Spotlight"
                                        checked={sections.includes("DCA Spotlight")}
                                        onChange={handleSectionChange}
                                    />
                                    DCA Spotlight
                                </label>
                            )}
                            {category === 'PGDCA' && (
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="PGDCA Spotlight"
                                        checked={sections.includes("PGDCA Spotlight")}
                                        onChange={handleSectionChange}
                                    />
                                    PGDCA Spotlight
                                </label>
                            )}
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={true}
                                    disabled
                                />
                                General Books (Always Included)
                            </label>
                        </div>
                    </div>

                    <div className="form-row cover-form-row">
                        <div className="form-group">
                            <label>Cover Image URL (Paste Drive Link):</label>
                            <input
                                type="text"
                                className="url-input"
                                placeholder="https://drive.google.com/file/d/..."
                                value={imageUrlInput}
                                onChange={handleUrlChange}
                                required={!isEditMode && !image}
                            />
                            <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
                                Supports JPEG, PNG, direct links, and Google Drive sharing links.
                            </small>
                        </div>
                        <div className="form-group cover-preview-group">
                            <label>Cover Preview:</label>
                            <div className="image-preview-wrapper">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={title ? `Cover preview for ${title}` : "Book cover preview"}
                                        className="img-preview"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="img-preview-placeholder">No cover selected</div>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="form-group">
                        <label>Content Entry Mode:</label>
                        <div className="entry-mode-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${entryMode === 'pdf' ? 'active' : ''}`}
                                onClick={() => setEntryMode('pdf')}
                            >
                                Upload PDF / DOCX
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${entryMode === 'manual' ? 'active' : ''}`}
                                onClick={() => setEntryMode('manual')}
                            >
                                Manual Entry
                            </button>
                        </div>
                    </div>

                    {entryMode === 'pdf' ? (
                        <div className="form-group">
                            <label>Table of Content (PDF / DOCX):</label>
                            <small>Upload file to extract topics automatically</small>
                            <input
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                            />
                            {loading && <Loader text="Extracting text..." size={120} />}
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Enter topics line by line in the below section</label>
                            {/* We re-use 'contents' state so it works seamlessly with submit */}
                        </div>
                    )}

                    <div className="form-group">
                        <label>{entryMode === 'pdf' ? 'Extracted Contents:' : 'Enter Topics:'}</label>
                        <textarea
                            className="syllabus-notepad"
                            value={contents}
                            onChange={(e) => setContents(e.target.value)}
                            onKeyDown={handleSyllabusKeyDown}
                            placeholder={entryMode === 'pdf' ? "Topics will appear here..." : "Paste your topics here (formatting will be preserved)..."}
                            spellCheck="true"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/books')}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : (isEditMode ? 'Update Book' : 'Add Book')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Warning for Duplicate */}
            <ConfirmationModal
                isOpen={showDuplicateWarning}
                onClose={() => setShowDuplicateWarning(false)}
                onConfirm={() => {
                    setShowDuplicateWarning(false);
                    // For duplicate, we still want to confirm before saving? 
                    // The previous logic was: if duplicate, warn. If confirmed, save. 
                    // Now we might want to chain them, but let's keep it simple: if duplicate confirmed, just save.
                    // Or maybe duplicate confirmation *is* the confirmation.
                    // But to be safe, let's just duplicate warning -> saveBook directly as before.
                    saveBook();
                }}
                title="Duplicate Book Warning"
                message="WARNING: A book with the same name exists! Do you still want to add this book?"
                variant="yellow"
            />

            {/* General Confirmation for Add/Update */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    setShowConfirmModal(false);
                    saveBook();
                }}
                title={isEditMode ? "Confirm Update" : "Confirm Addition"}
                message={isEditMode
                    ? `Are you sure you want to update "${title}"?`
                    : `Are you sure you want to add the book "${title}" to the library?`
                }
                variant="yellow"
            />

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

export default AddBook;
