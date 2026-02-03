import React from 'react';
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
    selectedYear,
    setSelectedYear
}) => {
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
                        className="questions-search-input"
                    />
                    <button className="questions-search-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="filters-grid">
                {/* Course Selection */}
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

                {/* Subject Selection */}
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

            {/* Additional Filters (University/Year) */}
            <div className="secondary-filters">
                <div className="dropdown-filters">
                    <select
                        value={selectedUniversity}
                        onChange={(e) => setSelectedUniversity(e.target.value)}
                        className="secondary-select"
                    >
                        <option value="">Select University</option>
                        <option value="University 1">University 1</option>
                        <option value="University 2">University 2</option>
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="secondary-select"
                    >
                        <option value="">Select Year</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                    </select>
                </div>
            </div>
        </>
    );
};

export default QueSearch;
