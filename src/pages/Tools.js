import React from 'react';
import { Link } from 'react-router-dom';
import './Tools.css';

const Tools = () => {
    const tools = [
        {
            id: 1,
            title: "CGPA Calculator",
            description: "Calculate your semester and cumulative CGPA easily.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <line x1="8" y1="6" x2="16" y2="6"></line>
                    <line x1="16" y1="14" x2="16" y2="18"></line>
                    <path d="M16 10h.01"></path>
                    <path d="M12 10h.01"></path>
                    <path d="M8 10h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M8 14h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M8 18h.01"></path>
                </svg>
            ),
            link: "#", // Replace with actual link when ready
            isComingSoon: true
        },
        {
            id: 2,
            title: "PDF Compressor",
            description: "Compress your PDF files without losing quality.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
            ),
            link: "#",
            isComingSoon: true
        },
        {
            id: 3,
            title: "QR Generator",
            description: "Convert any link into a downloadable QR code.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            ),
            link: "/tools/qr-generator",
            isComingSoon: false
        }
    ];

    return (
        <div className="tools-page">
            <div className="tools-content">
                <div className="tools-header">
                    <h1>Tools</h1>
                </div>

                <div className="tools-grid">
                    {tools.map(tool => (
                        <Link to={tool.link} key={tool.id} className="tool-card" onClick={e => tool.isComingSoon && e.preventDefault()}>
                            <div className="tool-icon">
                                {tool.icon}
                            </div>
                            <h3>{tool.title}</h3>
                            <p>{tool.description}</p>
                            {tool.isComingSoon && <span className="coming-soon-badge">Coming Soon</span>}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Tools;
