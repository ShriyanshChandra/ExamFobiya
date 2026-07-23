import React, { useEffect } from 'react';
import { logErrorToFirebase } from '../services/ErrorLoggerService';

/**
 * GlobalErrorMonitor component
 * Runs continuously in the background to catch unhandled client-side JS errors
 * and unhandled promise rejections, automatically logging them to Firebase.
 */
const GlobalErrorMonitor = ({ children }) => {
    useEffect(() => {
        // Intercept global uncaught JavaScript errors
        const handleGlobalError = (event) => {
            const errorPayload = {
                message: event.message || event.error?.message || 'Global Script Error',
                stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
                type: 'window_error',
                url: window.location.href
            };
            logErrorToFirebase(errorPayload);
        };

        // Intercept unhandled promise rejections (e.g. failed async/fetch calls, dynamic import failures)
        const handleUnhandledRejection = (event) => {
            const reason = event.reason;
            const errorPayload = {
                message: reason?.message || (typeof reason === 'string' ? reason : 'Unhandled Promise Rejection'),
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
