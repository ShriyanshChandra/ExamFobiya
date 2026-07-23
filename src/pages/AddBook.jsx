import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

const getSyllabusLineCount = (value) => String(value || '').split('\n').length;

const normalizeSyllabusPageNumbers = (pageNumbers, lineCount) => {
    let safePageNumbers = [];

    if (Array.isArray(pageNumbers)) {
        safePageNumbers = pageNumbers;
    } else if (pageNumbers && typeof pageNumbers === 'object') {
        safePageNumbers = Object.keys(pageNumbers)
            .sort((a, b) => Number(a) - Number(b))
            .map(key => pageNumbers[key]);
    }

    return Array.from({ length: lineCount }, (_, index) => {
        const pageNumber = safePageNumbers[index];
        if (pageNumber === undefined || pageNumber === null) return '';

        const normalizedPageNumber = String(pageNumber).trim();
        return normalizedPageNumber.toLowerCase() === 'pg' ? '' : normalizedPageNumber;
    });
};

const getStoredSyllabusPageNumbers = (book) => (
    book?.syllabusPageNumbers ||
    book?.syllabusPages ||
    book?.pageNumbers ||
    book?.pages ||
    []
);

const countVisiblePageNumbers = (pageNumbers) => (
    normalizeSyllabusPageNumbers(
        pageNumbers,
        Array.isArray(pageNumbers) ? pageNumbers.length : Object.keys(pageNumbers || {}).length
    ).filter(pageNumber => pageNumber.trim()).length
);

const pickBestBookForEdit = (routeStateBook, contextBook, id) => {
    const matchingRouteStateBook = routeStateBook?.id?.toString() === id ? routeStateBook : null;
    if (!matchingRouteStateBook) return contextBook;
    if (!contextBook) return matchingRouteStateBook;

    const routePageCount = countVisiblePageNumbers(getStoredSyllabusPageNumbers(matchingRouteStateBook));
    const contextPageCount = countVisiblePageNumbers(getStoredSyllabusPageNumbers(contextBook));

    return contextPageCount > routePageCount ? contextBook : matchingRouteStateBook;
};

const splitSyllabusContentsAndPages = (value, pageNumbers = []) => {
    const lines = String(value || '').split('\n');
    const normalizedPages = normalizeSyllabusPageNumbers(pageNumbers, lines.length);
    const extractedPages = [...normalizedPages];

    const cleanedLines = lines.map((line, index) => {
        const match = line.match(/^(.*?)(?:\s*[.\u00b7\u2022\u2023\u2024\u2027\u2026\u2219\u22c5\u25cf\u30fb\ufe52\uff0e]{2,}\s*)([a-zA-Z]?\d+(?:[-–]\d+)?[a-zA-Z]?)\s*$/);
        if (!match) return line;

        if (!String(extractedPages[index] || '').trim()) {
            extractedPages[index] = match[2].trim();
        }

        return match[1].trimEnd();
    });

    return {
        contents: cleanedLines.join('\n'),
        pageNumbers: extractedPages
    };
};

const AddBook = () => {
    const { addBook, updateBook, books, loading: booksLoading } = useBooks();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const isEditMode = !!id;

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [semester, setSemester] = useState('');
    const [sections, setSections] = useState([]);
    const [sectionOrders, setSectionOrders] = useState({});
    const [image, setImage] = useState(null);
    const [syllabus, setSyllabus] = useState({ contents: '', pageNumbers: [''] });
    const [loading, setLoading] = useState(false);
    const [entryMode, setEntryMode] = useState('pdf');
    const syllabusPageGutterRef = useRef(null);
    const syllabusPageInputRefs = useRef([]);

    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [alertModal, setAlertModal] = useState(null);
    const contents = syllabus.contents;
    const syllabusPageNumbers = syllabus.pageNumbers;

    const showAlertModal = ({ title, message, variant = 'yellow', onClose }) => {
        setAlertModal({ title, message, variant, onClose });
    };

    const closeAlertModal = () => {
        const closeAction = alertModal?.onClose;
        setAlertModal(null);
        if (closeAction) closeAction();
    };

    // Load book data if editing
    useEffect(() => {
        if (isEditMode) {
            if (booksLoading) return;

            const routeStateBook = location.state?.book;
            const contextBook = books.find(b => b.id.toString() === id);
            const bookToEdit = pickBestBookForEdit(routeStateBook, contextBook, id);
            if (bookToEdit) {
                setTitle(bookToEdit.title);
                setCategory(bookToEdit.category || ''); // Load category
                setSemester(bookToEdit.semester || ''); // Load semester
                // Handle legacy 'section' or new 'sections'
                let loadedSections = [];
                if (bookToEdit.sections) {
                    loadedSections = [...bookToEdit.sections];
                } else if (bookToEdit.section) {
                    loadedSections = [bookToEdit.section];
                }

                // Normalize older 'Books' labels to 'Spotlight' labels for the UI
                loadedSections = loadedSections.map(s => {
                    if (s === 'BCA Books') return 'BCA Spotlight';
                    if (s === 'DCA Books') return 'DCA Spotlight';
                    if (s === 'PGDCA Books') return 'PGDCA Spotlight';
                    return s;
                });

                // Remove duplicates just in case a book had both
                setSections([...new Set(loadedSections)]);
                setSectionOrders(bookToEdit.sectionOrders || {});

                setImage(bookToEdit.image);
                const loadedSyllabus = splitSyllabusContentsAndPages(
                    decodeHtmlForNotepad(bookToEdit.contents),
                    getStoredSyllabusPageNumbers(bookToEdit),
                );
                setSyllabus(loadedSyllabus);
                setEntryMode('manual'); // Default to manual to show existing contents
            } else {
                showAlertModal({
                    title: 'Book Not Found',
                    message: 'This book could not be found.',
                    onClose: () => navigate('/books')
                });
            }
        }
    }, [id, books, booksLoading, isEditMode, location.state, navigate]);

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
                    const loadedSyllabus = splitSyllabusContentsAndPages(
                        decodeHtmlForNotepad(parsedData.contents),
                        parsedData.syllabusPageNumbers,
                    );
                    setSyllabus(loadedSyllabus);
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
                contents: syllabus.contents,
                syllabusPageNumbers: syllabus.pageNumbers
            };
            localStorage.setItem('addBookFormData', JSON.stringify(formData));
        }
    }, [title, category, semester, sections, image, syllabus, isEditMode]);

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
                const extractedSyllabus = splitSyllabusContentsAndPages(formatted);
                setSyllabus(extractedSyllabus);
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

        setSectionOrders(prev => {
            if (checked) {
                let relevantBooks = [];
                if (value === 'Best Seller' || value === 'New Arrivals' || value === 'General Books') {
                    relevantBooks = books;
                } else if (value === 'BCA Spotlight') {
                    relevantBooks = books.filter(b => b.category === 'BCA');
                } else if (value === 'DCA Spotlight') {
                    relevantBooks = books.filter(b => b.category === 'DCA');
                } else if (value === 'PGDCA Spotlight') {
                    relevantBooks = books.filter(b => b.category === 'PGDCA');
                }
                const currentBookInList = isEditMode ? relevantBooks.some(b => b.id.toString() === id) : false;
                const maxAllowedOrder = Math.max(1, currentBookInList ? relevantBooks.length : relevantBooks.length + 1);

                // Find first available spot
                let assigned = 1;
                for (let i = 1; i <= maxAllowedOrder; i++) {
                    const taken = books.some(b => b.id.toString() !== id && b.sections?.includes(value) && b.sectionOrders?.[value] === i);
                    if (!taken) {
                        assigned = i;
                        break;
                    }
                }
                return { ...prev, [value]: assigned };
            } else {
                const newOrders = { ...prev };
                delete newOrders[value];
                return newOrders;
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

        setSyllabus(prev => ({
            contents: updatedContents,
            pageNumbers: normalizeSyllabusPageNumbers(prev.pageNumbers, getSyllabusLineCount(updatedContents))
        }));

        requestAnimationFrame(() => {
            e.target.selectionStart = selectionStart + 1;
            e.target.selectionEnd = selectionStart + 1;
        });
    };

    const handleSyllabusChange = (e) => {
        const nextSyllabus = splitSyllabusContentsAndPages(e.target.value, syllabusPageNumbers);
        setSyllabus(nextSyllabus);
    };

    const handleSyllabusPageNumberChange = (lineIndex, value) => {
        setSyllabus(prev => {
            const next = normalizeSyllabusPageNumbers(prev.pageNumbers, getSyllabusLineCount(prev.contents));
            next[lineIndex] = value;
            return { ...prev, pageNumbers: next };
        });
    };

    const focusSyllabusPageInput = (lineIndex) => {
        const nextInput = syllabusPageInputRefs.current[lineIndex];
        if (!nextInput) return;

        nextInput.focus();
        nextInput.select();
    };

    const handleSyllabusPageNumberKeyDown = (e, lineIndex) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusSyllabusPageInput(Math.min(lineIndex + 1, visibleSyllabusPageNumbers.length - 1));
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusSyllabusPageInput(Math.max(lineIndex - 1, 0));
        }
    };

    const handleSyllabusScroll = (e) => {
        if (syllabusPageGutterRef.current) {
            syllabusPageGutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setTitle('');
        setCategory('');
        setSemester('');
        setSections([]);
        setSectionOrders({});
        setImage(null);
        setImageUrlInput('');
        setSyllabus({ contents: '', pageNumbers: [''] });
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
                sectionOrders,
                image: finalImage,
                contents: syllabus.contents || 'No contents available.',
                syllabusPageNumbers: normalizeSyllabusPageNumbers(
                    syllabus.pageNumbers,
                    getSyllabusLineCount(syllabus.contents)
                ),
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

    const renderSectionCheckbox = (value, label, disabled = false) => {
        const isChecked = sections.includes(value);

        let relevantBooks = [];
        if (value === 'Best Seller' || value === 'New Arrivals' || value === 'General Books') {
            relevantBooks = books;
        } else if (value === 'BCA Spotlight') {
            relevantBooks = books.filter(b => b.category === 'BCA');
        } else if (value === 'DCA Spotlight') {
            relevantBooks = books.filter(b => b.category === 'DCA');
        } else if (value === 'PGDCA Spotlight') {
            relevantBooks = books.filter(b => b.category === 'PGDCA');
        }

        const currentBookInList = isEditMode ? relevantBooks.some(b => b.id.toString() === id) : false;
        const maxOrder = Math.max(1, currentBookInList ? relevantBooks.length : relevantBooks.length + 1);
        const options = Array.from({ length: maxOrder }, (_, i) => i + 1);

        const handleOrderChange = (e) => {
            const newOrder = Number(e.target.value);

            const isTaken = books.some(b =>
                b.id.toString() !== id &&
                b.sections?.includes(value) &&
                b.sectionOrders?.[value] === newOrder
            );

            if (isTaken) {
                showAlertModal({
                    title: 'Position Taken',
                    message: 'This position is already taken by another book. Please choose another position or change the position of that book.',
                    variant: 'yellow'
                });
                return;
            }

            setSectionOrders(prev => ({ ...prev, [value]: newOrder }));
        };

        return (
            <div className="checkbox-item-container" key={value}>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        value={value}
                        checked={disabled ? true : isChecked}
                        onChange={disabled ? undefined : handleSectionChange}
                        disabled={disabled}
                    />
                    {label}
                </label>
                {isChecked && !disabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-color, #555)', fontWeight: 'normal' }}>Order:</span>
                        <select
                            className="order-dropdown"
                            value={sectionOrders[value] || ''}
                            onChange={handleOrderChange}
                        >
                            <option value="" disabled>Category Order</option>
                            {options.map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        );
    };

    const syllabusLineCount = getSyllabusLineCount(contents);
    const visibleSyllabusPageNumbers = normalizeSyllabusPageNumbers(syllabusPageNumbers, syllabusLineCount);

    return (
        <div className="add-book-container">
            <div className="add-book-card container">
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
                        <div className="addbook-checkbox-group">
                            {renderSectionCheckbox("General Books", "General Books (Always Included)", true)}
                            {renderSectionCheckbox("Best Seller", "Best Seller")}
                            {renderSectionCheckbox("New Arrivals", "New Arrivals")}
                            {category === 'BCA' && renderSectionCheckbox("BCA Spotlight", "BCA Spotlight")}
                            {category === 'DCA' && renderSectionCheckbox("DCA Spotlight", "DCA Spotlight")}
                            {category === 'PGDCA' && renderSectionCheckbox("PGDCA Spotlight", "PGDCA Spotlight")}
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
                        <div className="syllabus-editor-label-row">
                            <label>{entryMode === 'pdf' ? 'Extracted Contents:' : 'Enter Topics:'}</label>
                            <span>Page no.:</span>
                        </div>
                        <div className="syllabus-editor-shell">
                            <textarea
                                className="syllabus-notepad"
                                value={contents}
                                onChange={handleSyllabusChange}
                                onKeyDown={handleSyllabusKeyDown}
                                onScroll={handleSyllabusScroll}
                                placeholder={entryMode === 'pdf' ? "Topics will appear here..." : "Paste your topics here (formatting will be preserved)..."}
                                spellCheck="true"
                                wrap="off"
                            />
                            <div
                                className="syllabus-page-gutter"
                                ref={syllabusPageGutterRef}
                                aria-label="Editable syllabus page numbers"
                            >
                                {visibleSyllabusPageNumbers.map((pageNumber, index) => (
                                    <div className="syllabus-page-row" key={`syllabus-page-${index}`}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="syllabus-page-input"
                                            value={pageNumber}
                                            ref={(element) => {
                                                syllabusPageInputRefs.current[index] = element;
                                            }}
                                            onChange={(e) => handleSyllabusPageNumberChange(index, e.target.value)}
                                            onKeyDown={(e) => handleSyllabusPageNumberKeyDown(e, index)}
                                            placeholder="Pg"
                                            aria-label={`Page number for syllabus line ${index + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
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
