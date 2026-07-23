import React, { useEffect, useMemo, useState } from 'react';
import { fetchAnalyticsData } from '../services/AnalyticsService';
import { fetchRecentClientErrors, toggleErrorResolved } from '../services/ErrorLoggerService';
import Loader from '../components/Loader';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        genreData: [],
        totalQuestions: 0,
        questionsData: [],
        totalProgrammingSolutions: 0,
        programmingData: []
    });
    const [clientErrors, setClientErrors] = useState([]);
    const [loadingErrors, setLoadingErrors] = useState(true);
    const [expandedErrorId, setExpandedErrorId] = useState(null);
    const [errorFilter, setErrorFilter] = useState('all'); // 'all', 'unresolved', 'resolved'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            const data = await fetchAnalyticsData();
            setStats(data);
            setLoading(false);

            try {
                const errors = await fetchRecentClientErrors(50);
                setClientErrors(errors);
            } catch (err) {
                console.error("Failed to load client errors:", err);
            } finally {
                setLoadingErrors(false);
            }
        };

        loadDashboardData();
    }, []);

    const handleToggleResolved = async (errorId, currentResolved) => {
        const newStatus = !currentResolved;
        // Optimistic UI update
        setClientErrors(prev =>
            prev.map(item => item.id === errorId ? { ...item, resolved: newStatus } : item)
        );

        try {
            await toggleErrorResolved(errorId, newStatus);
        } catch (err) {
            // Revert state on error
            setClientErrors(prev =>
                prev.map(item => item.id === errorId ? { ...item, resolved: currentResolved } : item)
            );
        }
    };

    const toggleExpandError = (errorId) => {
        setExpandedErrorId(prev => prev === errorId ? null : errorId);
    };

    const filteredErrors = useMemo(() => {
        if (errorFilter === 'unresolved') return clientErrors.filter(e => !e.resolved);
        if (errorFilter === 'resolved') return clientErrors.filter(e => e.resolved);
        return clientErrors;
    }, [clientErrors, errorFilter]);

    const unresolvedCount = useMemo(() => {
        return clientErrors.filter(e => !e.resolved).length;
    }, [clientErrors]);

    const SEGMENT_COLORS = [
        'var(--primary-color)', 'var(--secondary-color)', 'var(--accent-color)',
        '#ee7c4f', '#7a5af8', '#e8517d',
        '#0891b2', '#dc2626', '#16a34a', '#9333ea'
    ];

    const renderSegmentedBar = (data, label) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) {
            return (
                <div className="segmented-bar-row">
                    <div className="segmented-bar-label">{label}</div>
                    <div className="segmented-bar-track">
                        <div className="segmented-bar-empty">No data</div>
                    </div>
                </div>
            );
        }
        return (
            <div className="segmented-bar-row">
                <div className="segmented-bar-label">{label}</div>
                <div className="segmented-bar-track">
                    {data.map((item, index) => {
                        const pct = (item.value / total) * 100;
                        if (pct < 1) return null;
                        return (
                            <div
                                key={item.name}
                                className="segmented-bar-segment"
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length]
                                }}
                                title={`${item.name}: ${item.value} (${pct.toFixed(1)}%)`}
                            >
                                {pct > 8 && (
                                    <span className="segment-text">
                                        {item.name}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="segmented-bar-legend">
                    {data.map((item, index) => (
                        <div key={item.name} className="segmented-legend-item">
                            <span
                                className="segmented-legend-dot"
                                style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                            ></span>
                            <span className="segmented-legend-name">{item.name}</span>
                            <span className="segmented-legend-value">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const summaryCards = useMemo(() => ([
        {
            label: 'Total Books',
            value: stats.totalBooks,
            accentClass: 'accent-secondary',
            iconClass: 'icon-secondary',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            )
        },
        {
            label: 'Questions',
            value: stats.totalQuestions,
            accentClass: 'accent-primary',
            iconClass: 'icon-primary',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            )
        },
        {
            label: 'Solutions',
            value: stats.totalProgrammingSolutions,
            accentClass: 'accent-secondary',
            iconClass: 'icon-secondary',
            icon: (
                <span className="material-symbols-outlined">
                    code_xml
                </span>
            )
        }
    ]), [stats]);

    if (loading) {
        return <Loader text="Loading Dashboard..." size={150} />;
    }

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-content-wrapper">
                <div className="dashboard-hero">
                    <div className="dashboard-hero-copy">
                        <span className="dashboard-eyebrow">Admin dashboard</span>
                        <h1 className="dashboard-title">Track growth, activity, and category mix at a glance.</h1>
                    </div>
                </div>

                <div className="dashboard-stats-grid">
                    {summaryCards.map((card) => (
                        <div key={card.label} className={`stats-card ${card.accentClass}`}>
                            <div className={`stats-icon-wrapper ${card.iconClass}`}>
                                {card.icon}
                            </div>
                            <div className="stats-label">{card.label}</div>
                            <div className="stats-value">{card.value}</div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-chart-stack">
                    {/* Segmented distribution bars */}
                    <section className="chart-container segmented-bars-section">
                        <div className="chart-header">
                            <div>
                                <span className="chart-kicker">Distribution</span>
                                <h4 className="chart-title">Content Breakdown</h4>
                            </div>
                        </div>
                        <div className="segmented-bars-wrapper">
                            {renderSegmentedBar(stats.genreData, 'Books')}
                            {renderSegmentedBar(stats.questionsData, 'Questions')}
                            {renderSegmentedBar(stats.programmingData, 'Solutions')}
                        </div>
                    </section>

                    {/* Error Log Section */}
                    <section className="chart-container error-log-section">
                        <div className="chart-header error-log-header">
                            <div>
                                <div className="error-title-wrapper">
                                    <span className="chart-kicker error-kicker">Error Monitor</span>
                                    {unresolvedCount > 0 && (
                                        <span className="error-unresolved-badge">
                                            {unresolvedCount} Unresolved
                                        </span>
                                    )}
                                </div>
                                <h4 className="chart-title">Client Error Logs</h4>
                            </div>

                            <div className="error-filter-pills">
                                <button
                                    className={`filter-btn ${errorFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setErrorFilter('all')}
                                >
                                    All ({clientErrors.length})
                                </button>
                                <button
                                    className={`filter-btn ${errorFilter === 'unresolved' ? 'active' : ''}`}
                                    onClick={() => setErrorFilter('unresolved')}
                                >
                                    Unresolved ({unresolvedCount})
                                </button>
                                <button
                                    className={`filter-btn ${errorFilter === 'resolved' ? 'active' : ''}`}
                                    onClick={() => setErrorFilter('resolved')}
                                >
                                    Resolved ({clientErrors.length - unresolvedCount})
                                </button>
                            </div>
                        </div>

                        {loadingErrors ? (
                            <div className="error-log-loading">Loading error logs...</div>
                        ) : filteredErrors.length === 0 ? (
                            <div className="error-log-empty">
                                <p>No {errorFilter !== 'all' ? errorFilter : ''} client errors recorded.</p>
                            </div>
                        ) : (
                            <div className="error-list-wrapper">
                                {filteredErrors.map((err) => {
                                    const isExpanded = expandedErrorId === err.id;
                                    return (
                                        <div key={err.id} className={`error-item-card ${err.resolved ? 'is-resolved' : 'is-unresolved'}`}>
                                            <div className="error-item-main">
                                                <div className="error-meta">
                                                    <span className="error-date-badge">{err.date}</span>
                                                    <span className={`error-type-badge ${err.type || 'error'}`}>{err.type || 'Error'}</span>
                                                </div>

                                                <div className="error-message-box">
                                                    <div className="error-message-text">{err.message}</div>
                                                    {err.url && (
                                                        <div className="error-url-text">
                                                            <span>URL:</span> {err.url}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="error-actions-group">
                                                    <button
                                                        className={`resolve-toggle-btn ${err.resolved ? 'btn-resolved' : 'btn-unresolved'}`}
                                                        onClick={() => handleToggleResolved(err.id, err.resolved)}
                                                    >
                                                        {err.resolved ? '✓ Resolved' : 'Mark Resolved'}
                                                    </button>

                                                    {(err.stack || err.componentStack) && (
                                                        <button
                                                            className="details-toggle-btn"
                                                            onClick={() => toggleExpandError(err.id)}
                                                        >
                                                            {isExpanded ? 'Hide Details' : 'View Stack'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="error-details-drawer">
                                                    {err.userEmail && err.userEmail !== 'anonymous' && (
                                                        <div className="error-detail-field">
                                                            <strong>User:</strong> {err.userEmail} ({err.userId})
                                                        </div>
                                                    )}
                                                    {err.userAgent && (
                                                        <div className="error-detail-field">
                                                            <strong>User Agent:</strong> {err.userAgent}
                                                        </div>
                                                    )}
                                                    {err.stack && (
                                                        <div className="error-stack-block">
                                                            <div className="stack-title">Stack Trace:</div>
                                                            <pre>{err.stack}</pre>
                                                        </div>
                                                    )}
                                                    {err.componentStack && (
                                                        <div className="error-stack-block">
                                                            <div className="stack-title">Component Stack:</div>
                                                            <pre>{err.componentStack}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

