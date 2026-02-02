import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestions } from '../context/QuestionContext';
import { useBooks } from '../context/BookContext'; // Import BookContext
import ConfirmationModal from '../components/ConfirmationModal';
import './AddBook.css'; // Reuse AddBook styles for consistency

const AddQuestion = () => {
    const { addQuestion, questions } = useQuestions(); // Get questions to derive tags
    const { books } = useBooks(); // Get books to derive subjects
    const navigate = useNavigate();

    const [course, setCourse] = useState('');
    // const [semester, setSemester] = useState(''); // Removed implementation
    const [subject, setSubject] = useState('');
    const [isNewSubject, setIsNewSubject] = useState(false); // Track if user wants to add new subject
    const [customSubjects, setCustomSubjects] = useState([]); // Track user-added subjects locally

    // University dropdown state
    const [isNewUniversity, setIsNewUniversity] = useState(false);
    const [customUniversities, setCustomUniversities] = useState([]);
    const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
    const universityDropdownRef = useRef(null);
    const [hiddenUniversities, setHiddenUniversities] = useState([]);

    // Modal & Dropdown State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        variant: 'danger',
        actionType: null, // 'ADD_SUBJECT', 'DELETE_SUBJECT', 'ADD_UNIVERSITY', 'DELETE_UNIVERSITY'
        data: null
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [hiddenSubjects, setHiddenSubjects] = useState([]); // Track deleted subjects this session

    const [university, setUniversity] = useState('');
    const [year, setYear] = useState('');
    const [currentTagInput, setCurrentTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [questionsList, setQuestionsList] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Derive available subjects based on selected course from Books data
    const availableSubjects = useMemo(() => {
        if (!course) return [];
        const bookSubjects = books
            .filter(book => book.category === course)
            .map(book => book.title)
            .filter(Boolean);

        // Merge with custom added subjects, ensure uniqueness, and filter hidden
        const all = [...new Set([...bookSubjects, ...customSubjects])];
        return all.filter(sub => !hiddenSubjects.includes(sub));
    }, [books, course, customSubjects, hiddenSubjects]);

    // Derive unique existing tags from all questions
    const existingTags = useMemo(() => {
        const allTags = new Set();
        questions.forEach(q => {
            if (q.tags && Array.isArray(q.tags)) {
                q.tags.forEach(t => allTags.add(t));
            }
        });
        return Array.from(allTags);
    }, [questions]);

    // Filter suggestions based on input
    const suggestions = useMemo(() => {
        if (!currentTagInput.trim()) return [];
        const inputLower = currentTagInput.toLowerCase().replace(/^#/, '');
        return existingTags.filter(tag =>
            tag.toLowerCase().replace(/^#/, '').includes(inputLower) &&
            !tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }, [currentTagInput, existingTags, tags]);

    // Click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isDropdownOpen]);

    // Click outside handler for university dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (universityDropdownRef.current && !universityDropdownRef.current.contains(event.target)) {
                setIsUniversityDropdownOpen(false);
            }
        };

        if (isUniversityDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isUniversityDropdownOpen]);

    // Default university options
    const defaultUniversities = ['University 1', 'University 2', 'University 3'];

    // Available universities (default + custom - hidden)
    const availableUniversities = useMemo(() => {
        const all = [...new Set([...defaultUniversities, ...customUniversities])];
        return all.filter(uni => !hiddenUniversities.includes(uni));
    }, [customUniversities, hiddenUniversities]);


    // Handle course change - reset subject
    const handleCourseChange = (e) => {
        setCourse(e.target.value);
        setSubject('');
        setIsNewSubject(false);
        setIsDropdownOpen(false);
    };

    // Handle subject selection from custom dropdown
    // Note: handleSubjectChange for <select> is deprecated/unused now

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questionsList];
        newQuestions[index] = value;
        setQuestionsList(newQuestions);
    };

    const addQuestionField = () => {
        setQuestionsList([...questionsList, '']);
    };

    const removeQuestionField = (index) => {
        const newQuestions = questionsList.filter((_, i) => i !== index);
        setQuestionsList(newQuestions);
    };

    const addTag = (val) => {
        if (val) {
            const formattedTag = val.startsWith('#') ? val : `#${val}`;
            const isDuplicate = tags.some(t => t.toLowerCase() === formattedTag.toLowerCase());
            if (!isDuplicate) {
                setTags([...tags, formattedTag]);
            }
            setCurrentTagInput('');
            setShowSuggestions(false);
        }
    }

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(currentTagInput.trim());
        }
    };

    const handleSuggestionClick = (tag) => {
        addTag(tag);
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // --- Modal & Subject Handlers ---

    // 1. Add Subject Click
    const handleAddSubjectClick = (e) => {
        if (e) e.preventDefault();
        if (subject.trim()) {
            setModalConfig({
                isOpen: true,
                title: 'Add New Subject?',
                message: `Are you sure you want to add "${subject.trim()}" as a new subject?`,
                confirmText: 'Yes, Add Subject',
                variant: 'yellow',
                actionType: 'ADD_SUBJECT',
                data: subject.trim()
            });
        }
    };

    // 2. Delete Subject Click
    const handleDeleteSubjectClick = (e, subToDelete) => {
        e.stopPropagation();
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

    // 3. Confirm Action
    const handleConfirmModal = () => {
        const { actionType, data } = modalConfig;

        if (actionType === 'ADD_SUBJECT') {
            if (!customSubjects.includes(data)) {
                setCustomSubjects([...customSubjects, data]);
            }
            setSubject(data);
            setIsNewSubject(false);
        } else if (actionType === 'DELETE_SUBJECT') {
            setHiddenSubjects([...hiddenSubjects, data]);
            if (subject === data) setSubject('');
        } else if (actionType === 'ADD_UNIVERSITY') {
            if (!customUniversities.includes(data)) {
                setCustomUniversities([...customUniversities, data]);
            }
            setUniversity(data);
            setIsNewUniversity(false);
        } else if (actionType === 'DELETE_UNIVERSITY') {
            setHiddenUniversities([...hiddenUniversities, data]);
            if (university === data) setUniversity('');
        }

        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    // 4. Cancel Add Mode
    const handleCancelAddSubject = () => {
        setIsNewSubject(false);
        setSubject('');
    }

    // Handle Enter key in new subject input
    const handleSubjectKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSubjectClick();
        }
    };

    // --- University Handlers ---

    // 1. Add University Click
    const handleAddUniversityClick = (e) => {
        if (e) e.preventDefault();
        if (university.trim()) {
            setModalConfig({
                isOpen: true,
                title: 'Add New University?',
                message: `Are you sure you want to add "${university.trim()}" as a new university?`,
                confirmText: 'Yes, Add University',
                variant: 'yellow',
                actionType: 'ADD_UNIVERSITY',
                data: university.trim()
            });
        }
    };

    // 2. Delete University Click
    const handleDeleteUniversityClick = (e, uniToDelete) => {
        e.stopPropagation();
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

    // 3. Cancel Add University Mode
    const handleCancelAddUniversity = () => {
        setIsNewUniversity(false);
        setUniversity('');
    };

    // Handle Enter key in new university input
    const handleUniversityKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddUniversityClick();
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Only Course and Subject are strictly required
        if (!course || !subject) {
            alert("Please fill in the Course and Subject fields.");
            return;
        }

        setLoading(true);

        const filledQuestions = questionsList.filter(q => q.trim() !== '');

        const newQuestionData = {
            course,
            // semester, // Removed
            subject,
            university: university || "Unknown University", // Default if null
            year: year || new Date().getFullYear(), // Default if null
            tags, // Replaces title
            questions: filledQuestions
        };

        try {
            await addQuestion(newQuestionData);
            alert('Questions added successfully!');
            navigate('/questions');
        } catch (error) {
            alert('Failed to add questions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-book-container">
            <div className="add-book-card">
                <h2>Add New Questions</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Course <span style={{ color: 'red' }}>*</span>:</label>
                        <div className="select-wrapper">
                            <select
                                value={course}
                                onChange={handleCourseChange}
                                className="category-select"
                                required
                            >
                                <option value="">Select Course</option>
                                <option value="BCA">BCA</option>
                                <option value="DCA">DCA</option>
                                <option value="PGDCA">PGDCA</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Subject <span style={{ color: 'red' }}>*</span>:</label>
                        {!isNewSubject ? (
                            <div className="custom-dropdown-container" style={{ position: 'relative' }} ref={dropdownRef}>
                                <div
                                    className={`custom-dropdown-trigger ${!course ? 'disabled' : ''}`}
                                    onClick={() => {
                                        console.log('Dropdown clicked, course:', course, 'current state:', isDropdownOpen);
                                        if (course) {
                                            setIsDropdownOpen(!isDropdownOpen);
                                        }
                                    }}
                                >
                                    <span>{subject || "Select Subject"}</span>
                                    <div className="custom-dropdown-arrow"></div>
                                </div>
                                {isDropdownOpen && (
                                    <div className="custom-dropdown-menu">
                                        <div
                                            className="add-subject-option"
                                            onClick={() => {
                                                setIsNewSubject(true);
                                                setSubject('');
                                                setIsDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '10px 15px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            + Add New Subject
                                        </div>
                                        {availableSubjects.map((sub, idx) => (
                                            <div
                                                key={idx}
                                                className="subject-option"
                                                onClick={() => {
                                                    setSubject(sub);
                                                    setIsDropdownOpen(false);
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
                                        {availableSubjects.length === 0 && (
                                            <div style={{ padding: '15px', color: '#999', textAlign: 'center' }}>No subjects available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    onKeyDown={handleSubjectKeyDown}
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
                                        color: '#182848',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelAddSubject}
                                    className="cancel-btn"
                                    style={{
                                        padding: '8px 20px',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Confirmation Modal */}
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

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>University (Optional):</label>
                        {!isNewUniversity ? (
                            <div className="custom-dropdown-container" style={{ position: 'relative' }} ref={universityDropdownRef}>
                                <div
                                    className="custom-dropdown-trigger"
                                    onClick={() => setIsUniversityDropdownOpen(!isUniversityDropdownOpen)}
                                >
                                    <span>{university || "Select University"}</span>
                                    <div className="custom-dropdown-arrow"></div>
                                </div>
                                {isUniversityDropdownOpen && (
                                    <div className="custom-dropdown-menu">
                                        <div
                                            className="add-subject-option"
                                            onClick={() => {
                                                setIsNewUniversity(true);
                                                setUniversity('');
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
                                        {availableUniversities.map((uni, idx) => (
                                            <div
                                                key={idx}
                                                className="subject-option"
                                                onClick={() => {
                                                    setUniversity(uni);
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
                                        {availableUniversities.length === 0 && (
                                            <div style={{ padding: '15px', color: '#999', textAlign: 'center' }}>No universities available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={university}
                                    onChange={(e) => setUniversity(e.target.value)}
                                    onKeyDown={handleUniversityKeyDown}
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
                                        color: '#182848',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelAddUniversity}
                                    className="cancel-btn"
                                    style={{
                                        padding: '8px 20px',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Year (Optional):</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="e.g. 2023"
                        />
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Tags (Press Enter to add):</label>
                        <div className="tags-input-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            {tags.map((tag, index) => (
                                <span key={index} style={{
                                    backgroundColor: '#ffd700',
                                    color: '#182848',
                                    padding: '4px 8px',
                                    borderRadius: '16px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
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
                                            lineHeight: 1
                                        }}
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={currentTagInput}
                                onChange={(e) => {
                                    setCurrentTagInput(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                                onKeyDown={handleTagKeyDown}
                                placeholder={tags.length === 0 ? "Type and press Enter (e.g. OS)" : ""}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    flexGrow: 1,
                                    minWidth: '150px'
                                }}
                            />
                        </div>
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="suggestions-list" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                zIndex: 10,
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                maxHeight: '150px',
                                overflowY: 'auto'
                            }}>
                                {suggestions.map((tag, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => handleSuggestionClick(tag)}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Questions:</label>
                        {questionsList.map((q, index) => (
                            <div key={index} className="question-input-group" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    value={q}
                                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                                    placeholder={`Question ${index + 1} `}
                                    required
                                />
                                {questionsList.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestionField(index)}
                                        className="cancel-btn"
                                        style={{ padding: '0 15px', color: 'red', borderColor: 'red' }}
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addQuestionField} className="action-btn" style={{ marginTop: '10px' }}>
                            + Add Another Question
                        </button>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/questions')}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Questions'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQuestion;
