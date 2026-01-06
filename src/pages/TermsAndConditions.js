import React from 'react';
import './About_us.css'; // Reusing styles for consistency

const TermsAndConditions = () => {
    return (
        <div className="about-us-container">
            <div className="about-hero-section">
                <h1 className="about-hero-title">Terms & Conditions</h1>
                <p className="about-hero-subtitle">Please read these terms carefully before using our service.</p>
            </div>

            <div className="about-content-wrapper">
                <section className="about-mission-section" style={{ textAlign: 'left' }}>
                    <h2>1. Introduction</h2>
                    <p className="about-mission-text">
                        Welcome to ExamFobiya. By accessing our website and using our services, you agree to be bound by these Terms and Conditions.
                    </p>

                    <br />
                    <h2>2. Intellectual Property</h2>
                    <p className="about-mission-text">
                        All content provided on this website, including text, graphics, logos, and digital downloads, is the property of ExamFobiya or its content suppliers and is protected by international copyright laws.
                    </p>

                    <br />
                    <h2>3. User Account</h2>
                    <p className="about-mission-text">
                        If you create an account on our website, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>

                    <br />
                    <h2>4. Limitation of Liability</h2>
                    <p className="about-mission-text">
                        ExamFobiya shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
                    </p>

                    <br />
                    <h2>5. Changes to Terms</h2>
                    <p className="about-mission-text">
                        We reserve the right to modify these terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsAndConditions;
