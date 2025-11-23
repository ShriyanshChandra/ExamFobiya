import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo-link">
          <span className="brand-name">ExamFobia</span>
        </Link>

        {/* Navigation Links - Centered */}
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/books">Books</Link></li>
          <li className="dropdown">
            <span>Downloads</span>
            <ul className="dropdown-menu">
              <li><Link to="/papers">Previous Year Papers</Link></li>
            </ul>
          </li>
          <li><Link to="/about">About Us</Link></li>
        </ul>

        {/* Search Bar - Right Aligned */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
          <button className="search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
