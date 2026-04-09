import { getApiUrl } from '../utils/api';

export const trackVisit = async () => {
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL) {
        return;
    }

    try {
        await fetch(getApiUrl('/api/track'), { method: 'POST' });
    } catch (error) {
        if (process.env.NODE_ENV !== 'development') {
            console.error("Error tracking visit:", error);
        }
    }
};
