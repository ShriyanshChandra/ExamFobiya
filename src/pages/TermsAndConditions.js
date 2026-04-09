import React from 'react';
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
                'ExamFobiya provides information and resources related to books, study materials, indexes, and question papers for academic use.',
                'We may update, remove, suspend, or change parts of the website at any time.'
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
                'You agree not to misuse the website, interfere with its operation, attempt unauthorized access, scrape protected data, upload unlawful content, or use the service for fraud or abuse.',
                'You also agree not to use the website in a way that infringes the rights of other users, publishers, authors, or third parties.'
            ]
        },
        {
            title: '5. Content and Intellectual Property',
            points: [
                'The website design, branding, text, and original site content are owned by or licensed to ExamFobiya unless otherwise stated.',
                'Books, author names, cover images, question papers, and related materials may belong to their respective owners.',
                'If any third-party rights holder believes content should be reviewed or removed, they may contact us.'
            ]
        },
        {
            title: '6. Educational and Informational Use',
            points: [
                'ExamFobiya is intended to help users discover and navigate study resources; it does not guarantee academic results, availability of any specific title, or uninterrupted access to all content.',
                'Users should independently confirm suitability, syllabus relevance, and any publisher restrictions before relying on listed materials.'
            ]
        },
        {
            title: '7. Third-Party Services',
            points: [
                'Parts of the website rely on third-party infrastructure and services, including Firebase, Vercel, and email delivery providers.',
                'Your use of features delivered through those services may also be affected by their technical and legal terms.'
            ]
        },
        {
            title: '8. Disclaimers and Limitation of Liability',
            points: [
                'The website is provided on an as-is and as-available basis to the extent permitted by applicable law.',
                'We do not promise that the website will always be error-free, secure, or continuously available.',
                'To the extent permitted by applicable law, ExamFobiya will not be liable for indirect, incidental, special, or consequential damages arising from the use of or inability to use the website.'
            ]
        },
        {
            title: '9. Termination',
            points: [
                'We may suspend or terminate access if we reasonably believe a user has violated these terms, created risk, or abused the platform.',
                'You may stop using the service at any time.'
            ]
        },
        {
            title: '10. Changes to These Terms',
            points: [
                'We may revise these Terms and Conditions from time to time. Continued use of the website after updates means you accept the revised version.'
            ]
        }
    ];

    return (
        <div className="about-us-container legal-page">
            <div className="about-hero-section">
                <div className="legal-hero-inner">
                    <p className="about-eyebrow">Terms & Conditions</p>
                    <h1 className="about-hero-title legal-hero-title">Terms & Conditions</h1>
                    <p className="about-hero-subtitle legal-hero-subtitle">
                        These terms explain the basic rules for using ExamFobiya and the limits of the service we provide.
                    </p>
                    <p className="legal-meta">Last updated: April 9, 2026</p>
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
