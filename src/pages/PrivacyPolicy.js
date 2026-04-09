import React from 'react';
import './About_us.css'; // Reusing styles for consistency

const PrivacyPolicy = () => {
    const sections = [
        {
            title: '1. Information We Collect',
            points: [
                'Account information such as your email address, username, and authentication details when you create or use an account.',
                'Verification and recovery information, including OTP codes and related email data, when you register or reset your password.',
                'Usage and technical information such as page visits, device/browser context, performance metrics, and aggregated traffic insights collected through our own tracking endpoint and Vercel analytics tooling.',
                'Local device data such as saved theme preferences and temporary form data stored in your browser for convenience.'
            ]
        },
        {
            title: '2. Why We Use This Information',
            points: [
                'To create and manage accounts, authenticate users, and secure access to protected areas of the website.',
                'To send OTP emails for verification and password recovery.',
                'To operate, improve, monitor, and protect the website, including measuring traffic and performance.',
                'To respond to support requests, enforce our terms, and comply with applicable law.'
            ]
        },
        {
            title: '3. Services and Providers We Use',
            points: [
                'Firebase Authentication, Firestore, and related Google Firebase services to manage accounts and application data.',
                'Vercel Analytics and Vercel Speed Insights to understand website usage and performance.',
                'Brevo email infrastructure, through our backend, to deliver verification and password reset emails.'
            ]
        },
        {
            title: '4. Cookies, Storage, and Similar Technologies',
            points: [
                'We use browser storage such as localStorage for preferences and temporary convenience features.',
                'Third-party services we use may place or rely on cookies or similar technologies for analytics, security, or service delivery.',
                'If you disable cookies or browser storage, some parts of the site may not function properly.'
            ]
        },
        {
            title: '5. How We Share Information',
            points: [
                'We share data with service providers only as needed to host, secure, analyze, and operate the site.',
                'We may disclose information when required by law, to protect users, or to enforce our legal rights.',
                'We do not state that we sell personal information.'
            ]
        },
        {
            title: '6. Data Retention',
            points: [
                'We keep account-related information while your account remains active or as needed for legitimate business or legal purposes.',
                'OTP records are intended to be short-lived and are used only for verification and password reset flows.',
                'Browser-stored information remains on your device until it expires, is overwritten, or you clear it.'
            ]
        },
        {
            title: '7. Your Rights and Choices',
            points: [
                'You can contact us to request access to the personal data we hold about you, or to request correction or deletion where applicable.',
                'You may also ask questions about how your data is processed or withdraw consent where consent is the basis for processing, subject to legal or operational limits.',
                'If you are located in India, we intend this notice to support the transparency, access, correction, erasure, and grievance expectations reflected in the Digital Personal Data Protection Act, 2023.'
            ]
        },
        {
            title: '8. Children',
            points: [
                'This website is intended primarily for college-level and adult learners.',
                'If you are under 18, please use the website only with the involvement of a parent or legal guardian.',
                'If you plan to actively allow under-18 registrations, additional child-data compliance steps may be required.'
            ]
        },
        {
            title: '9. Security',
            points: [
                'We use service providers and technical controls intended to reduce unauthorized access, misuse, or loss of personal information.',
                'No method of transmission or storage is perfectly secure, so we cannot guarantee absolute security.'
            ]
        },
        {
            title: '10. Changes to This Policy',
            points: [
                'We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date.'
            ]
        }
    ];

    return (
        <div className="about-us-container legal-page">
            <div className="about-hero-section">
                <div className="legal-hero-inner">
                    <p className="about-eyebrow">Privacy Policy</p>
                    <h1 className="about-hero-title legal-hero-title">Privacy Policy</h1>
                    <p className="about-hero-subtitle legal-hero-subtitle">
                        This page explains what information ExamFobiya collects, how that information is used, and what choices users may have.
                    </p>
                    <p className="legal-meta">Last updated: April 9, 2026</p>
                </div>
            </div>

            <div className="about-content-wrapper legal-content-wrapper">
                <section className="legal-intro-card">
                    <p className="legal-intro-text">
                        This Privacy Policy is a practical website notice, not a substitute for advice from a qualified lawyer. It has been adjusted to better reflect the current ExamFobiya codebase, including Firebase authentication, OTP email verification, Vercel analytics, and browser storage.
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
                        For privacy questions, correction or deletion requests, or general concerns about personal data handling, contact
                        {' '}
                        <a href="mailto:examfobiya@gmail.com" className="legal-link">examfobiya@gmail.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
