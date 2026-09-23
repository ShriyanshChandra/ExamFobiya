import React, { useState, useEffect, useRef } from 'react';
import { useNetworkQuality } from '../utils/useNetworkQuality';
import './NetworkStatusNotification.css';

// Clean SVG Signal Alert Icon (No emojis)
const IconSignalSlow = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="network-status-icon">
        <path d="M2 20h.01" />
        <path d="M7 20v-4" />
        <path d="M12 20v-8" />
        <path d="M17 20V8" />
        <path d="M22 4v16" strokeDasharray="2 2" opacity="0.6" />
        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2.5" />
    </svg>
);

// Clean SVG Close Icon (No emojis)
const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export function NetworkStatusNotification() {
    const { isSlow, isStable, isOnline } = useNetworkQuality();
    const [visible, setVisible] = useState(() => isSlow || !isOnline);
    const timerRef = useRef(null);
    const lastShownRef = useRef(isSlow || !isOnline ? Date.now() : 0);
    const prevSlowRef = useRef(isSlow || !isOnline);

    // Cooldown duration between consecutive slow internet alerts (30 seconds)
    const ALERT_COOLDOWN_MS = 30000;

    // Start 5-second timer on initial preload mount if already slow
    useEffect(() => {
        if (visible && !timerRef.current) {
            timerRef.current = setTimeout(() => {
                setVisible(false);
                timerRef.current = null;
            }, 5000);
        }
    }, []);

    useEffect(() => {
        const now = Date.now();

        // 1. Connection became slow / unstable
        if ((isSlow || !isOnline) && !prevSlowRef.current) {
            // Check if cooldown has elapsed
            if (now - lastShownRef.current > ALERT_COOLDOWN_MS) {
                setVisible(true);
                lastShownRef.current = now;

                // Clear any existing active timer
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }

                // Disappear after exactly 5 seconds
                timerRef.current = setTimeout(() => {
                    setVisible(false);
                    timerRef.current = null;
                }, 5000);
            }
        }

        // 2. Connection stabilized within the 5-second duration -> Disappear immediately
        if (isStable && isOnline && visible) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            setVisible(false);
        }

        prevSlowRef.current = isSlow || !isOnline;
    }, [isSlow, isStable, isOnline, visible]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const handleDismiss = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <div className="network-slow-toast" role="status" aria-live="polite">
            <div className="network-slow-content">
                <div className="network-slow-icon-wrap" aria-hidden="true">
                    <IconSignalSlow />
                </div>
                <div className="network-slow-text-wrap">
                    <span className="network-slow-title">Slow Connection</span>
                    <span className="network-slow-desc">
                        Unstable network. Content may take longer to load.
                    </span>
                </div>
            </div>
            <button
                type="button"
                className="network-slow-close-btn"
                onClick={handleDismiss}
                aria-label="Dismiss slow internet alert"
                title="Dismiss"
            >
                <IconClose />
            </button>
            <div className="network-slow-progress-track">
                <div className="network-slow-progress-bar" />
            </div>
        </div>
    );
}

export default NetworkStatusNotification;
