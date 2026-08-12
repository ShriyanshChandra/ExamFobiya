import { getApiUrl } from '../utils/api';

const SITE_URL = 'https://www.examfobiya.com';

/**
 * Notify IndexNow about changed URLs so search engines re-crawl them promptly.
 * Runs as fire-and-forget -- failures are silently logged, never thrown.
 *
 * @param {string[]} paths - Route paths that changed, e.g. ['/books', '/programming-solutions']
 */
export const notifyIndexNow = async (paths) => {
    if (!paths || paths.length === 0) return;

    const urlList = paths.map(p => `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`);

    try {
        await fetch(getApiUrl('/api/indexnow/notify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: urlList })
        });
    } catch (err) {
        // Fire-and-forget: don't disrupt normal app flow
        console.warn('IndexNow notification failed (non-critical):', err.message);
    }
};
