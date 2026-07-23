import React from 'react';
import { logErrorToFirebase } from '../services/ErrorLoggerService';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
        logErrorToFirebase({
            message: error?.message || 'ErrorBoundary Caught Exception',
            stack: error?.stack || '',
            componentStack: errorInfo?.componentStack || '',
            type: 'react_component_error',
            url: window.location.href
        });
    }

    handleReload = () => {
        window.sessionStorage.removeItem('chunk_retry_refreshed');
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const isChunkError =
                this.state.error?.name === 'ChunkLoadError' ||
                (this.state.error?.message &&
                    (this.state.error.message.includes('Failed to fetch dynamically imported module') ||
                        this.state.error.message.includes('Importing a module script failed')));

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-color, #333)'
                }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '700' }}>
                        {isChunkError ? 'New Update Available' : 'Something went wrong'}
                    </h2>
                    <p style={{ maxWidth: '480px', marginBottom: '1.5rem', opacity: 0.85, lineHeight: 1.5 }}>
                        {isChunkError
                            ? 'A new version of ExamFobiya was deployed. Please refresh the page to load the latest changes.'
                            : 'An unexpected error occurred while loading this page. Click below to refresh.'}
                    </p>
                    <button
                        onClick={this.handleReload}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'var(--primary-color, #2575fc)',
                            color: '#fff',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
