import { useState, useEffect } from 'react';

// Capture event globally in case it fires before React components mount
if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPWAInstallPrompt = e;
    });
}

/**
 * Custom React hook to handle PWA installation prompt and state.
 */
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(
        typeof window !== 'undefined' ? window.deferredPWAInstallPrompt || null : null
    );
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const checkStandalone = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true;
            setIsInstalled(isStandalone);
        };

        checkStandalone();

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            window.deferredPWAInstallPrompt = e;
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            window.deferredPWAInstallPrompt = null;
            console.log('[PWA] App successfully installed');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleDisplayModeChange = (e) => {
            if (e.matches) {
                setIsInstalled(true);
            }
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleDisplayModeChange);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleDisplayModeChange);
            }
        };
    }, []);

    const installApp = async () => {
        const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;

        if (!promptEvent) {
            return 'no_prompt';
        }

        try {
            promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
                setDeferredPrompt(null);
                window.deferredPWAInstallPrompt = null;
                return 'accepted';
            }
            return 'dismissed';
        } catch (err) {
            console.error('[PWA] Error triggering install prompt:', err);
            return 'error';
        }
    };

    return {
        canInstall: !isInstalled,
        hasNativePrompt: !!(deferredPrompt || window?.deferredPWAInstallPrompt),
        isInstalled,
        installApp
    };
}

export default usePWAInstall;
