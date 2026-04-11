import { Link } from "react-router-dom";
import "./Home.css";
import Aurora from "./Aurora";
import NewArrivals from "./NewArrivals";
import BestSeller from "./BestSeller";
import ExploreSection from "./ExploreSection";
import BookCategorySection from "../components/BookCategorySection";

const Home = () => {
  const quickBrowseItems = [
    { label: "BCA Library", category: "BCA" },
    { label: "DCA Picks", category: "DCA" },
    { label: "PGDCA Shelf", category: "PGDCA" },
    { label: "Question Bank", path: "/questions" },
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="aurora-wrapper">
          <Aurora
            colorStops={["#4b6cb7", "#182848", "#ffd700"]}
            blend={0.6}
            amplitude={1.2}
            speed={0.4}
          />
        </div>

        <div className="hero-content">
          <span className="hero-eyebrow">Smart study library</span>
          <h1>
            Welcome to <span className="brand-name">ExamFobiya</span>
          </h1>
          <p>
            Discover trusted books, jump into syllabus details, and reach question banks
            without digging through crowded lists.
          </p>

          <div className="hero-stats">
            <div className="hero-stat-pill">
              <strong>3</strong>
              <span>Course tracks</span>
            </div>
            <div className="hero-stat-pill">
              <strong>Books</strong>
              <span>Curated by category</span>
            </div>
            <div className="hero-stat-pill">
              <strong>Fast</strong>
              <span>Syllabus + questions</span>
            </div>
          </div>

          <div className="hero-buttons">
            <Link to="/books" className="primary-btn">Explore Books</Link>
            <Link to="/questions" className="secondary-btn">Search Questions</Link>
          </div>

          <div className="quick-browse-row">
            {quickBrowseItems.map((item) => (
              <Link
                key={item.label}
                to={item.path || "/books"}
                state={item.category ? { category: item.category } : undefined}
                className="quick-browse-chip"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-intro-strip">
        <div className="intro-card">
          <h2>Start with what changed recently</h2>
          <p>
            Fresh arrivals and best sellers lead the page, so the homepage feels curated instead of endless.
          </p>
        </div>
        <div className="intro-card">
          <h2>Browse by course in one tap</h2>
          <p>
            Each course section previews only a handful of books, with direct routes into the full library.
          </p>
        </div>
      </section>

      <NewArrivals limit={4} />
      <BestSeller limit={4} />

      <section className="course-browse-strip">
        <div className="course-browse-header">
          <div>
            <span className="section-kicker">Browse by course</span>
            <h2>Find your course faster</h2>
          </div>
          <Link to="/books" className="browse-all-link">Open full library</Link>
        </div>

        <div className="course-browse-grid">
          <Link to="/books" state={{ category: "BCA" }} className="course-browse-card">
            <span>BCA</span>
            <p>Programming fundamentals, theory, and exam prep.</p>
          </Link>
          <Link to="/books" state={{ category: "DCA" }} className="course-browse-card">
            <span>DCA</span>
            <p>Compact picks for practical skills and core concepts.</p>
          </Link>
          <Link to="/books" state={{ category: "PGDCA" }} className="course-browse-card">
            <span>PGDCA</span>
            <p>Advanced study materials with focused syllabus access.</p>
          </Link>
        </div>
      </section>

      <BookCategorySection title="BCA Spotlight" section="BCA Books" category="BCA" limit={4} />
      <BookCategorySection title="DCA Spotlight" section="DCA Books" category="DCA" limit={4} />
      <BookCategorySection title="PGDCA Spotlight" section="PGDCA Books" category="PGDCA" limit={4} />

      <ExploreSection />
    </div>
  );
};

export default Home;
