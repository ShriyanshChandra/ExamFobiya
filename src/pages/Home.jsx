import { Link } from "react-router-dom";
import useSEO from "../utils/useSEO";
import "./Home.css";
import NewArrivals from "./NewArrivals";
import BestSeller from "./BestSeller";
import ExploreSection from "./ExploreSection";
import BookCategorySection from "../components/BookCategorySection";

const Home = () => {
  useSEO({
    title: '',
    description: 'ExamFobiya — Your ultimate destination for BCA, DCA, and PGDCA books, previous year questions, and programming solutions.',
    path: '/'
  });

  const handleCardMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const distLeft = relX;
      const distRight = rect.width - relX;
      const distTop = relY;
      const distBottom = rect.height - relY;

      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      let edgeX = (relX / rect.width) * 100;
      let edgeY = (relY / rect.height) * 100;

      if (minDist === distLeft) edgeX = 0;
      else if (minDist === distRight) edgeX = 100;
      else if (minDist === distTop) edgeY = 0;
      else if (minDist === distBottom) edgeY = 100;

      e.currentTarget.style.setProperty('--edge-x', `${edgeX}%`);
      e.currentTarget.style.setProperty('--edge-y', `${edgeY}%`);
    }
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="glow-grid-background" aria-hidden="true">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="glow-orb orb-3"></div>
          <div className="glow-orb orb-4"></div>

          {/* Falling Books */}
          <div className="falling-books">
            {[...Array(12)].map((_, i) => (
              <svg key={i} className={`falling-book book-${i + 1}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                {/* Left cover */}
                <path d="M50 85 L10 70 L10 20 L50 35 Z" fill="currentColor" fillOpacity="0.2"/>
                {/* Right cover */}
                <path d="M50 85 L90 70 L90 20 L50 35 Z" fill="currentColor" fillOpacity="0.1"/>
                {/* Left pages */}
                <path d="M50 80 L14 66 L14 18 L50 32 Z" fill="currentColor" fillOpacity="0.4"/>
                <path d="M50 75 L18 62 L18 16 L50 29 Z" fill="currentColor" fillOpacity="0.6"/>
                {/* Right pages */}
                <path d="M50 80 L86 66 L86 18 L50 32 Z" fill="currentColor" fillOpacity="0.3"/>
                <path d="M50 75 L82 62 L82 16 L50 29 Z" fill="currentColor" fillOpacity="0.5"/>
                {/* Spine */}
                <line x1="50" y1="29" x2="50" y2="85" />
              </svg>
            ))}
          </div>
        </div>

        <div className="hero-content">
          <h1>
            Welcome to <span className="brand-name">ExamFobiya</span>
          </h1>
          <p>
            Simplify your BCA, DCA, and PGDCA exam preparation with curated books, detailed syllabus indexes, and solved question sets.
          </p>

          <div className="hero-buttons">
            <Link to="/books" className="primary-btn">Explore Books</Link>
            <Link to="/programming-solutions" className="accent-hero-btn">Programming Solutions</Link>
            <Link to="/questions" className="secondary-btn">Search Questions</Link>
          </div>
        </div>
      </section>

      <section className="home-intro-strip">
        <div className="intro-card container" onMouseEnter={handleCardMouseEnter}>
          <div className="section-icon-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div className="intro-card-content">
            <h2>Find what you need in seconds</h2>
            <p>
              Fresh arrivals and best sellers lead the page, so the homepage feels curated instead of endless.
            </p>
          </div>
        </div>
        <div className="intro-card container" onMouseEnter={handleCardMouseEnter}>
          <div className="section-icon-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <div className="intro-card-content">
            <h2>Browse by course in one tap</h2>
            <p>
              Each course section previews only a handful of books, with direct routes into the full library.
            </p>
          </div>
        </div>
      </section>

      <NewArrivals limit={5} />
      <BestSeller limit={5} />

      <section className="course-browse-strip container">
        <div className="course-browse-header">
          <div>
            <span className="section-kicker">Browse by course</span>
            <h2>Find your course faster</h2>
          </div>
          <Link to="/books" className="browse-all-link">Open full library</Link>
        </div>

        <div className="course-browse-grid">
          <Link to="/books" state={{ category: "BCA" }} className="course-browse-card" onMouseEnter={handleCardMouseEnter}>
            <div className="course-icon-bg">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <div className="course-browse-content">
              <span>BCA</span>
              <p>Programming fundamentals, theory, and exam prep.</p>
            </div>
            <div className="course-browse-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </Link>
          <Link to="/books" state={{ category: "DCA" }} className="course-browse-card" onMouseEnter={handleCardMouseEnter}>
            <div className="course-icon-bg">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <div className="course-browse-content">
              <span>DCA</span>
              <p>Compact picks for practical skills and core concepts.</p>
            </div>
            <div className="course-browse-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </Link>
          <Link to="/books" state={{ category: "PGDCA" }} className="course-browse-card" onMouseEnter={handleCardMouseEnter}>
            <div className="course-icon-bg">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
            </div>
            <div className="course-browse-content">
              <span>PGDCA</span>
              <p>Advanced study materials with focused syllabus access.</p>
            </div>
            <div className="course-browse-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </Link>
        </div>
      </section>

      <BookCategorySection title="BCA Spotlight" section="BCA Books" category="BCA" limit={5} />
      <BookCategorySection title="DCA Spotlight" section="DCA Books" category="DCA" limit={5} />
      <BookCategorySection title="PGDCA Spotlight" section="PGDCA Books" category="PGDCA" limit={5} />

      <ExploreSection />
    </div>
  );
};

export default Home;
