import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { extractTextFromPdf, formatToTopics } from '../utils/pdfUtils';
import './AddBook.css';

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const bookData = {
            title,
            author: "Smart Publications",
            sections, // Send array
            image: image || 'https://via.placeholder.com/150', // Fallback image
            contents: contents || 'No contents available.'
        };

        if (isEditMode) {
            updateBook(parseInt(id), bookData); // Ensure ID is number if your IDs are numbers
            alert('Book updated successfully!');
        } else {
            addBook(bookData);
            alert('Book added successfully!');
        }

        navigate('/books');
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
                        <label>Cover Image:</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} required={!isEditMode} /> {/* Not required on edit if keeping existing */}
                        {image && <img src={image} alt="Preview" className="img-preview" />}
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
        </div>
    );
};

export default AddBook;
