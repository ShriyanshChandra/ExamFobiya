import { useMemo } from "react";
import { Link } from "react-router-dom";
import useSEO from "../utils/useSEO";
import "./Home.css";
import NewArrivals from "./NewArrivals";
import BestSeller from "./BestSeller";
import SpotlightSection from "../components/SpotlightSection";

const Home = () => {
  useSEO({
    title: 'BCA, DCA & PGDCA Books & Study Materials',
    description: 'ExamFobiya — Your ultimate destination for BCA, DCA, and PGDCA books, previous year questions, and programming solutions.',
    path: '/'
  });

  const fallingBooksData = useMemo(() => {
    const totalBooks = 24;
    return Array.from({ length: totalBooks }, (_, i) => {
      // Distribute evenly across width buckets (2% to 97%) with random jitter
      const baseSegment = (i / (totalBooks - 1)) * 95; // 0% to 95%
      const jitter = (Math.random() * 5 - 2.5); // +/- 2.5% random offset
      const left = Math.max(1, Math.min(97, baseSegment + jitter));
      
      const size = 18 + Math.random() * 47; // Random size (18px - 65px)
      const duration = 8 + Math.random() * 15; // Random fall duration (8s - 23s)
      const delay = -Math.random() * 20; // Random start delay (negative for scattered initial positions)
      const opacity = 0.08 + Math.random() * 0.27; // Random opacity
      const blur = (Math.random() * 3.5).toFixed(1); // Random blur (0px - 3.5px)
      const startRot = Math.floor(Math.random() * 360); // Random initial rotation angle
      const rotDelta = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 540); // Random rotation direction & speed
      const endRot = startRot + rotDelta;

      return {
        id: i,
        style: {
          left: `${left.toFixed(2)}%`,
          width: `${size.toFixed(1)}px`,
          height: `${size.toFixed(1)}px`,
          animationDuration: `${duration.toFixed(2)}s`,
          animationDelay: `${delay.toFixed(2)}s`,
          opacity: opacity.toFixed(2),
          filter: `blur(${blur}px)`,
          '--start-rot': `${startRot}deg`,
          '--end-rot': `${endRot.toFixed(0)}deg`
        }
      };
    });
  }, []);

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
            {fallingBooksData.map((book) => (
              <svg
                key={book.id}
                className="falling-book"
                style={book.style}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
              >
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
          <div className="hero-text-col">
            <h1>
              <span className="brand-name">ExamFobiya</span>
              <span className="hero-tagline">BCA, DCA & PGDCA Study Materials</span>
            </h1>
            <p>
              Simplify your BCA, DCA, and PGDCA exam preparation with curated books, detailed syllabus indexes, and solved question sets.
            </p>
          </div>

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

      {/* ── Diwali Celebration Section ── */}
      <section className="diwali-section" aria-label="Happy Diwali Celebration">
        {/* SVG Defs for gradients & filters (single definition to avoid duplicate IDs) */}
        <svg width="0" height="0" className="diwali-hidden-svg" aria-hidden="true">
          <defs>
            <linearGradient id="diwaliGoldFlame" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ff5722" />
              <stop offset="45%" stopColor="#ff9800" />
              <stop offset="85%" stopColor="#ffd54f" />
              <stop offset="100%" stopColor="#fffde7" />
            </linearGradient>
            <linearGradient id="diwaliDiyaBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
            <linearGradient id="diwaliBaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <filter id="diwaliGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>

        {/* Decorative Toran garland at the top */}
        <div className="diwali-toran" aria-hidden="true">
          <svg className="diwali-toran-svg" viewBox="0 0 1200 42" preserveAspectRatio="none">
            <path
              d="M0,0 Q50,28 100,0 Q150,28 200,0 Q250,28 300,0 Q350,28 400,0 Q450,28 500,0 Q550,28 600,0 Q650,28 700,0 Q750,28 800,0 Q850,28 900,0 Q950,28 1000,0 Q1050,28 1100,0 Q1150,28 1200,0"
              stroke="#f59e0b"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 2"
              opacity="0.8"
            />
            {[50, 150, 250, 350, 450, 550, 650, 750, 850, 950, 1050, 1150].map((cx, idx) => (
              <g key={idx}>
                <line x1={cx} y1="14" x2={cx} y2="24" stroke="#d97706" strokeWidth="1" />
                <circle cx={cx} cy="26" r="3.5" fill="#f59e0b" />
                <circle cx={cx} cy="26" r="1.5" fill="#fff7ed" />
              </g>
            ))}
          </svg>
        </div>

        {/* Floating golden sparkle motes */}
        <div className="diwali-sparkles" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              className={`diwali-sparkle diwali-sp-${i % 4}`}
              style={{
                left: `${3 + (i * 6.2) % 94}%`,
                animationDelay: `${(i * 0.42) % 3.2}s`,
                animationDuration: `${2.2 + (i % 3) * 0.7}s`,
              }}
            />
          ))}
        </div>

        {/* Ambient warm glow circle */}
        <div className="diwali-ambient-glow" aria-hidden="true" />

        {/* Main Banner Inner Container */}
        <div className="diwali-banner-inner">
          {/* Left Flanking Diya & Rangoli */}
          <div className="diwali-flank diwali-flank-left" aria-hidden="true">
            <div className="diwali-diya-wrapper">
              <div className="diwali-flame-halo" />
              <svg width="74" height="92" viewBox="0 0 74 92" fill="none" className="diwali-hero-diya">
                <ellipse cx="37" cy="20" rx="8" ry="16" fill="url(#diwaliGoldFlame)" className="diwali-flame-core" filter="url(#diwaliGlow)" />
                <ellipse cx="37" cy="22" rx="4.5" ry="10" fill="#fffde7" className="diwali-flame-inner" />
                <line x1="37" y1="36" x2="37" y2="30" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
                <path d="M12,48 C10,34 64,34 62,48 C60,66 14,66 12,48 Z" fill="url(#diwaliDiyaBody)" />
                <path d="M12,48 C20,53 54,53 62,48" stroke="#fde047" strokeWidth="1.5" fill="none" />
                <path d="M60,45 C67,42 65,49 61,50 Z" fill="#b45309" />
                <path d="M18,64 C12,70 16,78 26,76 C32,82 42,82 48,76 C58,78 62,70 56,64 Z" fill="url(#diwaliBaseGrad)" />
                <path d="M22,76 C28,84 46,84 52,76" stroke="#f59e0b" strokeWidth="1" fill="none" />
              </svg>
            </div>
            <div className="diwali-rangoli-accent">
              <svg width="86" height="86" viewBox="0 0 90 90" fill="none" className="diwali-spin-slow">
                <circle cx="45" cy="45" r="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <circle cx="45" cy="45" r="28" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const x = 45 + 28 * Math.cos(rad);
                  const y = 45 + 28 * Math.sin(rad);
                  return <circle key={i} cx={x} cy={y} r="2.5" fill="#f59e0b" opacity="0.7" />;
                })}
              </svg>
            </div>
          </div>

          {/* Center Announcement & Action */}
          <div className="diwali-center-content">
            <div className="diwali-badge-wrapper">
              <span className="diwali-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" />
                </svg>
                SHUBH DEEPAWALI • FESTIVAL OF LIGHTS
              </span>
            </div>

            <h2 className="diwali-main-heading">
              <span className="diwali-heading-highlight">Happy Diwali</span>
            </h2>

            <p className="diwali-subtitle">
              May the Divine Light of Wisdom &amp; Knowledge Illuminate Your Path to Success!
            </p>

            <p className="diwali-description">
              Celebrate this festive season with free access to our complete library of curated university books, solved previous year questions, and expert study guides.
            </p>
          </div>

          {/* Right Flanking Diya & Rangoli */}
          <div className="diwali-flank diwali-flank-right" aria-hidden="true">
            <div className="diwali-diya-wrapper">
              <div className="diwali-flame-halo" />
              <svg width="74" height="92" viewBox="0 0 74 92" fill="none" className="diwali-hero-diya">
                <ellipse cx="37" cy="20" rx="8" ry="16" fill="url(#diwaliGoldFlame)" className="diwali-flame-core" filter="url(#diwaliGlow)" />
                <ellipse cx="37" cy="22" rx="4.5" ry="10" fill="#fffde7" className="diwali-flame-inner" />
                <line x1="37" y1="36" x2="37" y2="30" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
                <path d="M12,48 C10,34 64,34 62,48 C60,66 14,66 12,48 Z" fill="url(#diwaliDiyaBody)" />
                <path d="M12,48 C20,53 54,53 62,48" stroke="#fde047" strokeWidth="1.5" fill="none" />
                <path d="M14,45 C7,42 9,49 13,50 Z" fill="#b45309" />
                <path d="M18,64 C12,70 16,78 26,76 C32,82 42,82 48,76 C58,78 62,70 56,64 Z" fill="url(#diwaliBaseGrad)" />
                <path d="M22,76 C28,84 46,84 52,76" stroke="#f59e0b" strokeWidth="1" fill="none" />
              </svg>
            </div>
            <div className="diwali-rangoli-accent">
              <svg width="86" height="86" viewBox="0 0 90 90" fill="none" className="diwali-spin-slow">
                <circle cx="45" cy="45" r="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <circle cx="45" cy="45" r="28" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const x = 45 + 28 * Math.cos(rad);
                  const y = 45 + 28 * Math.sin(rad);
                  return <circle key={i} cx={x} cy={y} r="2.5" fill="#f59e0b" opacity="0.7" />;
                })}
              </svg>
            </div>
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

      <SpotlightSection />
    </div>
  );
};

export default Home;
