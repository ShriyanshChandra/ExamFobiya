import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestions } from '../context/QuestionContext';
// import { useBooks } from '../context/BookContext'; // Unused
import ConfirmationModal from '../components/ConfirmationModal';
import { extractTextFromFile, formatToTopics } from '../utils/documentUtils';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Loader from '../components/Loader';
import { onSnapshot } from 'firebase/firestore'; // Import onSnapshot for local listener
import './AddBook.css'; // Reuse AddBook styles for consistency

// Register custom icon for Find & Replace
const icons = Quill.import('ui/icons');
icons['find-replace'] = `<svg viewBox="0 0 18 18" width="18" height="18"><path class="ql-fill" d="M15.5,14h-.79l-.28-.27A6.47,6.47,0,0,0,16,9.5,6.5,6.5,0,1,0,9.5,16c1.61,0,3.09-.59,4.23-1.57l.27.28v.79l5,4.99L20.49,19l-4.99-5Zm-6,0C7.01,14,5,11.99,5,9.5S7.01,5,9.5,5,14,7.01,14,9.5,11.99,14,9.5,14Z"/></svg>`;

// Default universities removed - now purely dynamic from DB

const AddQuestion = () => {
    const {
        addQuestion,
        questions,
        universities: dbUniversities,
        addSubject: addSubjectToDb,
        deleteSubject: deleteSubjectFromDb,
        addUniversity: addUniversityToDb,
        deleteUniversity: deleteUniversityFromDb,
        getSubjects // Get helper to fetch nested subjects
    } = useQuestions(); // Get questions and new DB collections
    // const { books } = useBooks(); // Removed unused import
    const navigate = useNavigate();

    const [course, setCourse] = useState('');
    // const [semester, setSemester] = useState(''); // Removed implementation
    const [subject, setSubject] = useState('');
    const [isNewSubject, setIsNewSubject] = useState(false); // Track if user wants to add new subject
    const [nestedSubjects, setNestedSubjects] = useState([]); // Store subjects for selected course

    // University dropdown state
    const [isNewUniversity, setIsNewUniversity] = useState(false);
    const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
    const universityDropdownRef = useRef(null);

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

    const [university, setUniversity] = useState('');
    const [year, setYear] = useState('');
    const [currentTagInput, setCurrentTagInput] = useState('');
    const [tags, setTags] = useState([]);

    // Track temporarily added items for cleanup on Cancel
    const [tempAddedSubject, setTempAddedSubject] = useState(null);
    const [tempAddedUniversity, setTempAddedUniversity] = useState(null);

    // Editor and file upload states
    const [questionContent, setQuestionContent] = useState(''); // Quill editor content
    const [entryMode, setEntryMode] = useState('pdf'); // 'pdf' or 'manual'
    const [loading, setLoading] = useState(false);
    const [aiProcessing, setAiProcessing] = useState(false); // Track AI parsing status

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

    const [showSuggestions, setShowSuggestions] = useState(false);

    // React Quill toolbar configuration
    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline'],
                ['link'],
                ['find-replace'] // Custom button for Find & Replace
            ],
            handlers: {
                'find-replace': function () {
                    if (toggleFindRef.current) {
                        toggleFindRef.current();
                    }
                }
            }
        }
    }), []);

    // Effect: Fetch subjects when course changes
    useEffect(() => {
        if (!course) {
            setNestedSubjects([]);
            return;
        }

        const unsubscribe = onSnapshot(getSubjects(course), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNestedSubjects(data);
        }, (error) => {
            console.error("Error fetching nested subjects:", error);
        });

        return () => unsubscribe();
    }, [course, getSubjects]);

    // Derive available subjects from Nested DB and existing questions
    const availableSubjects = useMemo(() => {
        if (!course) return [];

        // Subjects from DB collection
        const dbOptions = nestedSubjects.map(doc => doc.name);

        // Also get subjects from existing questions for this course (legacy support)
        const questionSubjects = questions
            .filter(q => q.course === course)
            .map(q => q.subject)
            .filter(Boolean);

        // Merge and unique
        return [...new Set([...dbOptions, ...questionSubjects])].sort();
    }, [course, nestedSubjects, questions]);

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

    // Removed localStorage effect for custom subjects/universities

    // Removed localStorage effects as requested

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

    // Available universities from DB and existing questions
    const availableUniversities = useMemo(() => {
        const dbUniNames = dbUniversities.map(u => u.name);
        // We can still optionally include unis from existing questions if we want to support legacy data visibility
        const questionUniversities = questions.map(q => q.university).filter(Boolean);
        return [...new Set([...dbUniNames, ...questionUniversities])].sort();
    }, [dbUniversities, questions]);



    // Handle course change - reset subject
    const handleCourseChange = (e) => {
        setCourse(e.target.value);
        setSubject('');
        setIsNewSubject(false);
        setIsDropdownOpen(false);
    };

    // Handle subject selection from custom dropdown
    // Note: handleSubjectChange for <select> is deprecated/unused now

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
    // 3. Confirm Action
    const handleConfirmModal = async () => {
        const { actionType, data } = modalConfig;

        try {
            if (actionType === 'ADD_SUBJECT') {
                // Check if already exists in DB to prevent duplicates
                const exists = nestedSubjects.some(s => s.name === data);
                if (!exists) {
                    await addSubjectToDb({ name: data, course });
                    setSubject(data);
                    setTempAddedSubject(data); // Track for potential rollback
                } else {
                    setSubject(data); // Just select it if exists
                }
                setIsNewSubject(false);

            } else if (actionType === 'DELETE_SUBJECT') {
                // Cascading delete using the logic from context
                await deleteSubjectFromDb(course, data);
                if (subject === data) setSubject('');
            } else if (actionType === 'ADD_UNIVERSITY') {
                const exists = dbUniversities.some(u => u.name === data);
                if (!exists) {
                    await addUniversityToDb({ name: data });
                    setUniversity(data);
                    setTempAddedUniversity(data); // Track for potential rollback
                } else {
                    setUniversity(data);
                }
                setIsNewUniversity(false);

            } else if (actionType === 'DELETE_UNIVERSITY') {
                const uniDoc = dbUniversities.find(u => u.name === data);
                if (uniDoc) {
                    await deleteUniversityFromDb(uniDoc.id);
                    if (university === data) setUniversity('');
                }
            }
        } catch (error) {
            console.error("Error performing action:", error);
            alert("Failed to perform action. Check console.");
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
    const handleDeleteUniversityClick = async (e, uniName) => {
        e.stopPropagation();
        e.preventDefault(); // Stop form submission just in case

        setModalConfig({
            isOpen: true,
            title: 'Delete University',
            message: `Are you sure you want to delete university "${uniName}"? This cannot be undone.`,
            confirmText: 'Delete',
            variant: 'danger',
            actionType: 'DELETE_UNIVERSITY',
            data: uniName
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

    // --- File Upload Handler ---
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const text = await extractTextFromFile(file);
                const formatted = formatToTopics(text);
                setQuestionContent(formatted);
            } catch (err) {
                alert('Failed to extract text from file');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    // --- Find and Replace Handlers ---

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
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();
        const selection = quill.getSelection();
        if (selection && selection.length > 0) {
            const selectedText = quill.getText(selection.index, selection.length);
            if (selectedText.toLowerCase() === findText.toLowerCase()) {
                quill.deleteText(selection.index, selection.length);
                quill.insertText(selection.index, replaceText);
                quill.setSelection(selection.index + replaceText.length, 0);
            }
        }
    };

    // Replace All Logic
    const handleReplaceAll = () => {
        if (!findText) {
            alert('Please enter text to find.');
            return;
        }
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();
        let text = quill.getText();
        const searchRegex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let count = 0;
        let match;
        const replacements = [];

        while ((match = searchRegex.exec(text)) !== null) {
            replacements.push({ index: match.index, length: match[0].length });
            count++;
        }

        // Replace in reverse order to maintain correct indices
        for (let i = replacements.length - 1; i >= 0; i--) {
            const { index, length } = replacements[i];
            quill.deleteText(index, length);
            quill.insertText(index, replaceText);
        }

        if (count > 0) {
            alert(`Replaced ${count} occurrence(s).`);
        } else {
            alert('Text not found.');
        }
        setLastSearchIndex(0);
    };


    // Reset form to initial state
    const resetForm = async () => {
        // Cleanup temporarily added items if they weren't used
        if (tempAddedSubject && course) {
            console.log("Rolling back unused subject:", tempAddedSubject);
            try {
                await deleteSubjectFromDb(course, tempAddedSubject);
            } catch (e) {
                console.error("Failed to rollback subject:", e);
            }
        }
        if (tempAddedUniversity) {
            console.log("Rolling back unused university:", tempAddedUniversity);
            try {
                const uniDoc = dbUniversities.find(u => u.name === tempAddedUniversity);
                if (uniDoc) {
                    await deleteUniversityFromDb(uniDoc.id);
                }
            } catch (e) {
                console.error("Failed to rollback university:", e);
            }
        }

        setTempAddedSubject(null);
        setTempAddedUniversity(null);
        setCourse('');
        setSubject('');
        setIsNewSubject(false);
        setUniversity('');
        setYear('');
        setTags([]);
        setCurrentTagInput('');
        setQuestionContent('');
        setShowFindReplace(false);
        setFindText('');
        setReplaceText('');
        setLastSearchIndex(0);

        // localStorage persistence removed

        // Clear the Quill editor
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.setText('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Only Course and Subject are strictly required
        if (!course || !subject) {
            alert("Please fill in the Course and Subject fields.");
            return;
        }

        // Validate that question content is not empty
        if (!questionContent || questionContent.trim() === '' || questionContent === '<p><br></p>') {
            alert("Please enter at least some question content.");
            return;
        }

        setLoading(true);
        setAiProcessing(true);

        try {
            // Step 1: Call AI to parse questions
            console.log('Sending content to AI for parsing...');
            const aiResponse = await fetch('http://localhost:5000/api/ai/parse-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: questionContent })
            });

            if (!aiResponse.ok) {
                const errorData = await aiResponse.json();
                throw new Error(errorData.message || 'AI parsing failed');
            }

            const { questions: parsedQuestions, count } = await aiResponse.json();
            console.log(`AI successfully parsed ${count} question(s)`);

            setAiProcessing(false);

            // Helper to clean prefixes from AI-generated content
            const cleanPrefix = (html) => {
                if (!html) return "";
                // Remove "Q:", "A:", "Question:", "Answer:" prefixes at the start
                return html.replace(/^(?:<[^>]+>)*\s*(?:Q|A|Question|Answer)\s*:\s*(?:<\/[^>]+>)*\s*/i, "");
            };

            // Step 2: Create question entries for each parsed Q&A
            const sharedMetadata = {
                course,
                subject,
                university: university, // Defaults removed to allow empty values
                year: year, // Defaults removed to allow empty values
                tags
            };

            // Add all parsed questions with shared metadata
            for (const parsedQ of parsedQuestions) {
                const questionEntry = {
                    ...sharedMetadata,
                    question: cleanPrefix(parsedQ.question),
                    answer: cleanPrefix(parsedQ.answer)
                };

                await addQuestion(questionEntry);
            }

            alert(`Successfully added ${count} question(s)!`);

            // Clear local storage on success
            // localStorage persistence removed

            // Reset the form
            resetForm();

            navigate('/questions');

        } catch (error) {
            console.error('Error processing questions:', error);
            setAiProcessing(false);

            // Show specific error message
            if (error.message.includes('AI parsing failed')) {
                alert(`AI Processing Error: ${error.message}\n\nPlease try again or check your content format.`);
            } else {
                alert(`Failed to add questions: ${error.message}`);
            }
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
                        <div className="tags-input-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'white' }}>
                            {tags.map((tag, index) => (
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
                                value={currentTagInput}
                                onChange={(e) => {
                                    setCurrentTagInput(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
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

                    {/* Find and Replace Toolbar */}
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
                            <label>Questions (PDF / DOCX):</label>
                            <small>Upload file to extract questions automatically</small>
                            <input
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                            />
                            {loading && <Loader text="Extracting text..." size={120} />}
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Enter questions in the below section</label>
                        </div>
                    )}

                    <div className="form-group">
                        <label>{entryMode === 'pdf' ? 'Extracted Questions (Editable):' : 'Enter Questions:'}</label>
                        <ReactQuill
                            ref={quillRef}
                            key={entryMode}
                            theme="snow"
                            value={questionContent}
                            onChange={setQuestionContent}
                            placeholder={entryMode === 'pdf' ? "Questions will appear here..." : "Enter your questions here (formatting will be preserved)..."}
                            modules={modules}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/questions')}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {aiProcessing ? 'Processing with AI...' : (loading ? 'Saving...' : 'Save Questions')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQuestion;
