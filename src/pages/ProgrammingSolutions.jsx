import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBooks } from "../context/BookContext";
import ConfirmationModal from "../components/ConfirmationModal";
import Loader from "../components/Loader";
import useSEO from "../utils/useSEO";
import "./ProgrammingSolutions.css";

// Normalises old single-solution books into a 1-item array so all rendering
// code can work uniformly with the new programmingSolutions array format.
const normalizeSolutions = (book) => {
  if (Array.isArray(book?.programmingSolutions) && book.programmingSolutions.length > 0) {
    return book.programmingSolutions;
  }
  if (book?.programmingSolution && Object.keys(book.programmingSolution).length > 0) {
    return [{ ...book.programmingSolution, id: "legacy" }];
  }
  return [];
};

const LANGUAGE_TABS = ['C', 'C#', 'C++', 'Java', 'Python'];

const ProgrammingSolutions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { books, loading, deleteProgrammingSolution } = useBooks();
  const [selectedLanguage, setSelectedLanguage] = useState("C");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // copyStatus holds the detailCopyKey of the solution whose code was just copied
  const [copyStatus, setCopyStatus] = useState("");
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());
  const [rowCopyStatus, setRowCopyStatus] = useState("");
  const [filters, setFilters] = useState({
    course: "",
    language: "",
    subject: ""
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useSEO({
    title: 'Programming Solutions',
    description: 'Access programming solutions with source code for BCA, DCA, and PGDCA courses. Search by subject, language, or course.',
    path: '/programming-solutions'
  });

  // Books that have at least one programming solution
  const solutionBooks = useMemo(() => {
    return books
      .filter((book) => book.hasProgrammingSolution)
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [books]);

  // Flat list: one entry per (book, solution) pair
  const flatRows = useMemo(() => {
    const rows = [];
    solutionBooks.forEach((book) => {
      normalizeSolutions(book).forEach((solution) => {
        rows.push({
          book,
          solution,
          rowId: `${book.id}__${solution.id}`
        });
      });
    });
    return rows;
  }, [solutionBooks]);

  // Detail view data
  const detailBook = books.find((item) => item.id?.toString() === id);
  const detailSolutions = detailBook ? normalizeSolutions(detailBook) : [];

  const uniqueCourses = [...new Set(solutionBooks.map((b) => b.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const uniqueLanguages = [...new Set(flatRows.map((r) => r.solution.language).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const uniqueSubjects = [...new Set(solutionBooks.map((b) => b.title).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const applySearchAndFilters = (query = searchQuery, activeFilters = filters, langTab = selectedLanguage) => {
    const q = query.trim().toLowerCase();

    return flatRows.filter(({ book, solution }) => {
      const matchesQuery = !q || (
        book.title?.toLowerCase().includes(q) ||
        book.category?.toLowerCase().includes(q) ||
        solution.title?.toLowerCase().includes(q) ||
        solution.language?.toLowerCase().includes(q) ||
        solution.description?.toLowerCase().includes(q)
      );

      const matchesCourse = !activeFilters.course || book.category === activeFilters.course;
      const matchesLanguage = !activeFilters.language || solution.language === activeFilters.language;
      const matchesSubject = !activeFilters.subject || book.title === activeFilters.subject;
      const matchesLangTab = !langTab || solution.language === langTab;

      return matchesQuery && matchesCourse && matchesLanguage && matchesSubject && matchesLangTab;
    });
  };

  // Auto-show results for the selected language tab
  useEffect(() => {
    if (id) return; // Don't run on detail view
    if (flatRows.length === 0) return;
    const filtered = applySearchAndFilters(searchQuery, filters, selectedLanguage);
    setResults(filtered);
    setSearched(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, flatRows]);

  // Handle auto-search when redirected from a BookCard
  React.useEffect(() => {
    if (location.state?.initialSearch && flatRows.length > 0) {
      const q = location.state.initialSearch.trim();
      let currentFilters = filters;
      if (location.state.categoryFilter) {
        currentFilters = { ...filters, course: location.state.categoryFilter };
      }

      const filtered = applySearchAndFilters(q, currentFilters);
      setResults(filtered);
      setSearched(true);

      // Clear the state so refreshing the page doesn't run it again
      window.history.replaceState({}, document.title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, flatRows]);

  const handleSearch = () => {
    const hasActiveFilters = Object.values(filters).some(Boolean);
    const q = searchQuery.trim();

    if (!q && !hasActiveFilters) {
      setResults([]);
      setSearched(false);
      return;
    }

    setResults(applySearchAndFilters(searchQuery, filters, selectedLanguage));
    setSearched(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, [key]: value };
      if (searched) {
        setResults(applySearchAndFilters(searchQuery, nextFilters, selectedLanguage));
      }
      return nextFilters;
    });
  };

  const clearFilters = () => {
    const resetFilters = { course: "", language: "", subject: "" };
    setFilters(resetFilters);
    if (searched) {
      const hasQuery = searchQuery.trim();
      if (!hasQuery) {
        setResults([]);
        setSearched(false);
      } else {
        setResults(applySearchAndFilters(searchQuery, resetFilters, selectedLanguage));
      }
    }
  };

  const copyText = async (textToCopy) => {
    if (!textToCopy) return false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      return true;
    } catch (error) {
      console.error("Error copying solution code:", error);
      return false;
    }
  };

  const copyDetailCode = async (copyKey, code) => {
    const copied = await copyText(code);
    if (copied) {
      setCopyStatus(copyKey);
      window.setTimeout(() => setCopyStatus(""), 1600);
    } else {
      setCopyStatus(`failed-${copyKey}`);
    }
  };

  const copyRowCode = async (rowId, code) => {
    const copied = await copyText(code);
    setRowCopyStatus(copied ? rowId : `failed-${rowId}`);
    window.setTimeout(() => setRowCopyStatus(""), 1600);
  };

  const renderCopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleDeleteSolution = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProgrammingSolution(deleteTarget.bookId, deleteTarget.solutionId);
      // Remove from search results if present
      if (searched) {
        setResults((prev) => prev.filter((r) => r.rowId !== `${deleteTarget.bookId}__${deleteTarget.solutionId}`));
      }
    } catch (error) {
      console.error("Error deleting solution:", error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <main className="programming-solution-page">
        <Loader text="Loading solutions..." size={140} />
      </main>
    );
  }

  // ── Detail view (/programming-solutions/:id) ───────────────────────────────
  if (id) {
    if (!detailBook || detailSolutions.length === 0) {
      return (
        <main className="programming-solution-page">
          <section className="solution-empty-state">
            <h1>Solution Not Available</h1>
            <p>This book does not have a programming solution yet.</p>
            <Link to="/programming-solutions" className="solution-back-link">Back to Solutions</Link>
          </section>
        </main>
      );
    }

    return (
      <main className="programming-solution-page">
        <section className="solution-header">
          <Link to="/programming-solutions" className="solution-back-link">Back to Solutions</Link>
          <h1>{detailBook.title}</h1>
          <div className="solution-metadata">
            {detailBook.category && <span>{detailBook.category}</span>}
            {detailBook.semester && <span>{detailBook.semester}</span>}
          </div>
        </section>

        {detailSolutions.map((solution) => {
          const code = solution.code || "";
          const codeLines = (code || "No solution code available yet.").split("\n");
          const detailCopyKey = `${detailBook.id}-${solution.id}`;

          return (
            <section key={solution.id} className="solution-code-card" aria-label="Programming solution">
              <div className="solution-code-header">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div>
                    <h2>{solution.title || "Programming Solution"}</h2>
                    <span className="solution-language-badge">{solution.language || "Code"}</span>
                  </div>
                  {user?.role === "admin" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="pdf-edit-btn"
                        onClick={() => navigate(`/edit-programming-solution/${detailBook.id}/${solution.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pdf-edit-btn solution-delete-btn"
                        onClick={() => setDeleteTarget({ bookId: detailBook.id, solutionId: solution.id, title: solution.title || "this solution" })}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {solution.description && <p className="solution-description">{solution.description}</p>}

              <div className="solution-code-shell">
                <button
                  type="button"
                  className="solution-copy-btn solution-copy-icon-btn"
                  onClick={() => copyDetailCode(detailCopyKey, code)}
                  disabled={!code}
                  aria-label={copyStatus === detailCopyKey ? "Copied" : "Copy code"}
                  title={
                    copyStatus === detailCopyKey
                      ? "Copied!"
                      : copyStatus === `failed-${detailCopyKey}`
                      ? "Copy failed"
                      : "Copy code"
                  }
                >
                  {renderCopyIcon()}
                </button>
                <pre className="solution-code-block">
                  <code>
                    {codeLines.map((line, lineIndex) => (
                      <span className="solution-code-line" key={`${lineIndex}-${line}`}>
                        <span className="solution-line-number" aria-hidden="true">{lineIndex + 1}</span>
                        <span className="solution-line-text">{line || " "}</span>
                      </span>
                    ))}
                  </code>
                </pre>
              </div>
            </section>
          );
        })}

        <ConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteSolution}
          title="Delete Solution"
          message={`Are you sure you want to delete "${deleteTarget?.title || "this solution"}"? This action cannot be undone.`}
          variant="danger"
          confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
          cancelLabel="Cancel"
        />
      </main>
    );
  }

  // ── List / search view (/programming-solutions) ───────────────────────────
  return (
    <div className="questions-container">
      <div className="questions-content container">
        <h2>Programming Solutions</h2>


        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
          <div className="lang-tabs-section" style={{ margin: 0 }}>
            {LANGUAGE_TABS.map((lang) => (
              <button
                key={lang}
                type="button"
                className={`lang-tab-pill${selectedLanguage === lang ? ' active' : ''}`}
                onClick={() => setSelectedLanguage(lang)}
              >
                {lang}
              </button>
            ))}
          </div>

          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/add-programming-solution")}
              className="uq-upload-btn"
            >
              Add new solution
            </button>
          )}
        </div>

        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              id="prog-solutions-search-input"
              name="search"
              type="text"
              placeholder="Search by subject, course or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="questions-search-input"
            />
            <button className="questions-search-btn" onClick={handleSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <button
            type="button"
            className={`questions-filter-btn ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <span>Filters</span>
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
        </div>



        {showFilters && (
          <div className="questions-filters-panel">
            <div className="questions-filter-grid">
              <label className="questions-filter-field" htmlFor="prog-solutions-course-filter">
                <span>Course</span>
                <select id="prog-solutions-course-filter" name="course" value={filters.course} onChange={(e) => handleFilterChange("course", e.target.value)}>
                  <option value="">All courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </label>

              <label className="questions-filter-field" htmlFor="prog-solutions-subject-filter">
                <span>Subject</span>
                <select id="prog-solutions-subject-filter" name="subject" value={filters.subject} onChange={(e) => handleFilterChange("subject", e.target.value)}>
                  <option value="">All subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </label>

              <label className="questions-filter-field" htmlFor="prog-solutions-language-filter">
                <span>Language</span>
                <select id="prog-solutions-language-filter" name="language" value={filters.language} onChange={(e) => handleFilterChange("language", e.target.value)}>
                  <option value="">All languages</option>
                  {uniqueLanguages.map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="questions-filter-actions">
              <button type="button" className="questions-clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {searched && (
          results.length === 0 ? (
            <p className="no-results">No programming solutions found for "{searchQuery}".</p>
          ) : (
            <div className="pdf-results-list">
              {results.map(({ book, solution, rowId }) => (
                <div key={rowId} className={`pdf-result-card-row solution-result-card ${expandedRowIds.has(rowId) ? "expanded" : ""}`}>
                  <div className="pdf-row-info">
                    <span className="pdf-card-course">{book.category || book.semester || "All"}</span>
                    <div className="pdf-row-details">
                      <div className="pdf-card-top-row">
                        <span className="pdf-card-subject">{book.title}</span>
                        {solution.language && <span className="pdf-card-subject">| {solution.language}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="solution-text-content">
                    {solution.title && (
                      <span className="pdf-card-label-row">{solution.title}</span>
                    )}
                    {solution.description && (
                      <p className="solution-description solution-inline-description">{solution.description}</p>
                    )}
                  </div>

                  <div className="pdf-row-actions">
                    {user?.role === "admin" && (
                      <>
                      <button
                        type="button"
                        className="pdf-edit-btn"
                        onClick={() => navigate(`/edit-programming-solution/${book.id}/${solution.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pdf-edit-btn solution-delete-btn"
                        onClick={() => setDeleteTarget({ bookId: book.id, solutionId: solution.id, title: solution.title || book.title })}
                      >
                        Delete
                      </button>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    className="pdf-card-open-row solution-toggle-btn"
                    onClick={() => setExpandedRowIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(rowId)) { next.delete(rowId); } else { next.add(rowId); }
                      return next;
                    })}
                    aria-expanded={expandedRowIds.has(rowId)}
                  >
                    {expandedRowIds.has(rowId) ? "Hide Solution" : "View Solution"}
                  </button>

                  <div className="solution-inline-panel" aria-hidden={!expandedRowIds.has(rowId)}>
                    <div className="solution-inline-content">

                      <div className="solution-code-shell">
                        <button
                          type="button"
                          className="solution-copy-btn solution-copy-icon-btn"
                          onClick={() => copyRowCode(rowId, solution.code || "")}
                          disabled={!solution.code}
                          aria-label={rowCopyStatus === rowId ? "Copied code" : "Copy code"}
                          title={rowCopyStatus === rowId ? "Copied" : rowCopyStatus === `failed-${rowId}` ? "Copy failed" : "Copy code"}
                        >
                          {renderCopyIcon()}
                        </button>
                        <pre className="solution-code-block">
                          <code>
                            {(solution.code || "No solution code available yet.").split("\n").map((line, lineIndex) => (
                              <span className="solution-code-line" key={`${rowId}-${lineIndex}-${line}`}>
                                <span className="solution-line-number" aria-hidden="true">{lineIndex + 1}</span>
                                <span className="solution-line-text">{line || " "}</span>
                              </span>
                            ))}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {!searched && flatRows.length === 0 && (
          <p className="instruction-placeholder">
            No programming solutions available yet.
          </p>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSolution}
        title="Delete Solution"
        message={`Are you sure you want to delete "${deleteTarget?.title || "this solution"}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default ProgrammingSolutions;
