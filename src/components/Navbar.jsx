import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const NAVBAR_COLLAPSE_BREAKPOINT = 1200;

const Navbar = ({ setSearchQuery }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const getAccountName = () => {
    return user?.name || user?.fullName || user?.displayName || "";
  };

  const getAccountLabel = () => {
    return getAccountName() || user?.email || user?.username || "Account";
  };

  const getAccountInitial = () => {
    const accountName = getAccountName() || user?.username || user?.email;
    const firstLetter = accountName?.trim()?.charAt(0);
    return firstLetter ? firstLetter.toUpperCase() : "U";
  };

  useEffect(() => {
    const handleScroll = () => {
      // Close mobile search on scroll
      if (showMobileSearch) {
        setShowMobileSearch(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showMobileSearch]);

  // Click outside listener for mobile search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileSearch && !event.target.closest('.search-container')) {
        setShowMobileSearch(false);
      }

      if (showAccountMenu && !event.target.closest('.account-menu-scope')) {
        setShowAccountMenu(false);
      }
      if (showThemeMenu && !event.target.closest('.theme-menu-scope')) {
        setShowThemeMenu(false);
      }
    };

    if (showMobileSearch || showAccountMenu || showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileSearch, showAccountMenu, showThemeMenu]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowMobileSearch(false); // Close search when menu opens
    setShowAccountMenu(false);
    setShowThemeMenu(false);
  };

  const handleSearchSubmit = () => {
    if (setSearchQuery) {
      setSearchQuery(localSearch);
    }
    navigate("/search");
    setIsOpen(false);
    setShowMobileSearch(false);
  };

  const handleSearchClick = (e) => {
    // Mobile logic
    if (window.innerWidth <= NAVBAR_COLLAPSE_BREAKPOINT) {
      if (!showMobileSearch) {
        setShowMobileSearch(true);
        e.preventDefault(); // Prevent submit if just opening
        return;
      }
      // If already open, submit search
    }
    handleSearchSubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu((current) => !current);
    setShowThemeMenu(false);
  };

  const toggleThemeMenu = () => {
    setShowThemeMenu((current) => !current);
    setShowAccountMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowAccountMenu(false);
    setShowThemeMenu(false);
    setIsOpen(false);
    navigate('/login');
  };

  const handleSettings = () => {
    setShowAccountMenu(false);
    setShowThemeMenu(false);
    setIsOpen(false);
    navigate('/settings');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo-link" onClick={() => setIsOpen(false)}>
          <span className="brand-name">ExamFobiya</span>
        </Link>

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

        {/* Navigation Links - Centered */}
        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/books" onClick={() => setIsOpen(false)}>Books</Link></li>
          <li><Link to="/questions" onClick={() => setIsOpen(false)}>Questions</Link></li>
          <li><Link to="/programming-solutions" onClick={() => setIsOpen(false)}>Programming Solutions</Link></li>
          <li><Link to="/about" onClick={() => setIsOpen(false)}>About Us</Link></li>
          {(user?.role === 'admin') && (
            <>
              <li className="nav-separator" aria-hidden="true">|</li>
              <li><Link to="/admin" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
            </>
          )}


          {/* Mobile Only Auth Link (Optional, if we want it inside menu on mobile) */}
          <li className={`mobile-only-auth account-menu-scope ${user ? "mobile-account-menu-item" : ""}`}>
            {user ? (
              <button
                type="button"
                className="mobile-account-btn"
                aria-label="Account"
                aria-expanded={showAccountMenu}
                aria-haspopup="menu"
                title="Account"
                onClick={toggleAccountMenu}
              >
                <span className="account-avatar-letter">{getAccountInitial()}</span>
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
            )}
          </li>
          {user && showAccountMenu && (
            <li className="mobile-account-actions account-menu-scope" role="menu">
              <button type="button" className="mobile-account-action-btn" role="menuitem" onClick={handleSettings}>
                Settings
              </button>
            </li>
          )}
          {user && (
            <li className="mobile-only-logout">
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>

        {/* Action Group: Theme -> Search -> Auth */}
        <div className="navbar-actions">
          {/* Theme Dropdown */}
          <div className="theme-dropdown-container theme-menu-scope" style={{position: 'relative'}}>
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
              <div className="account-dropdown" style={{right: 0, minWidth: '150px'}} role="menu">
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'light' ? 'active' : ''}`} onClick={() => {setTheme('light'); setShowThemeMenu(false);}}>
                  <div className="theme-card-colors">
                    <div style={{background: '#2575fc'}}></div>
                    <div style={{background: '#1e40af'}}></div>
                    <div style={{background: '#ffd700'}}></div>
                    <div style={{background: '#f4f7f6'}}></div>
                  </div>
                  <div className="theme-card-label">Light</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'dark' ? 'active' : ''}`} onClick={() => {setTheme('dark'); setShowThemeMenu(false);}}>
                  <div className="theme-card-colors">
                    <div style={{background: '#4b6cb7'}}></div>
                    <div style={{background: '#182848'}}></div>
                    <div style={{background: '#ffd700'}}></div>
                    <div style={{background: '#121212'}}></div>
                  </div>
                  <div className="theme-card-label">Dark</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'vintage' ? 'active' : ''}`} onClick={() => {setTheme('vintage'); setShowThemeMenu(false);}}>
                  <div className="theme-card-colors">
                    <div style={{background: '#795548'}}></div>
                    <div style={{background: '#3e2723'}}></div>
                    <div style={{background: '#e65100'}}></div>
                    <div style={{background: '#f4ebd8'}}></div>
                  </div>
                  <div className="theme-card-label">Vintage</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'ocean' ? 'active' : ''}`} onClick={() => {setTheme('ocean'); setShowThemeMenu(false);}}>
                  <div className="theme-card-colors">
                    <div style={{background: '#0891b2'}}></div>
                    <div style={{background: '#164e63'}}></div>
                    <div style={{background: '#ebd576'}}></div>
                    <div style={{background: '#e7f5ff'}}></div>
                  </div>
                  <div className="theme-card-label">Ocean</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'forest' ? 'active' : ''}`} onClick={() => {setTheme('forest'); setShowThemeMenu(false);}}>
                  <div className="theme-card-colors">
                    <div style={{background: '#e6ccb2'}}></div>
                    <div style={{background: '#059669'}}></div>
                    <div style={{background: '#ddb892'}}></div>
                    <div style={{background: '#f3eadd'}}></div>
                  </div>
                  <div className="theme-card-label">Forest</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'midnight' ? 'active' : ''}`} onClick={() => {setTheme('midnight'); setShowThemeMenu(false);}}>
                  <div className="theme-card-colors">
                    <div style={{background: '#818cf8'}}></div>
                    <div style={{background: '#0f0f1a'}}></div>
                    <div style={{background: '#22d3ee'}}></div>
                    <div style={{background: '#000000'}}></div>
                  </div>
                  <div className="theme-card-label">Midnight</div>
                </button>
                <button type="button" className={`account-dropdown-item theme-option-card ${theme === 'nord' ? 'active' : ''}`} onClick={() => {setTheme('nord'); setShowThemeMenu(false);}}>
                  <div className="theme-card-colors">
                    <div style={{background: '#5e81ac'}}></div>
                    <div style={{background: '#2e3440'}}></div>
                    <div style={{background: '#88c0d0'}}></div>
                    <div style={{background: '#eceff4'}}></div>
                  </div>
                  <div className="theme-card-label">Nord</div>
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className={`search-container ${showMobileSearch ? "active" : ""}`}>
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="search-btn" onClick={handleSearchClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          {/* Desktop Auth Button */}
          <div className="desktop-auth account-menu-scope">
            {user ? (
              <>
                <button
                  type="button"
                  className="account-avatar-btn"
                  aria-label="Open account menu"
                  aria-expanded={showAccountMenu}
                  aria-haspopup="menu"
                  title="Account"
                  onClick={toggleAccountMenu}
                >
                  <span className="account-avatar-letter">{getAccountInitial()}</span>
                </button>
                {showAccountMenu && (
                  <div className="account-dropdown" role="menu">
                    <div className="account-dropdown-header">
                      <div className="account-dropdown-avatar">
                        <span className="account-avatar-letter">{getAccountInitial()}</span>
                      </div>
                      <p className="account-dropdown-label">{getAccountLabel()}</p>
                    </div>
                    <button type="button" className="account-dropdown-item" role="menuitem" onClick={handleSettings}>
                      Settings
                    </button>
                    <button type="button" className="account-dropdown-logout" role="menuitem" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="auth-btn-link">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
