import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuestions } from '../context/QuestionContext';
import { useBooks } from '../context/BookContext';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ConfirmationModal from '../components/ConfirmationModal';
import Loader from '../components/Loader';
import './AddBook.css'; // Reuse styles

// Register custom icon for Find & Replace
const icons = Quill.import('ui/icons');
icons['find-replace'] = `<svg viewBox="0 0 18 18" width="18" height="18"><path class="ql-fill" d="M15.5,14h-.79l-.28-.27A6.47,6.47,0,0,0,16,9.5,6.5,6.5,0,1,0,9.5,16c1.61,0,3.09-.59,4.23-1.57l.27.28v.79l5,4.99L20.49,19l-4.99-5Zm-6,0C7.01,14,5,11.99,5,9.5S7.01,5,9.5,5,14,7.01,14,9.5,11.99,14,9.5,14Z"/></svg>`;

const EditQuestion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { questions, updateQuestion } = useQuestions();
    const { books } = useBooks();

    const [formData, setFormData] = useState({
        course: '',
        subject: '',
        university: '',
        year: '',
        question: '',
        answer: '',
        tags: []
    });

    // Custom subjects and universities (must be declared early for use in derivations)
    const [customSubjects, setCustomSubjects] = useState([]);
    const [customUniversities, setCustomUniversities] = useState([]);

    const [currentTag, setCurrentTag] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiProcessing, setAiProcessing] = useState(false);
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Hidden subjects/universities for deletion
    const [hiddenSubjects, setHiddenSubjects] = useState([]);
    const [hiddenUniversities, setHiddenUniversities] = useState([]);

    // Modal configuration for add/delete confirmations
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        variant: 'danger',
        actionType: null,
        data: null
    });

    // Find and Replace states
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [activeEditor, setActiveEditor] = useState('question'); // 'question' or 'answer'
    const [lastSearchIndex, setLastSearchIndex] = useState(0);

    const subjectDropdownRef = useRef(null);
    const universityDropdownRef = useRef(null);
    const questionQuillRef = useRef(null);
    const answerQuillRef = useRef(null);

    // Stable handler for toggling Find & Replace
    const toggleFindRef = useRef(null);
    toggleFindRef.current = () => setShowFindReplace(prev => !prev);

    useEffect(() => {
        if (questions.length > 0) {
            const q = questions.find(item => item.id === id);
            if (q) {
                setFormData({
                    course: q.course || '',
                    subject: q.subject || '',
                    university: q.university || '',
                    year: q.year || '',
                    question: q.question || '',
                    answer: q.answer || '',
                    tags: q.tags || []
                });
            } else {
                alert("Question not found!");
                navigate('/questions');
            }
            setLoading(false);
        }
    }, [questions, id, navigate]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
                setIsSubjectDropdownOpen(false);
            }
            if (universityDropdownRef.current && !universityDropdownRef.current.contains(event.target)) {
                setIsUniversityDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Derived options
    const courses = [...new Set(books.map(b => b.category))].sort();

    // Combine book subjects and any custom subject currently on this question or presumably others
    // Actually, to fully replicate "dynamic" behavior, we might want to see ALL subjects from ALL questions + Books
    // But adhering to current pattern: Books trigger subjects. Plus whatever is saved.
    const subjects = formData.course
        ? [...new Set([
            ...books.filter(b => b.category === formData.course).map(b => b.title),
            ...questions.filter(q => q.course === formData.course).map(q => q.subject),
            ...customSubjects
        ])].filter(Boolean).filter(sub => !hiddenSubjects.includes(sub)).sort()
        : [];

    // Dynamic Universities
    const universities = [...new Set([
        'MDU', 'IGNOU', 'DU', 'Other',
        ...questions.map(q => q.university),
        ...customUniversities
    ])].filter(Boolean).filter(uni => !hiddenUniversities.includes(uni)).sort();

    // Toggle states for adding new sub/uni
    const [isNewSubject, setIsNewSubject] = useState(false);
    const [isNewUniversity, setIsNewUniversity] = useState(false);

    // Load custom subjects and universities from localStorage
    useEffect(() => {
        try {
            const storedSubjects = localStorage.getItem('customSubjects');
            const storedUniversities = localStorage.getItem('customUniversities');

            if (storedSubjects) {
                const parsed = JSON.parse(storedSubjects);
                const allSubjects = Object.values(parsed).flat();
                setCustomSubjects(allSubjects);
            }

            if (storedUniversities) {
                setCustomUniversities(JSON.parse(storedUniversities));
            }
        } catch (error) {
            console.error('Error loading custom subjects/universities:', error);
        }
    }, []);

    // Quill modules configuration
    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                ['clean', 'link'],
                ['find-replace'] // Custom button
            ],
            handlers: {
                'find-replace': () => {
                    if (toggleFindRef.current) toggleFindRef.current();
                }
            }
        }
    }), []);

    // Find Logic
    const handleFind = () => {
        if (!findText) return;
        const quillRef = activeEditor === 'question' ? questionQuillRef : answerQuillRef;
        if (!quillRef.current) return;

        const quill = quillRef.current.getEditor();
        const text = quill.getText();
        const idx = text.toLowerCase().indexOf(findText.toLowerCase(), lastSearchIndex);

        if (idx !== -1) {
            quill.setSelection(idx, findText.length);
            setLastSearchIndex(idx + 1);
        } else {
            if (lastSearchIndex > 0) {
                if (window.confirm('Reached end of document. Search from top?')) {
                    setLastSearchIndex(0);
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
        const quillRef = activeEditor === 'question' ? questionQuillRef : answerQuillRef;
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
            handleFind();
        }
    };

    // Replace All Logic
    const handleReplaceAll = () => {
        if (!findText) return;
        const fieldName = activeEditor;
        const currentContent = formData[fieldName];

        const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedFind, 'gi');
        const newContent = currentContent.replace(regex, replaceText);

        setFormData(prev => ({ ...prev, [fieldName]: newContent }));

        if (newContent === currentContent) {
            alert('No matches found.');
        } else {
            alert('Replaced all occurrences.');
            setLastSearchIndex(0);
        }
    };

    // Handlers for Add New
    const handleAddSubjectClick = () => {
        if (formData.subject.trim()) {
            const newSubject = formData.subject.trim();

            // Update state
            if (!customSubjects.includes(newSubject)) {
                setCustomSubjects([...customSubjects, newSubject]);
            }

            // Save to localStorage
            try {
                const storedSubjects = localStorage.getItem('customSubjects');
                const subjectsObj = storedSubjects ? JSON.parse(storedSubjects) : {};

                if (!subjectsObj[formData.course]) {
                    subjectsObj[formData.course] = [];
                }

                if (!subjectsObj[formData.course].includes(newSubject)) {
                    subjectsObj[formData.course].push(newSubject);
                }

                localStorage.setItem('customSubjects', JSON.stringify(subjectsObj));
            } catch (error) {
                console.error('Error saving custom subject:', error);
            }

            setIsNewSubject(false);
        } else {
            setIsNewSubject(false);
        }
    };

    const handleAddUniversityClick = () => {
        if (formData.university.trim()) {
            const newUniversity = formData.university.trim();

            // Update state
            const newCustomUniversities = !customUniversities.includes(newUniversity)
                ? [...customUniversities, newUniversity]
                : customUniversities;

            setCustomUniversities(newCustomUniversities);

            // Save to localStorage
            try {
                localStorage.setItem('customUniversities', JSON.stringify(newCustomUniversities));
            } catch (error) {
                console.error('Error saving custom university:', error);
            }

            setIsNewUniversity(false);
        } else {
            setIsNewUniversity(false);
        }
    };

    // Delete Subject Click
    const handleDeleteSubjectClick = (e, subToDelete) => {
        e.stopPropagation();
        e.preventDefault();
        setModalConfig({
            isOpen: true,
            title: 'Delete Subject?',
            message: `Are you sure you want to delete "${subToDelete}"?`,
            confirmText: 'Yes, Delete',
            variant: 'danger',
            actionType: 'DELETE_SUBJECT',
            data: subToDelete
        });
    };

    // Delete University Click
    const handleDeleteUniversityClick = (e, uniToDelete) => {
        e.stopPropagation();
        e.preventDefault();
        setModalConfig({
            isOpen: true,
            title: 'Delete University?',
            message: `Are you sure you want to delete "${uniToDelete}"?`,
            confirmText: 'Yes, Delete',
            variant: 'danger',
            actionType: 'DELETE_UNIVERSITY',
            data: uniToDelete
        });
    };

    // Confirm Modal Action
    const handleConfirmModal = () => {
        const { actionType, data } = modalConfig;

        if (actionType === 'DELETE_SUBJECT') {
            setHiddenSubjects([...hiddenSubjects, data]);
            if (formData.subject === data) {
                setFormData(prev => ({ ...prev, subject: '' }));
            }
        } else if (actionType === 'DELETE_UNIVERSITY') {
            setHiddenUniversities([...hiddenUniversities, data]);
            if (formData.university === data) {
                setFormData(prev => ({ ...prev, university: '' }));
            }
        }

        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCourseChange = (e) => {
        setFormData(prev => ({ ...prev, course: e.target.value, subject: '' }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentTag.trim()) {
                const newTag = currentTag.trim().startsWith('#') ? currentTag.trim() : `#${currentTag.trim()}`;
                if (!formData.tags.includes(newTag)) {
                    setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
                }
                setCurrentTag('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const updateQuestionData = async () => {
        setLoading(true);
        setAiProcessing(true);

        try {
            // Combine question and answer for AI parsing
            const combinedContent = `Q: ${formData.question}\nA: ${formData.answer}`;

            console.log('Sending content to AI for re-parsing...');
            const aiResponse = await fetch('http://localhost:5000/api/ai/parse-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: combinedContent })
            });

            if (!aiResponse.ok) {
                const errorData = await aiResponse.json();
                throw new Error(errorData.message || 'AI parsing failed');
            }

            const { questions: parsedQuestions } = await aiResponse.json();
            console.log('AI successfully re-parsed the question');

            setAiProcessing(false);

            // Use the AI-parsed and normalized content
            // Helper to clean prefixes from content
            const cleanPrefix = (html) => {
                if (!html) return "";
                // Regex to match "Q:", "A:", "Question:", "Answer:" at the start, case-insensitive, optional whitespace/bold tags
                // Also handles <p> tags wrapping the prefix
                return html.replace(/^(?:<[^>]+>)*\s*(?:Q|A|Question|Answer)\s*:\s*(?:<\/[^>]+>)*\s*/i, "");
            };

            const normalizedData = {
                ...formData,
                question: cleanPrefix(parsedQuestions[0].question),
                answer: cleanPrefix(parsedQuestions[0].answer)
            };

            await updateQuestion(id, normalizedData);
            alert("Question updated successfully!");
            navigate('/questions');
        } catch (error) {
            console.error("Error updating question:", error);
            setAiProcessing(false);

            if (error.message.includes('AI parsing failed')) {
                alert(`AI Processing Error: ${error.message}\n\nPlease try again or check your content format.`);
            } else {
                alert(`Failed to update question: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-book-container">
            <div className="add-book-card">
                <h2>Edit Question</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Course <span style={{ color: 'red' }}>*</span>:</label>
                        <div className="select-wrapper">
                            <select
                                name="course"
                                value={formData.course}
                                onChange={(e) => {
                                    handleCourseChange(e);
                                    setIsNewSubject(false); // Reset subject mode on course change
                                }}
                                className="category-select"
                                required
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Subject Field */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Subject <span style={{ color: 'red' }}>*</span>:</label>
                        {!isNewSubject ? (
                            <div className="custom-dropdown-container" style={{ position: 'relative' }} ref={subjectDropdownRef}>
                                <div
                                    className={`custom-dropdown-trigger ${!formData.course ? 'disabled' : ''}`}
                                    onClick={() => {
                                        if (formData.course) {
                                            setIsSubjectDropdownOpen(!isSubjectDropdownOpen);
                                        }
                                    }}
                                >
                                    <span>{formData.subject || "Select Subject"}</span>
                                    <div className="custom-dropdown-arrow"></div>
                                </div>
                                {isSubjectDropdownOpen && (
                                    <div className="custom-dropdown-menu">
                                        <div
                                            className="add-subject-option"
                                            onClick={() => {
                                                setIsNewSubject(true);
                                                setFormData(prev => ({ ...prev, subject: '' }));
                                                setIsSubjectDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '10px 15px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            + Add New Subject
                                        </div>
                                        {subjects.map((sub, idx) => (
                                            <div
                                                key={idx}
                                                className="custom-dropdown-option"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, subject: sub }));
                                                    setIsSubjectDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '10px 15px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <span>{sub}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteSubjectClick(e, sub)}
                                                    style={{
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Delete"
                                                >
                                                    <img
                                                        src="https://img.icons8.com/ios-glyphs/30/trash--v1.png"
                                                        alt="Delete"
                                                        style={{ width: '16px', height: '16px', filter: 'invert(1)' }}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                        {subjects.length === 0 && (
                                            <div style={{ padding: '15px', color: '#999', textAlign: 'center' }}>No subjects available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    name="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Enter new subject name"
                                    required
                                    autoFocus
                                    style={{ flexGrow: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSubjectClick}
                                    style={{
                                        backgroundColor: '#ffd700',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 20px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        color: '#182848'
                                    }}
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsNewSubject(false); setFormData(prev => ({ ...prev, subject: '' })); }}
                                    className="cancel-btn"
                                    style={{ padding: '8px 20px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* University Field */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>University (Optional):</label>
                        {!isNewUniversity ? (
                            <div className="custom-dropdown-container" style={{ position: 'relative' }} ref={universityDropdownRef}>
                                <div
                                    className="custom-dropdown-trigger"
                                    onClick={() => setIsUniversityDropdownOpen(!isUniversityDropdownOpen)}
                                >
                                    <span>{formData.university || "Select University"}</span>
                                    <div className="custom-dropdown-arrow"></div>
                                </div>
                                {isUniversityDropdownOpen && (
                                    <div className="custom-dropdown-menu">
                                        <div
                                            className="add-subject-option"
                                            onClick={() => {
                                                setIsNewUniversity(true);
                                                setFormData(prev => ({ ...prev, university: '' }));
                                                setIsUniversityDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '10px 15px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            + Add New University
                                        </div>
                                        {universities.map((uni, idx) => (
                                            <div
                                                key={idx}
                                                className="custom-dropdown-option"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, university: uni }));
                                                    setIsUniversityDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '10px 15px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <span>{uni}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteUniversityClick(e, uni)}
                                                    style={{
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Delete"
                                                >
                                                    <img
                                                        src="https://img.icons8.com/ios-glyphs/30/trash--v1.png"
                                                        alt="Delete"
                                                        style={{ width: '16px', height: '16px', filter: 'invert(1)' }}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    name="university"
                                    type="text"
                                    value={formData.university}
                                    onChange={handleChange}
                                    placeholder="Enter new university name"
                                    autoFocus
                                    style={{ flexGrow: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddUniversityClick}
                                    style={{
                                        backgroundColor: '#ffd700',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 20px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        color: '#182848'
                                    }}
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsNewUniversity(false); setFormData(prev => ({ ...prev, university: '' })); }}
                                    className="cancel-btn"
                                    style={{ padding: '8px 20px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Year (Optional):</label>
                        <input
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            type="number"
                            placeholder="e.g. 2023"
                        />
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Tags (Press Enter to add):</label>
                        <div className="tags-input-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'white' }}>
                            {formData.tags.map((tag, index) => (
                                <span key={index} style={{
                                    backgroundColor: '#ffd700',
                                    color: '#182848',
                                    padding: '8px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#182848',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            lineHeight: 1,
                                            padding: 0
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={currentTag}
                                onChange={e => setCurrentTag(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Add tag..."
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    flexGrow: 1,
                                    minWidth: '150px',
                                    fontSize: '0.95rem',
                                    color: '#333'
                                }}
                            />
                        </div>
                    </div>

                    {/* Find and Replace Toolbar */}
                    {showFindReplace && (
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <div className="find-replace-toolbar">
                                <select
                                    value={activeEditor}
                                    onChange={(e) => setActiveEditor(e.target.value)}
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        marginRight: '10px'
                                    }}
                                >
                                    <option value="question">Question</option>
                                    <option value="answer">Answer</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Find..."
                                    value={findText}
                                    onChange={(e) => {
                                        setFindText(e.target.value);
                                        setLastSearchIndex(0);
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

                    <div className="form-group">
                        <label>Question <span style={{ color: 'red' }}>*</span>:</label>
                        <ReactQuill
                            ref={questionQuillRef}
                            theme="snow"
                            value={formData.question}
                            onChange={(value) => setFormData(prev => ({ ...prev, question: value }))}
                            placeholder="Enter the question here..."
                            modules={modules}
                            onFocus={() => setActiveEditor('question')}
                        />
                    </div>

                    <div className="form-group">
                        <label>Answer <span style={{ color: 'red' }}>*</span>:</label>
                        <ReactQuill
                            ref={answerQuillRef}
                            theme="snow"
                            value={formData.answer}
                            onChange={(value) => setFormData(prev => ({ ...prev, answer: value }))}
                            placeholder="Enter the answer here..."
                            modules={modules}
                            onFocus={() => setActiveEditor('answer')}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/questions')} disabled={loading || aiProcessing}>Cancel</button>
                        <button
                            type="submit"
                            className="submit-btn"
                            style={{ backgroundColor: '#ffd700', color: '#000' }}
                            disabled={loading || aiProcessing}
                        >
                            {aiProcessing ? 'AI Processing...' : loading ? 'Updating...' : 'Update Question'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    setShowConfirmModal(false);
                    updateQuestionData();
                }}
                title="Confirm Update"
                message={`Are you sure you want to update this question?`}
                variant="yellow"
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmModal}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                variant={modalConfig.variant}
                cancelText="Cancel"
            />
        </div>
    );
};

export default EditQuestion;
