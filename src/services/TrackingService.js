export const trackVisit = async () => {
    try {
        const apiUrl = process.env.REACT_APP_API_URL || '';
        await fetch(`${apiUrl}/api/track`, { method: 'POST' });
    } catch (error) {
        console.error("Error tracking visit:", error);
    }
};
