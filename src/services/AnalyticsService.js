import { getApiUrl } from '../utils/api';

const DEFAULT_ANALYTICS = {
    totalBooks: 0,
    newBooksCount: 0,
    genreData: [],
    totalQuestions: 0,
    questionsData: [],
    totalProgrammingSolutions: 0,
    programmingData: []
};

export const fetchAnalyticsData = async () => {
    try {
        const response = await fetch(getApiUrl('/api/admin/analytics'));

        if (!response.ok) {
            throw new Error('Failed to fetch analytics data.');
        }

        const data = await response.json();

        return {
            ...DEFAULT_ANALYTICS,
            ...data,
            genreData: Array.isArray(data.genreData) ? data.genreData : [],
            questionsData: Array.isArray(data.questionsData) ? data.questionsData : [],
            programmingData: Array.isArray(data.programmingData) ? data.programmingData : []
        };
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        return DEFAULT_ANALYTICS;
    }
};

export const fetchApiKeysStatus = async () => {
    try {
        const response = await fetch(getApiUrl('/api/admin/api-keys-status'));
        if (!response.ok) {
            throw new Error('Failed to fetch API keys status.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching API keys status:', error);
        return {
            lastPingAt: null,
            lastPingFormatted: 'Never',
            keys: []
        };
    }
};

export const triggerApiKeyPing = async (target = 'all') => {
    const response = await fetch(getApiUrl('/api/admin/keepalive-ping'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Failed to ping API key.');
    }

    return await response.json();
};

