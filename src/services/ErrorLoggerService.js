import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const recentErrorsSet = new Set();

/**
 * Checks whether a given URL or hostname corresponds to a localhost environment
 */
const isLocalhostUrl = (urlStr) => {
    if (!urlStr) return false;
    const lowerUrl = String(urlStr).toLowerCase();
    return (
        lowerUrl.includes('localhost') ||
        lowerUrl.includes('127.0.0.1') ||
        lowerUrl.includes('::1') ||
        lowerUrl.includes('0.0.0.0')
    );
};

/**
 * Logs a client-side error to Firebase Firestore under 'client_errors'
 * Excludes all localhost / local development errors.
 */
export const logErrorToFirebase = async (errorPayload) => {
    try {
        const {
            message = 'Unknown Error',
            stack = '',
            componentStack = '',
            type = 'unhandled_error',
            url = typeof window !== 'undefined' ? window.location.href : ''
        } = errorPayload || {};

        const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

        // Exclude localhost errors from error collection & logging
        if (isLocalhostUrl(currentUrl) || isLocalhostUrl(currentHost)) {
            console.log('[ErrorLogger] Skipping error logging for localhost:', message);
            return;
        }

        // Generate deduplication key (hash of message + url)
        const dedupKey = `${message}:${currentUrl}`;
        if (recentErrorsSet.has(dedupKey)) {
            return; // Skip duplicate error spam
        }

        recentErrorsSet.add(dedupKey);
        // Clear dedup key after 15 seconds
        setTimeout(() => recentErrorsSet.delete(dedupKey), 15000);

        const now = new Date();
        const formattedDate = now.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        const errorDoc = {
            message: String(message).slice(0, 1000),
            stack: String(stack).slice(0, 2000),
            componentStack: String(componentStack).slice(0, 2000),
            type,
            url: String(currentUrl).slice(0, 500),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            userId: auth.currentUser?.uid || 'anonymous',
            userEmail: auth.currentUser?.email || 'anonymous',
            resolved: false,
            date: formattedDate,
            timestamp: serverTimestamp(),
            createdAt: now.toISOString()
        };

        await addDoc(collection(db, 'client_errors'), errorDoc);
        console.log('[ErrorLogger] Client error successfully logged to Firebase:', message);
    } catch (err) {
        console.error('[ErrorLogger] Failed to log error to Firebase:', err);
    }
};

/**
 * Fetches recent logged client errors from Firebase, excluding localhost errors
 */
export const fetchRecentClientErrors = async (maxResults = 50) => {
    try {
        const errorsRef = collection(db, 'client_errors');
        const q = query(errorsRef, orderBy('createdAt', 'desc'), limit(maxResults));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(d => ({
                id: d.id,
                ...d.data(),
                resolved: d.data().resolved || false,
                date: d.data().date || (d.data().createdAt ? new Date(d.data().createdAt).toLocaleString() : 'N/A')
            }))
            .filter(err => !isLocalhostUrl(err.url));
    } catch (err) {
        console.error('[ErrorLogger] Failed to fetch client errors:', err);
        return [];
    }
};

/**
 * Toggles or updates the resolved status of an error in Firebase
 */
export const toggleErrorResolved = async (errorId, newResolvedStatus) => {
    try {
        const docRef = doc(db, 'client_errors', errorId);
        await updateDoc(docRef, { resolved: newResolvedStatus });
        return true;
    } catch (err) {
        console.error('[ErrorLogger] Failed to update error resolved status:', err);
        throw err;
    }
};

