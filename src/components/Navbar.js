import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ setSearchQuery }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 70) {
        // Scrolling down & past navbar height
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      // Close mobile search on scroll
      if (showMobileSearch) {
        setShowMobileSearch(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, showMobileSearch]);

  // Click outside listener for mobile search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileSearch && !event.target.closest('.search-container')) {
        setShowMobileSearch(false);
      }
    };

    if (showMobileSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileSearch]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowMobileSearch(false); // Close search when menu opens
  };

  const handleSearchSubmit = () => {
    if (setSearchQuery) {
      setSearchQuery(localSearch);
    }
    navigate("/books");
    setIsOpen(false);
    setShowMobileSearch(false);
  };

  const handleSearchClick = (e) => {
    // Mobile logic
    if (window.innerWidth <= 768) {
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

  const handleLogout = () => {
    // Only verify logout if we want to confirm, but usually direct is fine
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className={`navbar ${!isVisible ? "navbar-hidden" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo-link" onClick={() => setIsOpen(false)}>
          <span className="brand-name">ExamFobiya</span>
        </Link>

        {/* Hamburger Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
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
        </div>

        {/* Navigation Links - Centered */}
        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/books" onClick={() => setIsOpen(false)}>Books</Link></li>


          {/* Conditional Dashboard Link */}
          {(user?.role === 'admin' || user?.role === 'developer') && (
            <>
              {user.role === 'admin' && <li><Link to="/admin" onClick={() => setIsOpen(false)}>Dashboard</Link></li>}
              {user.role === 'developer' && <li><Link to="/dev" onClick={() => setIsOpen(false)}>Dashboard</Link></li>}
            </>
          )}

          <li className="dropdown">
            <span>Downloads</span>
            <ul className="dropdown-menu">
              <li><Link to="/papers" onClick={() => setIsOpen(false)}>Previous Year Papers</Link></li>
            </ul>
          </li>
          <li><Link to="/about" onClick={() => setIsOpen(false)}>About Us</Link></li>

          {/* Mobile Only Auth Link (Optional, if we want it inside menu on mobile) */}
          <li className="mobile-only-auth">
            {user ? (
              <span onClick={handleLogout}>Logout</span>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
            )}
          </li>
        </ul>

        {/* Action Group: Theme -> Search -> Auth */}
        <div className="navbar-actions">
          {/* Theme Toggle Button */}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Dark Mode">
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-moon">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-sun">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

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
          <div className="desktop-auth">
            {user ? (
              <button className="auth-btn" onClick={handleLogout}>Logout</button>
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
