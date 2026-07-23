import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePWAInstall } from '../utils/usePWAInstall';
import './PWAInstallBanner.css';

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconDownload = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export function PWAInstallBanner() {
    const { user } = useAuth();
    const { canInstall, isInstalled, installApp } = usePWAInstall();
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // If app is installed and user is logged in, DO NOT show banner
        if (isInstalled) {
            setVisible(false);
            return;
        }

        // Check if user previously dismissed in this session
        const sessionDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
        if (sessionDismissed || dismissed) {
            setVisible(false);
            return;
        }

        // Show banner for non-logged-in users OR logged-in users who haven't installed it
        setVisible(true);

        // Auto-dismiss after 7 seconds without disturbing browsing
        const timer = setTimeout(() => {
            setVisible(false);
        }, 7000);

        return () => clearTimeout(timer);
    }, [isInstalled, user, dismissed]);

    const handleClose = () => {
        setVisible(false);
        setDismissed(true);
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
    };

    const handleInstallClick = async () => {
        const success = await installApp();
        if (success) {
            setVisible(false);
        }
    };

    if (!visible || isInstalled) {
        return null;
    }

    return (
        <div className="pwa-install-toast" role="alert" aria-live="polite">
            <div className="pwa-install-content">
                <img
                    src="/logo192.png"
                    alt="ExamFobiya App"
                    className="pwa-install-app-icon"
                />
                <div className="pwa-install-text-info">
                    <span className="pwa-install-title">Install ExamFobiya</span>
                    <span className="pwa-install-subtitle">Fast & offline access on your device</span>
                </div>
            </div>
            <div className="pwa-install-actions">
                <button
                    className="pwa-install-btn"
                    onClick={handleInstallClick}
                    aria-label="Install ExamFobiya Application"
                >
                    <IconDownload /> Install
                </button>
                <button
                    className="pwa-install-close-btn"
                    onClick={handleClose}
                    aria-label="Close install prompt"
                    title="Close"
                >
                    <IconClose />
                </button>
            </div>
        </div>
    );
}

export default PWAInstallBanner;
