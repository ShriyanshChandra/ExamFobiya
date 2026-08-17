import React from 'react';
import useSEO from '../utils/useSEO';
import './About_us.css'; // Reusing styles for consistency

const TermsAndConditions = () => {
    const sections = [
        {
            title: '1. Acceptance of Terms',
            points: [
                'By accessing or using ExamFobiya, you agree to these Terms and Conditions.',
                'If you do not agree, please do not use the website or create an account.'
            ]
        },
        {
            title: '2. Description of the Service',
            points: [
                'ExamFobiya provides information and resources related to books, study materials, indexes, programming solutions, question links, and academic reference content.',
                'Some features may help administrators add or parse academic content, including AI-assisted parsing or suggestions, but users and administrators remain responsible for reviewing accuracy before relying on that output.',
                'We may update, remove, suspend, or change parts of the website, content, links, or features at any time.'
            ]
        },
        {
            title: '3. Accounts and Security',
            points: [
                'You are responsible for maintaining the confidentiality of your login credentials and for activity carried out through your account.',
                'You must provide accurate information when registering and keep your account details up to date.',
                'We may suspend or restrict access if we believe an account is being misused or used in violation of these terms.'
            ]
        },
        {
            title: '4. Acceptable Use',
            points: [
                'You agree not to misuse the website, interfere with its operation, attempt unauthorized access, scrape protected data, upload or submit unlawful content, overload service endpoints, or use the service for fraud or abuse.',
                'You also agree not to use the website in a way that infringes the rights of other users, publishers, authors, institutions, or third parties.',
                'Automated access, bulk copying, reverse engineering, vulnerability probing, and attempts to bypass authentication or role-based access controls are not permitted without our written permission.'
            ]
        },
        {
            title: '5. Content and Intellectual Property',
            points: [
                'The website design, branding, text, and original site content are owned by or licensed to ExamFobiya unless otherwise stated.',
                'Books, author names, cover images, questions, and related materials may belong to their respective owners.',
                'Question PDF links, programming solutions, book indexes, and other academic materials are provided for informational or educational reference and may include third-party content or links.',
                'If any third-party rights holder believes content should be reviewed or removed, they may contact us with enough detail to identify the material.'
            ]
        },
        {
            title: '6. Educational and Informational Use',
            points: [
                'ExamFobiya is intended to help users discover and navigate study resources; it does not guarantee academic results, availability of any specific title, or uninterrupted access to all content.',
                'Users should independently confirm suitability, syllabus relevance, question accuracy, solution correctness, and any publisher or institutional restrictions before relying on listed materials.',
                'ExamFobiya is not affiliated with any university, publisher, or examination authority unless expressly stated.'
            ]
        },
        {
            title: '7. Third-Party Services',
            points: [
                'Parts of the website rely on third-party infrastructure and services, including Firebase, Vercel, Brevo email infrastructure, Google Gemini AI services, and any external links or hosted files referenced from the website.',
                'Your use of features delivered through those services may also be affected by their technical and legal terms.'
            ]
        },
        {
            title: '8. User Accounts, Saved Items, and Admin Actions',
            points: [
                'Account features may allow users to save books, saved questions, preferences, or related account settings.',
                'Administrators may add, edit, remove, or organize books, questions, programming solutions, users, maintenance settings, and other platform data through protected admin tools.',
                'We are not responsible for loss of saved preferences, temporary drafts, linked files, or user-submitted/admin-submitted content caused by bugs, service downtime, content removal, or account restrictions.'
            ]
        },
        {
            title: '9. Disclaimers and Limitation of Liability',
            points: [
                'The website is provided on an as-is and as-available basis to the extent permitted by applicable law.',
                'We do not promise that the website, listed content, linked files, AI-generated output, or third-party services will always be accurate, error-free, secure, or continuously available.',
                'To the extent permitted by applicable law, ExamFobiya will not be liable for indirect, incidental, special, or consequential damages arising from the use of or inability to use the website.'
            ]
        },
        {
            title: '10. Termination',
            points: [
                'We may suspend or terminate access if we reasonably believe a user has violated these terms, created risk, or abused the platform.',
                'You may stop using the service at any time.'
            ]
        },
        {
            title: '11. Changes to These Terms',
            points: [
                'We may revise these Terms and Conditions from time to time. Continued use of the website after updates means you accept the revised version.'
            ]
        }
    ];

    useSEO({
        title: 'Terms & Conditions - Platform Usage Policy',
        description: 'Review the terms and conditions for using ExamFobiya.',
        path: '/terms',
        noindex: true
    });

    return (
        <div className="about-us-container legal-page">
            <div className="about-hero-section">
                <div className="legal-hero-inner">
                    <p className="about-eyebrow">Terms & Conditions</p>
                    <h1 className="about-hero-title legal-hero-title">Terms & Conditions</h1>
                    <p className="about-hero-subtitle legal-hero-subtitle">
                        These terms explain the basic rules for using ExamFobiya and the limits of the service we provide.
                    </p>
                    <p className="legal-meta">Last updated: August 17, 2026</p>
                </div>
            </div>

            <div className="about-content-wrapper legal-content-wrapper">
                <section className="legal-intro-card">
                    <p className="legal-intro-text">
                        These terms are written to better match the current ExamFobiya service and are intended as a practical website baseline. For jurisdiction-specific enforceability, a local lawyer should review them before relying on them as final legal advice.
                    </p>
                </section>

                <section className="legal-grid">
                    {sections.map((section) => (
                        <article className="legal-card" key={section.title}>
                            <h2 className="legal-card-title">{section.title}</h2>
                            <ul className="legal-list">
                                {section.points.map((point) => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </section>

                <section className="legal-contact-card">
                    <h2 className="legal-card-title">Contact</h2>
                    <p className="about-mission-text legal-contact-text">
                        Questions about these terms can be sent to
                        {' '}
                        <a href="mailto:examfobiya@gmail.com" className="legal-link">examfobiya@gmail.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsAndConditions;
