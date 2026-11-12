import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

// Diwali lamps distribution along bottom navbar edge (offset from logo area)
const DIWALI_LAMPS = [
  { left: '26%' }, { left: '36%' }, { left: '46%' },
  { left: '56%' }, { left: '66%' }, { left: '76%' },
  { left: '86%' }, { left: '95%' },
];

const NAVBAR_COLLAPSE_BREAKPOINT = 1200;

const Navbar = ({ setSearchQuery }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (showMobileSearch && !ticking) {
        window.requestAnimationFrame(() => {
          setShowMobileSearch(false);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showMobileSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileSearch && !event.target.closest('.search-container')) {
        setShowMobileSearch(false);
      }
      if (showThemeMenu && !event.target.closest('.theme-menu-scope')) {
        setShowThemeMenu(false);
      }
    };

    if (showMobileSearch || showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileSearch, showThemeMenu]);

  // Lock background page scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > NAVBAR_COLLAPSE_BREAKPOINT && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowMobileSearch(false);
    setShowThemeMenu(false);
  };

  const handleSearchSubmit = () => {
    const trimmed = localSearch.trim();
    if (setSearchQuery) setSearchQuery(trimmed);
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    setIsOpen(false);
    setShowMobileSearch(false);
  };

  const handleSearchClick = (e) => {
    if (window.innerWidth <= NAVBAR_COLLAPSE_BREAKPOINT) {
      if (!showMobileSearch) {
        setShowMobileSearch(true);
        e.preventDefault();
        return;
      }
    }
    handleSearchSubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearchSubmit();
  };

  const toggleThemeMenu = () => {
    setShowThemeMenu((current) => !current);
  };

  const handleNavMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0) {
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      e.currentTarget.style.setProperty('--hover-x', `${xPercent}%`);
    }
  };

  const handleNavMouseLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0) {
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      e.currentTarget.style.setProperty('--hover-x', `${xPercent}%`);
    }
  };

  return (
    <nav className="navbar diwali-navbar">
      {/* Diwali hanging lamp string garland */}
      <div className="diwali-lamp-string" aria-hidden="true">
        <svg className="diwali-string-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 48" preserveAspectRatio="none">
          <defs>
            <linearGradient id="navDiyaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M0,8 Q60,32 120,8 Q180,32 240,8 Q300,32 360,8 Q420,32 480,8 Q540,32 600,8 Q660,32 720,8 Q780,32 840,8 Q900,32 960,8 Q1020,32 1080,8 Q1140,32 1200,8" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="4 2" opacity="0.7"/>
        </svg>
        {DIWALI_LAMPS.map((lamp, i) => (
          <div
            key={i}
            className={`diwali-lamp diwali-lamp-${i % 5}`}
            style={{ left: lamp.left }}
          >
            <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Flame */}
              <ellipse cx="9" cy="4" rx="2.5" ry="3.5" fill="#fff7a0" opacity="0.9" className="diwali-flame"/>
              <ellipse cx="9" cy="5" rx="1.5" ry="2" fill="#ff9800"/>
              {/* Diya body */}
              <path d="M3,14 Q2,10 9,10 Q16,10 15,14 Q14,19 9,20 Q4,19 3,14Z" fill="url(#navDiyaGrad)" />
              <path d="M3,14 Q9,16 15,14" stroke="#c2410c" strokeWidth="0.8" fill="none"/>
              {/* Spout */}
              <path d="M14,13 Q17,12 16,15 Q15,16 14,14Z" fill="#d97706"/>
            </svg>
          </div>
        ))}
      </div>
      <div className="navbar-container">
        {/* Logo with Hanging Diwali Banner */}
        <div className="navbar-brand-wrapper">
          <Link to="/" className="logo-link" onClick={() => setIsOpen(false)}>
            <span className="brand-name">ExamFobiya</span>
          </Link>

          {/* Hanging "Happy Diwali" Banner */}
          <div className="diwali-hanging-banner" aria-label="Happy Diwali">
            {/* Hanging strings */}
            <svg className="diwali-banner-strings" viewBox="0 0 100 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <line x1="20" y1="0" x2="20" y2="12" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 1.2" />
              <circle cx="20" cy="1" r="1.5" fill="#fde047" />
              <circle cx="20" cy="11" r="1.5" fill="#f59e0b" />
              <line x1="80" y1="0" x2="80" y2="12" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 1.2" />
              <circle cx="80" cy="1" r="1.5" fill="#fde047" />
              <circle cx="80" cy="11" r="1.5" fill="#f59e0b" />
            </svg>

            {/* Hanging Placard Signboard */}
            <div className="diwali-banner-plaque">
              <svg width="11" height="14" viewBox="0 0 16 20" fill="none" className="diwali-plaque-diya" aria-hidden="true">
                <ellipse cx="8" cy="4" rx="2.5" ry="3.5" fill="#fff7a0" />
                <ellipse cx="8" cy="5" rx="1.5" ry="2" fill="#ff9800" />
                <path d="M2,12 Q1,9 8,9 Q15,9 14,12 Q13,16 8,17 Q3,16 2,12Z" fill="#d97706" />
                <path d="M2,12 Q8,14 14,12" stroke="#b45309" strokeWidth="0.8" fill="none" />
              </svg>
              <span className="diwali-plaque-text">Happy Diwali</span>
              <svg width="11" height="14" viewBox="0 0 16 20" fill="none" className="diwali-plaque-diya" aria-hidden="true">
                <ellipse cx="8" cy="4" rx="2.5" ry="3.5" fill="#fff7a0" />
                <ellipse cx="8" cy="5" rx="1.5" ry="2" fill="#ff9800" />
                <path d="M2,12 Q1,9 8,9 Q15,9 14,12 Q13,16 8,17 Q3,16 2,12Z" fill="#d97706" />
                <path d="M2,12 Q8,14 14,12" stroke="#b45309" strokeWidth="0.8" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hamburger Icon */}
        <button
          type="button"
          className="menu-icon"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>

        {/* Navigation Links */}
        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          {/* Non-desktop: show the user's name at the top */}
          {user && (
            <li className="mobile-only-nav mobile-user-header">
              <span className="mobile-username">
                {user?.name || user?.fullName || user?.displayName || user?.username || user?.email || "Account"}
              </span>
            </li>
          )}

          <li><Link to="/" onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave} onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/books" onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave} onClick={() => setIsOpen(false)}>Books</Link></li>
          <li><Link to="/questions" onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave} onClick={() => setIsOpen(false)}>Questions</Link></li>
          <li><Link to="/programming-solutions" onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave} onClick={() => setIsOpen(false)}>Programming Solutions</Link></li>
          <li><Link to="/about" onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave} onClick={() => setIsOpen(false)}>About Us</Link></li>

          {user?.role === 'admin' && (
            <>
              <li className="nav-separator" aria-hidden="true">|</li>
              <li><Link to="/admin" onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave} onClick={() => setIsOpen(false)}>Dashboard</Link></li>
            </>
          )}

          {/* Non-desktop: Settings & Logout below Dashboard */}
          {user ? (
            <>
              {user?.role !== 'admin' && <li className="nav-separator mobile-only-nav" aria-hidden="true">|</li>}
              <li className="mobile-only-nav">
                <Link to="/settings" onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave} onClick={() => setIsOpen(false)}>Settings</Link>
              </li>
              <li className="mobile-only-nav">
                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="mobile-only-nav mobile-only-login">
              <Link
                to="/login"
                state={{ resetCover: Date.now() }}
                onClick={() => {
                  setIsOpen(false);
                  if (location.pathname === '/login' || location.pathname === '/register') {
                    window.dispatchEvent(new CustomEvent('examfobiya:reset-login-cover'));
                  }
                }}
              >
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* Action Group: Theme + Search */}
        <div className="navbar-actions">
          {/* Theme Dropdown */}
          <div className="theme-dropdown-container theme-menu-scope" style={{ position: 'relative' }}>
            <button className="theme-toggle" onClick={toggleThemeMenu} aria-label={`Toggle Theme (Current: ${theme})`} aria-expanded={showThemeMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-palette">
                <circle cx="13.5" cy="6.5" r=".5"></circle>
                <circle cx="17.5" cy="10.5" r=".5"></circle>
                <circle cx="8.5" cy="7.5" r=".5"></circle>
                <circle cx="6.5" cy="12.5" r=".5"></circle>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
              </svg>
            </button>
            {showThemeMenu && (
              <div className="account-dropdown theme-dropdown-menu" role="menu">
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'light' ? 'active' : ''}`} onClick={() => { setTheme('light'); setShowThemeMenu(false); }}>
                  <div className="theme-card-colors">
                    <div style={{ background: '#2575fc' }}></div>
                    <div style={{ background: '#1e40af' }}></div>
                    <div style={{ background: '#ffd700' }}></div>
                    <div style={{ background: '#f4f7f6' }}></div>
                  </div>
                  <div className="theme-card-label">Light</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'dark' ? 'active' : ''}`} onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}>
                  <div className="theme-card-colors">
                    <div style={{ background: '#4b6cb7' }}></div>
                    <div style={{ background: '#182848' }}></div>
                    <div style={{ background: '#ffd700' }}></div>
                    <div style={{ background: '#121212' }}></div>
                  </div>
                  <div className="theme-card-label">Dark</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'vintage' ? 'active' : ''}`} onClick={() => { setTheme('vintage'); setShowThemeMenu(false); }}>
                  <div className="theme-card-colors">
                    <div style={{ background: '#795548' }}></div>
                    <div style={{ background: '#3e2723' }}></div>
                    <div style={{ background: '#e65100' }}></div>
                    <div style={{ background: '#f4ebd8' }}></div>
                  </div>
                  <div className="theme-card-label">Vintage</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'ocean' ? 'active' : ''}`} onClick={() => { setTheme('ocean'); setShowThemeMenu(false); }}>
                  <div className="theme-card-colors">
                    <div style={{ background: '#0891b2' }}></div>
                    <div style={{ background: '#164e63' }}></div>
                    <div style={{ background: '#ebd576' }}></div>
                    <div style={{ background: '#e7f5ff' }}></div>
                  </div>
                  <div className="theme-card-label">Ocean</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'midnight' ? 'active' : ''}`} onClick={() => { setTheme('midnight'); setShowThemeMenu(false); }}>
                  <div className="theme-card-colors">
                    <div style={{ background: '#818cf8' }}></div>
                    <div style={{ background: '#0f0f1a' }}></div>
                    <div style={{ background: '#22d3ee' }}></div>
                    <div style={{ background: '#000000' }}></div>
                  </div>
                  <div className="theme-card-label">Midnight</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'nord' ? 'active' : ''}`} onClick={() => { setTheme('nord'); setShowThemeMenu(false); }}>
                  <div className="theme-card-colors">
                    <div style={{ background: '#5e81ac' }}></div>
                    <div style={{ background: '#2e3440' }}></div>
                    <div style={{ background: '#88c0d0' }}></div>
                    <div style={{ background: '#eceff4' }}></div>
                  </div>
                  <div className="theme-card-label">Nord</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'sunset' ? 'active' : ''}`} onClick={() => { setTheme('sunset'); setShowThemeMenu(false); }}>
                  <div className="theme-card-colors">
                    <div style={{ background: '#ff7e5f' }}></div>
                    <div style={{ background: '#6a3093' }}></div>
                    <div style={{ background: '#feb47b' }}></div>
                    <div style={{ background: '#4a2f4f' }}></div>
                  </div>
                  <div className="theme-card-label">Sunset</div>
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className={`search-container ${showMobileSearch ? "active" : ""}`}>
            <input
              id="site-search-input"
              name="search"
              type="text"
              placeholder="Search..."
              className="search-input"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="search-btn" onClick={handleSearchClick} aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
