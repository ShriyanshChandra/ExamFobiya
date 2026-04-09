import React, { useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Maintenance.css';

const Maintenance = () => {
    useEffect(() => {
        // Force the page to always use the Light Theme regardless of system preferences
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);
    return (
        <div className="maintenance-container">
            <div className="maintenance-card">
                <div className="maintenance-animation">
                    {/* Replace the src path below with your downloaded .lottie URL */}
                    <DotLottieReact
                      src="/Under Maintenance.json"
                      loop
                      autoplay
                    />
                </div>
                <h1 className="maintenance-title">We'll be back soon!</h1>
                <p className="maintenance-text">
                    Sorry for the inconvenience. We are currently performing some essential maintenance to improve your experience. We will be back online shortly!
                </p>
                <div className="maintenance-footer">
                    &copy; {new Date().getFullYear()} ExamFobiya. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
