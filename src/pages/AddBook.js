import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { extractTextFromFile, formatToTopics } from '../utils/documentUtils';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './AddBook.css';
import ConfirmationModal from '../components/ConfirmationModal';
import Loader from '../components/Loader';

// Register custom icon for Find & Replace
const icons = Quill.import('ui/icons');
icons['find-replace'] = `<svg viewBox="0 0 18 18" width="18" height="18"><path class="ql-fill" d="M15.5,14h-.79l-.28-.27A6.47,6.47,0,0,0,16,9.5,6.5,6.5,0,1,0,9.5,16c1.61,0,3.09-.59,4.23-1.57l.27.28v.79l5,4.99L20.49,19l-4.99-5Zm-6,0C7.01,14,5,11.99,5,9.5S7.01,5,9.5,5,14,7.01,14,9.5,11.99,14,9.5,14Z"/></svg>`;



const AddBook = () => {
    const { addBook, updateBook, books } = useBooks();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = !!id;

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [semester, setSemester] = useState('');
    const [sections, setSections] = useState([]);
    const [image, setImage] = useState(null);
    const [contents, setContents] = useState('');
    const [loading, setLoading] = useState(false);
    const [entryMode, setEntryMode] = useState('pdf');

    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

    // Find and Replace States
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');

    // Editor Ref and Search State
    const quillRef = useRef(null);
    const [lastSearchIndex, setLastSearchIndex] = useState(0);

    // Stable handler for toggling Find & Replace using Ref for access inside modules
    const toggleFindRef = useRef(null);
    toggleFindRef.current = () => setShowFindReplace(prev => !prev);

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                ['clean', 'link'],
                ['find-replace'] // Custom button name
            ],
            handlers: {
                'find-replace': () => {
                    if (toggleFindRef.current) toggleFindRef.current();
                }
            }
        }
    }), []);

    // Load book data if editing


    // Load book data if editing
    useEffect(() => {
        if (isEditMode) {
            const bookToEdit = books.find(b => b.id.toString() === id);
            if (bookToEdit) {
                setTitle(bookToEdit.title);
                setPrice(bookToEdit.price || ''); // Load price
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
                setContents(bookToEdit.contents);
                setEntryMode('manual'); // Default to manual to show existing contents
            } else {
                alert("Book not found!");
                navigate('/books');
            }
        }
    }, [id, books, isEditMode, navigate]);

    // Load from localStorage on mount (only in add mode, not edit mode)
    useEffect(() => {
        if (!isEditMode) {
            const savedData = localStorage.getItem('addBookFormData');
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    setTitle(parsedData.title || '');
                    setPrice(parsedData.price || '');
                    setCategory(parsedData.category || '');
                    setSemester(parsedData.semester || '');
                    setSections(parsedData.sections || []);
                    setImage(parsedData.image || null);
                    setContents(parsedData.contents || '');
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
                price,
                category,
                semester,
                sections,
                image,
                contents
            };
            localStorage.setItem('addBookFormData', JSON.stringify(formData));
        }
    }, [title, price, category, semester, sections, image, contents, isEditMode]);

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
                alert('Failed to extract text from file');
                console.error(err);
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

    // Reset form to initial state
    const resetForm = () => {
        setTitle('');
        setPrice('');
        setCategory('');
        setSemester('');
        setSections([]);
        setImage(null);
        setImageUrlInput('');
        setContents('');
        setShowFindReplace(false);
        setFindText('');
        setReplaceText('');
        setLastSearchIndex(0);
        setEntryMode('pdf');

        // Clear the Quill editor
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.setText('');
        }

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
                price: parseFloat(price) || 0, // Save price
                category, // Save category
                semester: category === 'BCA' ? semester : null, // Save semester only if BCA
                author: "Smart Publications",
                sections,
                image: finalImage,
                contents: contents || 'No contents available.'
            };

            if (isEditMode) {
                await updateBook(id, bookData);
                alert('Book updated successfully!');
            } else {
                await addBook(bookData);
                alert('Book added successfully!');
                // Reset form only when adding (not editing)
                resetForm();
            }
            navigate('/books');
        } catch (error) {
            console.error("Error saving book:", error);
            alert(`Operation failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Find Logic
    const handleFind = () => {
        if (!findText) return;
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();
        const text = quill.getText();
        const idx = text.toLowerCase().indexOf(findText.toLowerCase(), lastSearchIndex);

        if (idx !== -1) {
            quill.setSelection(idx, findText.length);
            setLastSearchIndex(idx + 1);
        } else {
            if (lastSearchIndex > 0) {
                // Loop back to start
                if (window.confirm('Reached end of document. Search from top?')) {
                    setLastSearchIndex(0);
                    // We can immediately trigger search again here or let user click
                    // Let's trigger it immediately for better UX (but need careful recursion check, so just set 0)
                    // Actually, let's just reset 0 and try to find from 0
                    const retryIdx = text.toLowerCase().indexOf(findText.toLowerCase(), 0);
                    if (retryIdx !== -1) {
                        quill.setSelection(retryIdx, findText.length);
                        setLastSearchIndex(retryIdx + 1);
                    } else {
                        alert('Text not found.');
                    }
                }
            } else {
                alert('Text not found.');
            }
        }
    };

    // Replace Logic
    const handleReplace = () => {
        if (!findText) return;
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

        let didReplace = false;
        if (range && range.length > 0) {
            const selectedText = quill.getText(range.index, range.length);
            if (selectedText.toLowerCase() === findText.toLowerCase()) {
                quill.deleteText(range.index, range.length);
                quill.insertText(range.index, replaceText);
                setLastSearchIndex(range.index + replaceText.length);
                didReplace = true;
            }
        }

        if (!didReplace) {
            handleFind(); // Find next occurrence if current wasn't a match
        } else {
            // After replace, maybe find next automatically?
            // User behavior varies, but often yes.
            // Let's not auto-find next to avoid confusion, but finding is one click away.
            // Or better, stick to "Replace" meaning "Replace current".
        }
    };

    // Replace All Logic
    const handleReplaceAll = () => {
        if (!findText) return;
        // Escape special regex characters
        const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedFind, 'g');
        const newContents = contents.replace(regex, replaceText);
        setContents(newContents);
        if (newContents === contents) {
            alert('No matches found.');
        } else {
            alert('Replaced all occurrences.');
            setLastSearchIndex(0); // Reset search index
        }
    };

    return (
        <div className="add-book-container">
            <div className="add-book-card">
                <h2>{isEditMode ? 'Edit Book' : 'Add New Book'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title:</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Price (₹):</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter price"
                            min="0"
                        />
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
                                        value="BCA Books"
                                        checked={sections.includes("BCA Books")}
                                        onChange={handleSectionChange}
                                    />
                                    BCA Books
                                </label>
                            )}
                            {category === 'DCA' && (
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="DCA Books"
                                        checked={sections.includes("DCA Books")}
                                        onChange={handleSectionChange}
                                    />
                                    DCA Books
                                </label>
                            )}
                            {category === 'PGDCA' && (
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="PGDCA Books"
                                        checked={sections.includes("PGDCA Books")}
                                        onChange={handleSectionChange}
                                    />
                                    PGDCA Books
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
                        {image && (
                            <div className="image-preview-wrapper" style={{ marginTop: '10px' }}>
                                <img
                                    src={image}
                                    alt="Preview"
                                    className="img-preview"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        )}
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

                    {/* Find and Replace Logic */}
                    {/* Find and Replace Logic */}
                    {entryMode === 'manual' && showFindReplace && (
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <div className="find-replace-toolbar">
                                <input
                                    type="text"
                                    placeholder="Find..."
                                    value={findText}
                                    onChange={(e) => {
                                        setFindText(e.target.value);
                                        setLastSearchIndex(0); // Reset search when text changes
                                    }}
                                    className="find-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Replace with..."
                                    value={replaceText}
                                    onChange={(e) => setReplaceText(e.target.value)}
                                    className="find-input"
                                />
                                <button
                                    type="button"
                                    className="action-btn"
                                    style={{ backgroundColor: '#007bff', color: 'white' }}
                                    onClick={handleFind}
                                >
                                    Find
                                </button>
                                <button
                                    type="button"
                                    className="action-btn"
                                    style={{ backgroundColor: '#17a2b8', color: 'white' }}
                                    onClick={handleReplace}
                                >
                                    Replace
                                </button>
                                <button
                                    type="button"
                                    className="action-btn replace-btn"
                                    onClick={handleReplaceAll}
                                >
                                    Replace All
                                </button>
                            </div>
                        </div>
                    )}

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
                        <label>{entryMode === 'pdf' ? 'Extracted Contents (Editable):' : 'Enter Topics:'}</label>
                        <ReactQuill
                            ref={quillRef}
                            key={entryMode}
                            theme="snow"
                            value={contents}
                            onChange={setContents}
                            placeholder={entryMode === 'pdf' ? "Topics will appear here..." : "Paste your topics here (formatting will be preserved)..."}
                            modules={modules}
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
        </div>
    );
};

export default AddBook;
