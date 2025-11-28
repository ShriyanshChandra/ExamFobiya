import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-section">
                    <h3 className="brand-name">ExamFobiya</h3>
                    <p>Your one-stop destination for exam preparation.</p>
                </div>

                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <p>Email: <a href="mailto:examfobiya@gmail.com">examfobiya@gmail.com</a></p>
                    <p>Instagram: <a href="https://instagram.com/examfobiya" target="_blank" rel="noopener noreferrer">@examfobiya</a></p>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/terms">Terms & Conditions</Link></li>
                        <li><Link to="/privacy">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} ExamFobiya. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
