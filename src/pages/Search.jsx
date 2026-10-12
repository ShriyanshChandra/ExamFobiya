import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import { useQuestions } from "../context/QuestionContext";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";
import RemoveBookModal from "../components/RemoveBookModal";
import ConfirmationModal from "../components/ConfirmationModal";
import Loader from "../components/Loader";
import useSEO from "../utils/useSEO";
import "./Books.css";
import "./Questions.css";
import "./ProgrammingSolutions.css";
import "./Search.css";

// Language run instructions helper for programming solutions
const getRunInstructions = (language) => {
  const lang = (language || "").toLowerCase();

  const compilerMap = {
    c: { name: "C", compiler: "C compiler (e.g. GCC)", ext: ".c", compileCmd: "gcc program.c -o program", runCmd: "./program (or program.exe on Windows)", onlineNote: "C compiler", vsExt: "C/C++ by Microsoft", fileHint: 'a file named "program.c"', installHint: "Install GCC (MinGW on Windows, Xcode Command Line Tools on macOS, or build-essential on Linux)." },
    "c++": { name: "C++", compiler: "C++ compiler (e.g. G++)", ext: ".cpp", compileCmd: "g++ program.cpp -o program", runCmd: "./program (or program.exe on Windows)", onlineNote: "C++ compiler", vsExt: "C/C++ by Microsoft", fileHint: 'a file named "program.cpp"', installHint: "Install G++ (MinGW on Windows, Xcode Command Line Tools on macOS, or build-essential on Linux)." },
    "c#": { name: "C#", compiler: ".NET SDK", ext: ".cs", compileCmd: "dotnet run", runCmd: "", onlineNote: "C# compiler", vsExt: "C# Dev Kit by Microsoft", fileHint: 'a C# project or a file named "Program.cs"', installHint: { text: "Install the .NET SDK from", linkText: "dotnet.microsoft.com", linkUrl: "https://dotnet.microsoft.com/download" } },
    java: { name: "Java", compiler: "Java JDK", ext: ".java", compileCmd: "javac Main.java", runCmd: "java Main", onlineNote: "Java compiler", vsExt: "Extension Pack for Java by Microsoft", fileHint: 'a file matching the public class name (e.g. "Main.java")', installHint: { text: "Install the Java JDK from", linkText: "oracle.com", linkUrl: "https://www.oracle.com/java/technologies/downloads/" } },
    python: { name: "Python", compiler: "Python interpreter", ext: ".py", compileCmd: "", runCmd: "python program.py (or python3 program.py on macOS/Linux)", onlineNote: "Python compiler", vsExt: "Python by Microsoft", fileHint: 'a file named "program.py"', installHint: { text: "Install Python from", linkText: "python.org", linkUrl: "https://www.python.org/downloads/" } },
  };

  const info = compilerMap[lang] || compilerMap.java;

  const option1Steps = [
    `Go to any online compiler website.`,
    `Make sure you have selected the ${info.onlineNote} from the language options.`,
    `Copy the code solution from above and paste it directly into the online compiler's editor.`,
    `Click the "Run" button to execute the code.`,
  ];

  const option2Steps = [
    { text: "Download and install VS Code from here:", linkText: "Download VS Code", linkUrl: "https://code.visualstudio.com/" },
    `Open VS Code, go to the Extensions tab (Ctrl+Shift+X or Cmd+Shift+X on Mac) and install the "${info.vsExt}" extension.`,
    info.installHint,
    `Open a folder in VS Code and create ${info.fileHint}.`,
    `Copy the code solution from above and paste it into the file.`,
  ];

  if (lang === "python") {
    option2Steps.push(`Open the integrated terminal (Ctrl+\` or Cmd+\` on Mac) and run: ${info.runCmd}`);
  } else if (lang === "c#") {
    option2Steps.push(`Open the integrated terminal (Ctrl+\` or Cmd+\` on Mac) and run: ${info.compileCmd}`);
  } else {
    option2Steps.push(`Open the integrated terminal (Ctrl+\` or Cmd+\` on Mac) and compile: ${info.compileCmd}`);
    if (info.runCmd) {
      option2Steps.push(`Run the compiled program: ${info.runCmd}`);
    }
  }

  const option3Steps = [];
  option3Steps.push(info.installHint);
  option3Steps.push(`Open your terminal (Command Prompt, PowerShell, or Terminal).`);
  option3Steps.push(`Navigate to the folder containing your code file using the cd command.`);
  option3Steps.push(`Create ${info.fileHint} and paste the code into it using any text editor.`);

  if (lang === "python") {
    option3Steps.push(`Run the program: ${info.runCmd}`);
  } else if (lang === "c#") {
    option3Steps.push(`Create a new console project: dotnet new console -o MyApp`);
    option3Steps.push(`Navigate into the project folder: cd MyApp`);
    option3Steps.push(`Replace the code in Program.cs with the solution code.`);
    option3Steps.push(`Run the project: ${info.compileCmd}`);
  } else {
    option3Steps.push(`Compile the code: ${info.compileCmd}`);
    if (info.runCmd) {
      option3Steps.push(`Run the compiled program: ${info.runCmd}`);
    }
  }

  return { option1Steps, option2Steps, option3Steps, langName: info.name };
};

const renderStep = (step) => {
  if (typeof step === "object" && step.linkUrl) {
    return (
      <>
        {step.text}{" "}
        <a
          href={step.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="run-inline-link"
        >
          {step.linkText}
        </a>
      </>
    );
  }
  return step;
};

const RunInstructionsBox = ({ language }) => {
  const [expanded, setExpanded] = useState(false);
  const { option1Steps, option2Steps, option3Steps } = getRunInstructions(language);

  return (
    <div className="run-instructions-box">
      <span
        className="run-instructions-toggle"
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((prev) => !prev); } }}
        aria-expanded={expanded}
      >
        <span className="run-instructions-toggle-icon">i</span>
        <span>How to Run This Code</span>
      </span>

      {expanded && (
        <div className="run-instructions-content">
          <div className="run-option">
            <h4 className="run-option-title">Option 1: Using Online Compilers</h4>
            <span className="run-option-device-hint">Works on Android, PC and Desktop</span>
            <ol className="run-steps">
              {option1Steps.map((step, i) => (
                <li key={i}>{renderStep(step)}</li>
              ))}
            </ol>
          </div>

          <div className="run-option">
            <h4 className="run-option-title">Option 2: Using VS Code</h4>
            <span className="run-option-device-hint">Only for PC / Desktop</span>
            <ol className="run-steps">
              {option2Steps.map((step, i) => (
                <li key={i}>{renderStep(step)}</li>
              ))}
            </ol>
          </div>

          <div className="run-option">
            <h4 className="run-option-title">Option 3: Using Terminal</h4>
            <span className="run-option-device-hint">Only for PC / Desktop</span>
            <ol className="run-steps">
              {option3Steps.map((step, i) => (
                <li key={i}>{renderStep(step)}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

// Normalises old single-solution books into a 1-item array
const normalizeSolutions = (book) => {
  if (Array.isArray(book?.programmingSolutions) && book.programmingSolutions.length > 0) {
    return book.programmingSolutions;
  }
  if (book?.programmingSolution && Object.keys(book.programmingSolution).length > 0) {
    return [{ ...book.programmingSolution, id: "legacy" }];
  }
  return [];
};

function Search({ searchQuery: searchQueryProp }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || searchQueryProp || "";
  const { books, removeBook, updateBook, deleteProgrammingSolution, loading } = useBooks(); 
  const { questionPdfs, deleteQuestionPdf } = useQuestions();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modals for Book Removal (if admin removes from search page)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  // Modals for Solution Removal
  const [deleteSolutionTarget, setDeleteSolutionTarget] = useState(null);
  const [isDeletingSolution, setIsDeletingSolution] = useState(false);

  // Modals for Question Removal & Login
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Question PDF Viewer State
  const [viewingPdf, setViewingPdf] = useState(null);
  const pdfModalRef = React.useRef(null);
  const iframeRef = React.useRef(null);

  // Programming Solutions Expanded Rows and Copy State
  const [expandedSolutionIds, setExpandedSolutionIds] = useState(new Set());
  const [solutionCopyStatus, setSolutionCopyStatus] = useState("");

  // Pagination limits
  const [booksLimit, setBooksLimit] = useState(8);
  const [questionsLimit, setQuestionsLimit] = useState(7);
  const [solutionsLimit, setSolutionsLimit] = useState(7);
  const formatQuestionDate = (pdf) => [pdf.month, pdf.year].filter(Boolean).join(' ');

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      return url.replace(/\/view.*$/, "/preview");
    }
    return url;
  };

  const getDownloadUrl = (url) => {
    if (!url) return "";
    // Extract file ID from typical Drive URLs (file/d/ID or open?id=ID)
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
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

  const copyRowCode = async (rowId, code) => {
    const copied = await copyText(code);
    setSolutionCopyStatus(copied ? rowId : `failed-${rowId}`);
    window.setTimeout(() => setSolutionCopyStatus(""), 1600);
  };

  const renderCopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  // Lock background scrolling when PDF viewer modal is open
  React.useEffect(() => {
    if (viewingPdf) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [viewingPdf]);

  // Anti-tamper MutationObserver: If DevTools modifies modal DOM or styles, immediately close viewer session
  React.useEffect(() => {
    if (!viewingPdf || !pdfModalRef.current) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' || mutation.type === 'childList') {
          setViewingPdf(null);
          break;
        }
      }
    });

    observer.observe(pdfModalRef.current, {
      attributes: true,
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [viewingPdf]);

  // Secure dynamic iframe loader: Obfuscate & stream embed URL without setting plain-text src attribute in DOM
  React.useEffect(() => {
    if (!viewingPdf || !iframeRef.current) return;

    try {
      const rawUrl = getEmbedUrl(viewingPdf.url);
      const encoded = btoa(encodeURIComponent(rawUrl));
      const targetUrl = decodeURIComponent(atob(encoded));

      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #f0f0f0; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${targetUrl}" allow="autoplay"></iframe>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (e) {
      console.error("Error setting PDF preview content:", e);
    }
  }, [viewingPdf]);

  useSEO({
    title: 'Search Books, Questions & Study Resources',
    description: 'Search across books, questions, and programming solutions on ExamFobiya.',
    path: '/search',
    noindex: true
  });

  // Reset limits when search changes
  React.useEffect(() => {
    setBooksLimit(8);
    setQuestionsLimit(7);
    setSolutionsLimit(7);
  }, [searchQuery]);

  // Filter books
  const filteredBooks = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return books.filter(book =>
      (book.title && book.title.toLowerCase().includes(q)) ||
      (book.author && book.author.toLowerCase().includes(q)) ||
      (book.category && book.category.toLowerCase().includes(q)) ||
      (book.semester && book.semester.toLowerCase().includes(q)) ||
      (book.description && book.description.toLowerCase().includes(q))
    ).sort((a, b) => {
      // Exact category matches come first (e.g. "dca" → DCA before PGDCA)
      const aExact = a.category?.toLowerCase() === q ? 0 : 1;
      const bExact = b.category?.toLowerCase() === q ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return a.title.localeCompare(b.title);
    });
  }, [searchQuery, books]);

  // Filter questions
  const filteredQuestions = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return questionPdfs.filter(pdf => 
      (pdf.subject && pdf.subject.toLowerCase().includes(q)) ||
      (pdf.course && pdf.course.toLowerCase().includes(q)) ||
      (pdf.label && pdf.label.toLowerCase().includes(q)) ||
      (pdf.month && pdf.month.toLowerCase().includes(q))
    );
  }, [searchQuery, questionPdfs]);

  // Filter programming solutions
  const filteredSolutions = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    const rows = [];
    books.filter(book => book.hasProgrammingSolution).forEach(book => {
      normalizeSolutions(book).forEach(solution => {
        const matches =
          (book.title && book.title.toLowerCase().includes(q)) ||
          (book.category && book.category.toLowerCase().includes(q)) ||
          (solution.title && solution.title.toLowerCase().includes(q)) ||
          (solution.language && solution.language.toLowerCase().includes(q)) ||
          (solution.description && solution.description.toLowerCase().includes(q)) ||
          (solution.input && solution.input.toLowerCase().includes(q)) ||
          (solution.output && solution.output.toLowerCase().includes(q));
        if (matches) {
          rows.push({ book, solution, rowId: `${book.id}__${solution.id}` });
        }
      });
    });
    return rows;
  }, [searchQuery, books]);

  const canAddBook = user && user.role === 'admin';

  // Book Removal Handlers
  const handleRemoveClick = (book) => {
    setBookToRemove(book);
    setIsRemoveModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRemoveModalOpen(false);
  };

  const handleConfirmRemove = ({ bookId, sectionsToRemove, removeFromAll }) => {
    if (removeFromAll) {
      removeBook(bookId);
    } else if (sectionsToRemove && sectionsToRemove.length > 0) {
      const book = books.find(b => b.id === bookId);
      if (book) {
        const currentSections = book.sections || [];
        const updatedSections = currentSections.filter(s => !sectionsToRemove.includes(s));
        updateBook(bookId, { sections: updatedSections });
      }
    }
    setIsRemoveModalOpen(false);
    setBookToRemove(null);
  };

  const handleDeleteSolution = async () => {
    if (!deleteSolutionTarget) return;
    setIsDeletingSolution(true);
    try {
      await deleteProgrammingSolution(deleteSolutionTarget.bookId, deleteSolutionTarget.solutionId);
    } catch (error) {
      console.error("Error deleting programming solution:", error);
    } finally {
      setIsDeletingSolution(false);
      setDeleteSolutionTarget(null);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionTarget) return;
    setIsDeletingQuestion(true);
    try {
      await deleteQuestionPdf(deleteQuestionTarget.docPath);
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      setIsDeletingQuestion(false);
      setDeleteQuestionTarget(null);
    }
  };

  if (!searchQuery) {
    return (
      <div className="search-results-page">
        <div className="search-header-container container">
          <h1 style={{ marginBottom: "15px" }}>Search Books, Questions & Solutions</h1>
          <p className="search-summary-text" style={{ margin: 0 }}>Type something in the navbar to begin your search.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-header-container container">
        <h1 style={{ marginBottom: "15px", textAlign: "center" }}>Search Results</h1>
        <p className="search-summary-text" style={{ margin: 0, padding: 0, background: "transparent", boxShadow: "none" }}>
          Showing results for: "{searchQuery}"<br />
          <span style={{ fontSize: '0.9rem', marginTop: '5px', display: 'block' }}>
            Found {filteredBooks.length} Books, {filteredQuestions.length} Questions &amp; {filteredSolutions.length} Solutions
          </span>
        </p>
      </div>

      {loading && <Loader text="Searching database..." size={150} />}

      {/* --- BOOKS SECTION --- */}
      {filteredBooks.length > 0 && (
        <div className="search-section-block">
          <h2 className="search-section-heading">Books</h2>
          <div className="books-grid">
            {filteredBooks.slice(0, booksLimit).map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                index={index}
                canEdit={canAddBook}
                onRemove={(b) => handleRemoveClick(b)}
                onEdit={() => { }}
              />
            ))}
          </div>

          {filteredBooks.length > booksLimit && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setBooksLimit(prev => prev + 12)}
                className="search-view-more-btn"
              >
                View More Books ({filteredBooks.length - booksLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- QUESTIONS SECTION --- */}
      {filteredQuestions.length > 0 && (
        <div className="search-section-block">
          <h2 className="search-section-heading">Questions</h2>
          <div className="pdf-results-list">
            {filteredQuestions.slice(0, questionsLimit).map(pdf => (
              <div key={pdf.id} className="pdf-result-card-row">

                <div className="pdf-row-info">
                  <div className="pdf-row-info-body">
                    <div className="pdf-row-info-header">
                      <span className="pdf-card-course">{pdf.course}</span>
                      <span className="pdf-card-subject">{pdf.subject}</span>
                    </div>
                    {(pdf.label || pdf.month || pdf.year) && (
                      <span className="pdf-card-label-row">
                        {[pdf.label, formatQuestionDate(pdf)].filter(Boolean).join(' | ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pdf-row-actions">
                  <div className="pdf-user-actions">
                    <button
                      type="button"
                      className="pdf-action-btn pdf-view-btn"
                      onClick={(e) => { e.stopPropagation(); setViewingPdf(pdf); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      View
                    </button>
                    <a
                      href={user ? getDownloadUrl(pdf.url) : '#'}
                      target={user ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="pdf-action-btn pdf-download-btn"
                      onClick={handleDownloadClick}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Download
                    </a>
                  </div>
                  {user?.role === 'admin' && (
                    <>
                    <button
                      className="pdf-edit-btn"
                      onClick={(e) => { e.stopPropagation(); navigate('/edit-question-pdf', { state: { pdf } }); }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="pdf-edit-btn solution-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDeleteQuestionTarget({ id: pdf.id, docPath: pdf.docPath || pdf.id, title: pdf.subject || pdf.label || 'this question' }); }}
                    >
                      Delete
                    </button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>

          {filteredQuestions.length > questionsLimit && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setQuestionsLimit(prev => prev + 10)}
                className="search-view-more-btn"
              >
                View More Questions ({filteredQuestions.length - questionsLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- PROGRAMMING SOLUTIONS SECTION --- */}
      {filteredSolutions.length > 0 && (
        <div className="search-section-block">
          <h2 className="search-section-heading">Programming Solutions</h2>
          <div className="pdf-results-list">
            {filteredSolutions.slice(0, solutionsLimit).map(({ book, solution, rowId }) => (
              <div key={rowId} className={`pdf-result-card-row solution-result-card ${expandedSolutionIds.has(rowId) ? "expanded" : ""}`}>
                {/* Section 1: Course, Subject, Language + Edit/Delete */}
                <div className="solution-section solution-section-meta">
                  <div className="solution-meta-left">
                    <span className="pdf-card-course">{book.category || book.semester || "All"}</span>
                    <span className="pdf-card-subject">{book.title}</span>
                    {solution.language && <span className="solution-lang-pill">{solution.language}</span>}
                  </div>
                  {user?.role === "admin" && (
                    <div className="solution-meta-actions">
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
                        onClick={() => setDeleteSolutionTarget({ bookId: book.id, solutionId: solution.id, title: solution.title || book.title })}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <hr className="solution-section-divider" />

                {/* Section 2: Topic, Description, Input, Output */}
                <div className="solution-section solution-section-details">
                  {solution.title && (
                    <span className="pdf-card-label-row">{solution.title}</span>
                  )}
                  {solution.description && (
                    <p className="solution-description solution-inline-description">{solution.description}</p>
                  )}
                  {solution.input && (
                    <div className="solution-io-preview solution-input-preview">
                      <span className="solution-io-label">Input:</span>
                      <pre className="solution-io-block">{solution.input}</pre>
                    </div>
                  )}
                  {solution.output && (
                    <div className="solution-io-preview solution-output-preview">
                      <span className="solution-io-label">Output:</span>
                      <pre className="solution-io-block">{solution.output}</pre>
                    </div>
                  )}
                </div>

                <hr className="solution-section-divider" />

                {/* Section 3: View Solution button */}
                <div className="solution-section solution-section-action">
                  <button
                    type="button"
                    className="pdf-card-open-row solution-toggle-btn"
                    onClick={() => setExpandedSolutionIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(rowId)) { next.delete(rowId); } else { next.add(rowId); }
                      return next;
                    })}
                    aria-expanded={expandedSolutionIds.has(rowId)}
                  >
                    {expandedSolutionIds.has(rowId) ? "Hide Solution" : "View Solution"}
                  </button>
                </div>

                {/* Expanded inline panel (outside the 3 sections) */}
                <div className="solution-inline-panel" aria-hidden={!expandedSolutionIds.has(rowId)}>
                  <div className="solution-inline-content">
                    <div className="solution-code-shell">
                      <button
                        type="button"
                        className="solution-copy-btn solution-copy-icon-btn"
                        onClick={() => copyRowCode(rowId, solution.code || "")}
                        disabled={!solution.code}
                        aria-label={solutionCopyStatus === rowId ? "Copied code" : "Copy code"}
                        title={solutionCopyStatus === rowId ? "Copied" : solutionCopyStatus === `failed-${rowId}` ? "Copy failed" : "Copy code"}
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

                    <RunInstructionsBox language={solution.language} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSolutions.length > solutionsLimit && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setSolutionsLimit(prev => prev + 10)}
                className="search-view-more-btn"
              >
                View More Solutions ({filteredSolutions.length - solutionsLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* NO RESULTS */}
      {filteredBooks.length === 0 && filteredQuestions.length === 0 && filteredSolutions.length === 0 && !loading && (
        <div className="search-no-results">
          <h2>No matching results found</h2>
          <p>Try exploring other subjects or courses!</p>
        </div>
      )}

      {bookToRemove && (
        <RemoveBookModal
          isOpen={isRemoveModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmRemove}
          book={bookToRemove}
        />
      )}

      <ConfirmationModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={() => {
          setShowLoginModal(false);
          navigate('/login');
        }}
        title="Login Required"
        message="Please login to download question PDFs."
        confirmLabel="Login"
        cancelLabel="Cancel"
        variant="approve"
      />

      <ConfirmationModal
        isOpen={!!deleteSolutionTarget}
        onClose={() => setDeleteSolutionTarget(null)}
        onConfirm={handleDeleteSolution}
        title="Delete Programming Solution"
        message={`Are you sure you want to delete "${deleteSolutionTarget?.title}"? This action cannot be undone.`}
        confirmLabel={isDeletingSolution ? "Deleting..." : "Yes, Delete"}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={!!deleteQuestionTarget}
        onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question PDF"
        message={`Are you sure you want to delete "${deleteQuestionTarget?.label || deleteQuestionTarget?.url}" for ${deleteQuestionTarget?.subject}?`}
        confirmLabel={isDeletingQuestion ? "Deleting..." : "Yes, Delete"}
        variant="danger"
      />

      {viewingPdf && (
        <div className="pdf-viewer-modal-overlay" onClick={() => setViewingPdf(null)}>
          <div ref={pdfModalRef} className="pdf-viewer-modal-content" onClick={e => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <h3>PDF Preview</h3>
              <button className="pdf-viewer-close-btn" onClick={() => setViewingPdf(null)}>&times;</button>
            </div>
            <div className="pdf-viewer-body">
              <div className="pdf-iframe-popout-mask" onClick={(e) => e.stopPropagation()} />
              <iframe 
                ref={iframeRef}
                title="PDF Viewer"
                className="pdf-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;

