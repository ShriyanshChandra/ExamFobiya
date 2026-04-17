import { getApiUrl } from '../utils/api';

const DEFAULT_ANALYTICS = {
    totalBooks: 0,
    newBooksCount: 0,
    totalUsers: 0,
    userGrowthPercentage: '0.0',
    totalVisits: 0,
    visitGrowthPercentage: '0.0',
    genreData: [],
    trafficData: []
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
            trafficData: Array.isArray(data.trafficData) ? data.trafficData : []
        };
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        return DEFAULT_ANALYTICS;
    }
};
