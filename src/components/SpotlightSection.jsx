import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BookContext";
import MarqueeShelf from "./MarqueeShelf";
import "./SpotlightSection.css";

const TABS = [
  { id: "ALL", label: "ALL RELEASES", section: null, category: null },
  { id: "BCA", label: "BCA", section: "BCA Books", category: "BCA" },
  { id: "DCA", label: "DCA", section: "DCA Books", category: "DCA" },
  { id: "PGDCA", label: "PGDCA", section: "PGDCA Books", category: "PGDCA" },
];

const SpotlightSection = () => {
  const [activeTab, setActiveTab] = useState("ALL");
  const { getBooksBySection } = useBooks();

  const bcaBooks = useMemo(() => {
    const list = getBooksBySection("BCA Books");
    return list.filter((b) => b.category === "BCA");
  }, [getBooksBySection]);

  const dcaBooks = useMemo(() => {
    const list = getBooksBySection("DCA Books");
    return list.filter((b) => b.category === "DCA");
  }, [getBooksBySection]);

  const pgdcaBooks = useMemo(() => {
    const list = getBooksBySection("PGDCA Books");
    return list.filter((b) => b.category === "PGDCA");
  }, [getBooksBySection]);

  const allSpotlightBooks = useMemo(() => {
    const map = new Map();
    [...bcaBooks, ...dcaBooks, ...pgdcaBooks].forEach((book) => {
      if (!map.has(book.id)) {
        map.set(book.id, book);
      }
    });
    return Array.from(map.values());
  }, [bcaBooks, dcaBooks, pgdcaBooks]);

  const displayedBooks = useMemo(() => {
    if (activeTab === "BCA") return bcaBooks;
    if (activeTab === "DCA") return dcaBooks;
    if (activeTab === "PGDCA") return pgdcaBooks;
    return allSpotlightBooks;
  }, [activeTab, bcaBooks, dcaBooks, pgdcaBooks, allSpotlightBooks]);


  const currentTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];

  const currentCategory = currentTabObj.category;
  const browseLinkProps = currentCategory
    ? { to: "/books", state: { category: currentCategory } }
    : { to: "/books" };

  return (
    <section className="spotlight-section container">
      <div className="spotlight-header">
        <h2 className="spotlight-title">
          Checkout Spotlight Releases
          <br />
          Of BCA, DCA and PGDCA
        </h2>

        {/* Filter Capsule Bar */}
        <div className="spotlight-nav-wrapper">
          <div className="spotlight-pill-container" role="tablist" aria-label="Course Spotlight Selection">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`spotlight-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Book Grid / Shelf */}
      <div className="spotlight-books-wrapper">
        {displayedBooks.length === 0 ? (
          <div className="spotlight-empty-state">
            <p>No spotlight books available for {currentTabObj.label} at the moment.</p>
            <Link to="/books" className="spotlight-empty-link">
              Browse full book catalog
            </Link>
          </div>
        ) : (
          <MarqueeShelf
            key={activeTab}
            books={displayedBooks}
            direction="ltr"
            ariaLabel="Spotlight Releases marquee shelf"
            className="home-book-shelf spotlight-shelf"
          />
        )}
      </div>

      {/* Footer Explore Link */}
      <div className="spotlight-footer">
        <Link {...browseLinkProps} className="spotlight-browse-all">
          <span>{currentCategory ? `Explore full ${currentCategory} catalog` : "Explore entire book library"}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default SpotlightSection;
