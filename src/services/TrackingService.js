import { getApiUrl } from '../utils/api';

const VISIT_SESSION_KEY = 'examfobiya_visit_tracked';

export const trackVisit = async () => {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage.getItem(VISIT_SESSION_KEY) === 'true') {
            return;
        }
    } catch (error) {
        console.warn('Unable to read visit tracking state from session storage:', error);
    }

    try {
        await fetch(getApiUrl('/api/track'), { method: 'POST' });

        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(VISIT_SESSION_KEY, 'true');
        }
    } catch (error) {
        console.error("Error tracking visit:", error);
    }
};
