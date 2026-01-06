import React from 'react';
import './About_us.css'; // Reusing styles for consistency

const PrivacyPolicy = () => {
    return (
        <div className="about-us-container">
            <div className="about-hero-section">
                <h1 className="about-hero-title">Privacy Policy</h1>
                <p className="about-hero-subtitle">Your privacy is important to us.</p>
            </div>

            <div className="about-content-wrapper">
                <section className="about-mission-section" style={{ textAlign: 'left' }}>
                    <h2>1. Information We Collect</h2>
                    <p className="about-mission-text">
                        We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support.
                    </p>

                    <br />
                    <h2>2. How We Use Your Information</h2>
                    <p className="about-mission-text">
                        We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to monitor and analyze trends and usage.
                    </p>

                    <br />
                    <h2>3. Data Security</h2>
                    <p className="about-mission-text">
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </p>

                    <br />
                    <h2>4. Cookies</h2>
                    <p className="about-mission-text">
                        We use cookies to collect information about your browsing activities and to distinguish you from other users of our website.
                    </p>

                    <br />
                    <h2>5. Contact Us</h2>
                    <p className="about-mission-text">
                        If you have any questions about this Privacy Policy, please contact us at examfobiya@gmail.com.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
