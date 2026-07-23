import React, { useEffect, useMemo, useState } from 'react';
import { fetchAnalyticsData, fetchApiKeysStatus, triggerApiKeyPing } from '../services/AnalyticsService';
import { fetchRecentClientErrors, toggleErrorResolved } from '../services/ErrorLoggerService';
import Loader from '../components/Loader';
import ConfirmationModal from '../components/ConfirmationModal';
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
    const [errorView, setErrorView] = useState('active'); // 'active' (unresolved) or 'history' (resolved)
    const [confirmResolveTarget, setConfirmResolveTarget] = useState(null);
    const [loading, setLoading] = useState(true);

    const [apiKeysData, setApiKeysData] = useState({ lastPingFormatted: 'Never', keys: [] });
    const [loadingApiKeys, setLoadingApiKeys] = useState(true);
    const [pingingKeyId, setPingingKeyId] = useState(null);
    const [pingFeedback, setPingFeedback] = useState(null);

    const loadApiKeysStatus = async () => {
        try {
            const data = await fetchApiKeysStatus();
            setApiKeysData(data);
        } catch (err) {
            console.error("Failed to load API keys status:", err);
        } finally {
            setLoadingApiKeys(false);
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            const data = await fetchAnalyticsData();
            setStats(data);
            setLoading(false);
            loadApiKeysStatus();

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

    const handlePingKey = async (targetId) => {
        setPingingKeyId(targetId);
        setPingFeedback(null);
        try {
            const res = await triggerApiKeyPing(targetId);
            const statusRecord = res.result || {};
            const brevo = statusRecord.brevoStatus;
            const gemini = statusRecord.geminiStatus;

            let failedKeys = [];
            if ((targetId === 'all' || targetId === 'brevo') && brevo && !brevo.success) {
                failedKeys.push(`Brevo: ${brevo.error || brevo.reason || 'Failed'}`);
            }
            if ((targetId === 'all' || targetId === 'gemini') && gemini && !gemini.success) {
                failedKeys.push(`Gemini: ${gemini.error || gemini.reason || 'Failed'}`);
            }

            if (failedKeys.length > 0) {
                setPingFeedback({
                    type: 'error',
                    message: `Ping issue: ${failedKeys.join(' | ')}`
                });
            } else {
                setPingFeedback({
                    type: 'success',
                    message: targetId === 'all' ? 'All API key pings completed successfully.' : 'API key ping completed successfully.'
                });
            }
            await loadApiKeysStatus();
        } catch (err) {
            console.error("Failed to ping API key:", err);
            setPingFeedback({
                type: 'error',
                message: err.message || 'Failed to ping API key.'
            });
        } finally {
            setPingingKeyId(null);
            setTimeout(() => setPingFeedback(null), 8000);
        }
    };



    const onRequestToggleResolved = (err) => {
        setConfirmResolveTarget({
            id: err.id,
            currentResolved: err.resolved,
            message: err.message
        });
    };

    const handleConfirmToggleResolved = async () => {
        if (!confirmResolveTarget) return;
        const { id: errorId, currentResolved } = confirmResolveTarget;
        setConfirmResolveTarget(null);

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

    const unresolvedCount = useMemo(() => {
        return clientErrors.filter(e => !e.resolved).length;
    }, [clientErrors]);

    const resolvedCount = useMemo(() => {
        return clientErrors.filter(e => e.resolved).length;
    }, [clientErrors]);

    const displayedErrors = useMemo(() => {
        if (errorView === 'history') {
            return clientErrors.filter(e => e.resolved);
        }
        return clientErrors.filter(e => !e.resolved);
    }, [clientErrors, errorView]);

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
            label: 'Programming Solutions',
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
        return <Loader text="Loading Dashboard..." size={150} fullScreen />;
    }

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-content-wrapper container">
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
                            {renderSegmentedBar(stats.programmingData, 'Programming Solutions')}
                        </div>
                    </section>

                    {/* API Key Health & Status Section */}
                    <section className="chart-container api-keys-section">
                        <div className="chart-header api-keys-header">
                            <div>
                                <span className="chart-kicker api-kicker">Security & Infrastructure</span>
                                <h4 className="chart-title">API Keys Health & Auto-Keepalive</h4>
                            </div>
                            <button
                                className="ping-all-btn"
                                disabled={pingingKeyId !== null}
                                onClick={() => handlePingKey('all')}
                            >
                                {pingingKeyId === 'all' ? 'Testing All Keys...' : 'Ping All API Keys'}
                            </button>
                        </div>

                        {pingFeedback && (
                            <div className={`ping-feedback-banner ${pingFeedback.type}`}>
                                {pingFeedback.message}
                            </div>
                        )}

                        {loadingApiKeys ? (
                            <div className="api-keys-loading">Loading API Key statuses...</div>
                        ) : apiKeysData.keys.length === 0 ? (
                            <div className="api-keys-empty">No API keys registered.</div>
                        ) : (
                            <div className="api-keys-grid">
                                {apiKeysData.keys.map((keyItem) => {
                                    const isPinging = pingingKeyId === keyItem.id || pingingKeyId === 'all';
                                    const isLive = keyItem.status === 'active';
                                    const isError = keyItem.status === 'error';
                                    const isUnconfigured = keyItem.status === 'unconfigured';

                                    return (
                                        <div key={keyItem.id} className={`api-key-card status-${keyItem.status}`}>
                                            <div className="api-key-card-header">
                                                <div className="api-key-info">
                                                    <h5 className="api-key-name">{keyItem.name}</h5>
                                                    <span className="api-key-env">Env: {keyItem.envVar}</span>
                                                </div>
                                                <div className={`api-status-badge status-${keyItem.status}`}>
                                                    <span className="status-dot"></span>
                                                    <span className="status-label">
                                                        {isLive ? 'Live & Active' : isError ? 'Error / Inactive' : isUnconfigured ? 'Unconfigured' : 'Untested'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="api-key-details">
                                                <div className="api-detail-row">
                                                    <span className="detail-label">Masked Key:</span>
                                                    <code className="detail-value key-code">{keyItem.maskedKey}</code>
                                                </div>
                                                <div className="api-detail-row">
                                                    <span className="detail-label">Last Checked:</span>
                                                    <span className="detail-value">{keyItem.lastChecked}</span>
                                                </div>
                                                {keyItem.lastError && (
                                                    <div className="api-detail-row error-msg-row">
                                                        <span className="detail-label">Last Error:</span>
                                                        <span className="detail-value error-text">{keyItem.lastError}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="api-key-actions">
                                                <button
                                                    className="test-ping-btn"
                                                    disabled={isPinging || isUnconfigured}
                                                    onClick={() => handlePingKey(keyItem.id)}
                                                >
                                                    {isPinging ? 'Testing...' : 'Test & Ping Key'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Error Log Section */}

                    <section className="chart-container error-log-section">
                        <div className="chart-header error-log-header">
                            <div>
                                <div className="error-title-wrapper">
                                    <span className="chart-kicker error-kicker">Error Monitor</span>
                                    {unresolvedCount > 0 && (
                                        <span className="error-unresolved-badge">
                                            {unresolvedCount} Active
                                        </span>
                                    )}
                                </div>
                                <h4 className="chart-title">Client Error Logs</h4>
                            </div>

                            <div className="error-filter-pills">
                                <button
                                    className={`filter-btn ${errorView === 'active' ? 'active' : ''}`}
                                    onClick={() => setErrorView('active')}
                                >
                                    Active Errors ({unresolvedCount})
                                </button>
                                <button
                                    className={`filter-btn ${errorView === 'history' ? 'active' : ''}`}
                                    onClick={() => setErrorView('history')}
                                >
                                    History ({resolvedCount})
                                </button>
                            </div>
                        </div>

                        {loadingErrors ? (
                            <div className="error-log-loading">Loading error logs...</div>
                        ) : displayedErrors.length === 0 ? (
                            <div className="error-log-empty">
                                <p>{errorView === 'history' ? 'No resolved error history available.' : 'No active client errors recorded.'}</p>
                            </div>
                        ) : (
                            <div className="error-list-wrapper">
                                {displayedErrors.map((err) => {
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
                                                        onClick={() => onRequestToggleResolved(err)}
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

            <ConfirmationModal
                isOpen={!!confirmResolveTarget}
                onClose={() => setConfirmResolveTarget(null)}
                onConfirm={handleConfirmToggleResolved}
                title={confirmResolveTarget?.currentResolved ? 'Reopen Error Log' : 'Mark Error as Resolved'}
                message={
                    confirmResolveTarget?.currentResolved
                        ? 'Are you sure you want to move this error back to active errors?'
                        : 'Are you sure you want to mark this error as resolved? It will be moved to History.'
                }
                variant={confirmResolveTarget?.currentResolved ? 'yellow' : 'approve'}
                confirmLabel={confirmResolveTarget?.currentResolved ? 'Yes, Reopen' : 'Yes, Mark Resolved'}
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default AdminDashboard;

