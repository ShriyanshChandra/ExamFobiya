import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './QueSearch.css';

const QueSearch = ({
    searchQuery,
    setSearchQuery,
    selectedCourse,
    setSelectedCourse,
    courses,
    selectedSubject,
    setSelectedSubject,
    subjects,
    selectedUniversity,
    setSelectedUniversity,
    universities, // Added prop
    selectedYear,
    setSelectedYear,
    onSearch,
    allTags,
    selectedTags,
    handleTagSelect,
    showTags,
    setShowTags
}) => {
    const dropdownRef = useRef(null);
    const [tagSearch, setTagSearch] = React.useState("");

    useEffect(() => {
        // Only run this effect if showTags is true and we're clicking outside
        // Since we are using a Portal, the modal is outside the DOM hierarchy of this component,
        // but React events propagate through the React tree.
        // However, "handleClickOutside" usually implies clicking on the document but NOT on the modal.
        // We can keep the logic: if target is NOT in dropdownRef (modal content), close it.
        // But the modal overlay IS outside the content.

        // Actually, with the new Overlay structure:
        // Clicking on Overlay (which is outside Content) should close it.
        // Clicking on Content should NOT close it.
        // Clicking completely outside (if possible?) shouldn't happen with an overlay covering screen.

        // So we can simplify: The Overlay has onClick={close}, Content has onClick={stopProp}.
        // But for consistency with previous logic, let's just stick to the overlay click closing it.
        // The implementation below uses the existing logic sort of, but let's refine it for modal behavior.

        // For a modal with overlay, usually we handle the click on the overlay div.
        // But let's leave the event listener if it works, or relying on the Overlay click is better.
        // Let's rely on Overlay click for "outside" clicks.
        // I will remove the global listener and add onClick to overlay.
    }, [showTags, setShowTags]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (showTags) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        }

        // Cleanup function to ensure scroll is restored
        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        };
    }, [showTags]);

    // Filter tags based on local search
    const filteredTags = allTags.filter(tag =>
        tag.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const handleTagSearchKeyDown = (e) => {
        if (e.key === 'Enter' && filteredTags.length > 0) {
            const tagToSelect = filteredTags[0];
            handleTagSelect(tagToSelect);
            setTagSearch("");
        }
    };

    const modalContent = (
        <div className="tags-modal-overlay" onClick={() => setShowTags(false)}>
            <div
                className="tags-modal-content"
                ref={dropdownRef}
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking content
            >
                <div className="tags-modal-header">
                    <h3>Select Tags</h3>
                    <button
                        className="close-modal-btn"
                        onClick={() => setShowTags(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    onKeyDown={handleTagSearchKeyDown}
                    className="tag-search-input"
                    autoFocus
                />
                <div className="tags-grid">
                    {filteredTags.length > 0 ? (
                        filteredTags.map(tag => (
                            <button
                                key={tag}
                                className={`tag-item ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                onClick={() => handleTagSelect(tag)}
                            >
                                {tag}
                            </button>
                        ))
                    ) : (
                        <p className="no-tags">No tag exists</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Global Search */}
            <div className="search-section">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search for questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                        className="questions-search-input"
                    />
                    <button
                        className="questions-search-btn"
                        onClick={onSearch}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>
                <div style={{ position: 'relative' }}>
                    <button
                        className={`filter-toggle-btn ${showTags ? 'active' : ''}`}
                        onClick={() => setShowTags(!showTags)}
                    >
                        #Add Tags
                        {selectedTags.length > 0 && <span className="tag-active-dot"></span>}
                    </button>

                    {showTags && ReactDOM.createPortal(modalContent, document.body)}
                </div>
            </div>

            {/* Filters Grid */}
            <div className="filters-grid">
                {/* Course Filter */}
                <div className="filter-group">
                    <label>Course</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
                </div>

                {/* Subject Filter */}
                <div className="filter-group">
                    <label>Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="filter-select"
                        disabled={!selectedCourse}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Secondary Filters */}
            <div className="secondary-filters">
                <div className="dropdown-filters">
                    {/* University Filter */}
                    <div className="filter-group">
                        <label>University</label>
                        <select
                            value={selectedUniversity}
                            onChange={(e) => setSelectedUniversity(e.target.value)}
                            className="secondary-select"
                        >
                            <option value="">Select University</option>
                            {universities && universities.length > 0 ? (
                                universities.map(uni => (
                                    <option key={uni} value={uni}>{uni}</option>
                                ))
                            ) : (
                                <>
                                    <option value="RGPV">RGPV</option>
                                    <option value="DAVV">DAVV</option>
                                    <option value="Other">Other</option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div className="filter-group">
                        <label>Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="secondary-select"
                        >
                            <option value="">Select Year</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </>
    );
};

export default QueSearch;
