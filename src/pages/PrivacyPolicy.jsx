import React from 'react';
import useSEO from '../utils/useSEO';
import './About_us.css'; // Reusing styles for consistency

const PrivacyPolicy = () => {
    const sections = [
        {
            title: '1. Information We Collect',
            points: [
                'Account information such as your email address, username, and authentication details when you create or use an account.',
                'Verification and recovery information, including OTP codes and related email data, when you register or reset your password.',
                'User profile and preference information such as role, saved books, saved questions, saved question PDFs, theme selection, and account settings.',
                'Academic and admin-entered content such as book records, indexes, programming solutions, question data, university/course/subject information, and question PDF links.',
                'Usage and technical information such as page visits, device/browser context, performance metrics, and aggregated traffic insights collected through our own tracking endpoint and Vercel analytics tooling.',
                'Diagnostic error logs, including runtime JavaScript errors, exception stack traces, page URLs, and browser context captured automatically to diagnose crashes and ensure website stability.',
                'AI feature inputs, such as question content submitted for parsing or speed-test details submitted for improvement suggestions, when those features are used.',
                'Local device data such as saved theme preferences, dismissed install prompts, chunk-retry state, and temporary form data stored in your browser for convenience.'
            ]
        },
        {
            title: '2. Why We Use This Information',
            points: [
                'To create and manage accounts, authenticate users, and secure access to protected areas of the website.',
                'To send OTP emails for verification and password recovery.',
                'To provide saved-item features, account preferences, admin dashboards, content management, maintenance controls, and role-based access.',
                'To operate, improve, monitor, and protect the website, including diagnosing application crashes, resolving bugs, and measuring traffic and performance.',
                'To process AI-assisted parsing or suggestion requests when a user or administrator submits content to those tools.',
                'To respond to support requests, enforce our terms, and comply with applicable law.'
            ]
        },
        {
            title: '3. Services and Providers We Use',
            points: [
                'Firebase Authentication, Firestore, Firebase Storage, and related Google Firebase services to manage accounts, application data, stored files or links, and diagnostic error logs.',
                'Vercel Analytics and Vercel Speed Insights to understand website usage and performance.',
                'Brevo email infrastructure, through our backend, to deliver verification, password reset, and service emails.',
                'Google Gemini AI services to generate suggestions or parse academic content when AI features are used.',
                'External hosting or link destinations when the website references third-party files, PDFs, images, or resources.'
            ]
        },
        {
            title: '4. Cookies, Storage, and Similar Technologies',
            points: [
                'We use browser storage such as localStorage and sessionStorage for preferences, temporary convenience features, install prompt state, and chunk-load recovery.',
                'Third-party services we use may place or rely on cookies or similar technologies for analytics, security, or service delivery.',
                'If you disable cookies or browser storage, some parts of the site may not function properly.'
            ]
        },
        {
            title: '5. How We Share Information',
            points: [
                'We share data with service providers only as needed to host, secure, analyze, and operate the site.',
                'Content submitted to AI features may be sent to our configured AI provider so the requested parsing or suggestion can be generated.',
                'Email addresses and related email-delivery data may be shared with our email provider to send OTP, reset, or account-related messages.',
                'We may disclose information when required by law, to protect users, or to enforce our legal rights.',
                'We do not sell personal information.'
            ]
        },
        {
            title: '6. Data Retention',
            points: [
                'We keep account-related information while your account remains active or as needed for legitimate business or legal purposes.',
                'OTP records are intended to be short-lived and are used only for verification and password reset flows.',
                'Saved items, uploaded/admin-entered content, question links, programming solutions, and account preferences may remain until deleted, changed, or no longer needed for the service.',
                'Diagnostic logs and analytics records are kept as long as reasonably needed for security, debugging, performance monitoring, and operational purposes.',
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
                'We do not knowingly ask children to provide more personal information than is needed to use basic account features.'
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
            title: '10. International Processing',
            points: [
                'Our providers may process or store information on servers located outside your city, state, or country.',
                'By using the website, you understand that information may be processed wherever our service providers operate, subject to their safeguards and applicable law.'
            ]
        },
        {
            title: '11. Changes to This Policy',
            points: [
                'We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date.'
            ]
        }
    ];

    useSEO({
        title: 'Privacy Policy - How We Protect Your Data',
        description: 'Read how ExamFobiya collects, uses, and protects your personal information.',
        path: '/privacy',
        noindex: true
    });

    return (
        <div className="about-us-container legal-page">
            <div className="about-hero-section">
                <div className="legal-hero-inner">
                    <p className="about-eyebrow">Privacy Policy</p>
                    <h1 className="about-hero-title legal-hero-title">Privacy Policy</h1>
                    <p className="about-hero-subtitle legal-hero-subtitle">
                        This page explains what information ExamFobiya collects, how that information is used, and what choices users may have.
                    </p>
                    <p className="legal-meta">Last updated: August 17, 2026</p>
                </div>
            </div>

            <div className="about-content-wrapper legal-content-wrapper">
                <section className="legal-intro-card">
                    <p className="legal-intro-text">
                        This Privacy Policy is a practical website notice, not a substitute for advice from a qualified lawyer. It has been adjusted to better reflect the current ExamFobiya codebase, including Firebase authentication, Firestore, Firebase Storage, OTP email verification, Vercel analytics, Google Gemini AI features, diagnostic error logging, and browser storage.
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
