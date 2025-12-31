import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { extractTextFromPdf, formatToTopics } from '../utils/pdfUtils';
import './AddBook.css';
import ConfirmationModal from '../components/ConfirmationModal';

const AddBook = () => {
    const { addBook, updateBook, books } = useBooks(); // Added updateBook, books
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID if in edit mode

    const isEditMode = !!id;

    const [title, setTitle] = useState('');
    const [sections, setSections] = useState([]); // Changed to array
    const [image, setImage] = useState(null);
    const [contents, setContents] = useState('');
    const [loading, setLoading] = useState(false);
    const [entryMode, setEntryMode] = useState('pdf'); // 'pdf' or 'manual'

    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

    // Load book data if editing
    useEffect(() => {
        if (isEditMode) {
            const bookToEdit = books.find(b => b.id.toString() === id);
            if (bookToEdit) {
                setTitle(bookToEdit.title);
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

    const handlePdfChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const text = await extractTextFromPdf(file);
                // Format the extracted text to a simpler representation for details
                const formatted = formatToTopics(text);
                setContents(formatted);
            } catch (err) {
                alert('Failed to extract text from PDF');
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

        await saveBook();
    };

    const saveBook = async () => {
        setLoading(true);
        // No more Firebase Storage upload logic needed for cover
        const finalImage = image || 'https://via.placeholder.com/150';

        try {
            const bookData = {
                title,
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
            }
            navigate('/books');
        } catch (error) {
            console.error("Error saving book:", error);
            alert(`Operation failed: ${error.message}`);
        } finally {
            setLoading(false);
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
                                Upload PDF
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
                            <label>Table of Content (PDF):</label>
                            <small>Upload PDF to extract topics automatically</small>
                            <input type="file" accept="application/pdf" onChange={handlePdfChange} />
                            {loading && <p>Extracting text...</p>}
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Enter topics line by line in the below section</label>
                            {/* We re-use 'contents' state so it works seamlessly with submit */}
                        </div>
                    )}

                    <div className="form-group">
                        <label>{entryMode === 'pdf' ? 'Extracted Contents (Editable):' : 'Enter Topics:'}</label>
                        <textarea
                            rows="5"
                            value={contents}
                            onChange={(e) => setContents(e.target.value)}
                            placeholder={entryMode === 'pdf' ? "Topics will appear here..." : "1. Introduction\n2. Chapter 1..."}
                        ></textarea>
                    </div>

                    {/* Description Removed as per request */}

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

            <ConfirmationModal
                isOpen={showDuplicateWarning}
                onClose={() => setShowDuplicateWarning(false)}
                onConfirm={() => {
                    setShowDuplicateWarning(false);
                    saveBook();
                }}
                title="Duplicate Book Warning"
                message="WARNING: A book with the same name exists! Do you still want to add this book?"
            />
        </div>
    );
};

export default AddBook;
