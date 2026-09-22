import React, { useEffect } from 'react';
import { logErrorToFirebase } from '../services/ErrorLoggerService';

/**
 * GlobalErrorMonitor
 * Catches unhandled JS errors and promise rejections and logs them to Firebase.
 *
 * Errors that are filtered out (never logged):
 *  - Vite CSS / JS chunk preload failures (stale deployment, handled by App.jsx auto-reload)
 *  - Network / connectivity errors caused by a slow or offline user connection:
 *      fetch failures, XHR network errors, Firebase offline errors, SSL/CORS transients, timeouts
 */

// Returns true for messages that are 100% caused by the user's network, not the app.
const isTransientError = (msg = '', error = null) => {
    const m = msg.toLowerCase();

    // 1. Vite chunk preload failures (deployment hash mismatch)
    if (
        m.includes('unable to preload css') ||
        m.includes('failed to fetch dynamically imported module')
    ) return true;

    // 2. Generic fetch / XHR network failures
    if (
        m.includes('failed to fetch') ||
        m.includes('networkerror') ||
        m.includes('network error') ||
        m.includes('network request failed') ||
        m.includes('load failed')          // Safari's equivalent of "Failed to fetch"
    ) return true;

    // 3. Browser-level TCP/DNS/SSL transport errors (Chrome net:: codes)
    if (
        m.includes('net::err_') ||
        m.includes('err_internet_disconnected') ||
        m.includes('err_network_changed') ||
        m.includes('err_connection_timed_out') ||
        m.includes('err_connection_refused') ||
        m.includes('err_connection_reset') ||
        m.includes('err_connection_closed') ||
        m.includes('err_name_not_resolved') ||
        m.includes('err_ssl_protocol_error') ||
        m.includes('err_cert')
    ) return true;

    // 4. Firebase / Firestore offline / unavailable errors
    if (
        m.includes('client is offline') ||
        m.includes('failed to get document because the client is offline') ||
        m.includes('could not reach cloud firestore backend') ||
        m.includes('backend didn\'t respond') ||
        m.includes('unavailable') && m.includes('firestore')
    ) return true;

    // 5. Generic timeout / abort signals
    if (
        m.includes('timeout') ||
        m.includes('timed out') ||
        m.includes('request aborted') ||
        m.includes('aborted') ||
        (error?.name === 'AbortError')
    ) return true;

    // 6. User is provably offline at the time of the error
    if (typeof navigator !== 'undefined' && !navigator.onLine) return true;

    return false;
};

const GlobalErrorMonitor = ({ children }) => {
    useEffect(() => {
        // Intercept global uncaught JavaScript errors
        const handleGlobalError = (event) => {
            const msg = event.message || event.error?.message || '';
            if (isTransientError(msg, event.error)) return;
            const errorPayload = {
                message: msg || 'Global Script Error',
                stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
                type: 'window_error',
                url: window.location.href
            };
            logErrorToFirebase(errorPayload);
        };

        // Intercept unhandled promise rejections (failed fetches, dynamic imports, etc.)
        const handleUnhandledRejection = (event) => {
            const reason = event.reason;
            const msg = reason?.message || (typeof reason === 'string' ? reason : '');
            if (isTransientError(msg, reason)) return;
            const errorPayload = {
                message: msg || 'Unhandled Promise Rejection',
                stack: reason?.stack || 'No stack trace available',
                type: 'unhandled_promise_rejection',
                url: window.location.href
            };
            logErrorToFirebase(errorPayload);
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return children || null;
};

export default GlobalErrorMonitor;
