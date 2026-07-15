import { getApiUrl } from '../utils/api';

const VISIT_SESSION_KEY = 'examfobiya_visit_tracked';

export const trackVisit = () => {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage.getItem(VISIT_SESSION_KEY) === 'true') {
            return;
        }
    } catch (error) {
        console.warn('Unable to read visit tracking state from session storage:', error);
    }

    const executeTracking = async () => {
        try {
            const response = await fetch(getApiUrl('/api/track'), {
                method: 'POST',
                keepalive: true
            });

            if (!response.ok) {
                throw new Error(`Visit tracking failed with status ${response.status}`);
            }

            if (typeof window !== 'undefined') {
                window.sessionStorage.setItem(VISIT_SESSION_KEY, 'true');
            }
        } catch (error) {
            console.error("Error tracking visit:", error);
        }
    };

    if (typeof window !== 'undefined') {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => executeTracking());
        } else {
            // Fallback for Safari
            setTimeout(executeTracking, 2000);
        }
    }
};
