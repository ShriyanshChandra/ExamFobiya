import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchAnalyticsData } from '../services/AnalyticsService';
import {
    ResponsiveContainer, Tooltip,
    XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalUsers: 0,
        totalVisits: 0,
        genreData: [],
        trafficData: [],
        totalQuestions: 0,
        questionsData: [],
        totalProgrammingSolutions: 0,
        programmingData: []
    });
    const [loading, setLoading] = useState(true);
    const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 300 });
    const { theme } = useTheme();

    const chartContainerRef = useRef(null);

    const isDarkChart = theme === 'dark' || theme === 'midnight';

    const gridColor = isDarkChart ? 'rgba(255,255,255,0.08)' : '#dbe4f0';
    const tickColor = isDarkChart ? '#94a3b8' : '#75839a';
    const tooltipStyle = {
        borderRadius: '12px',
        background: isDarkChart ? '#0a0a14' : '#ffffff',
        color: isDarkChart ? '#e2e8f0' : '#333',
        border: isDarkChart ? '1px solid rgba(129,140,248,0.15)' : '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: isDarkChart ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(15,23,42,0.12)'
    };
    const tooltipItemStyle = { color: isDarkChart ? '#e2e8f0' : '#333' };
    const tooltipLabelStyle = { color: isDarkChart ? '#f1f5f9' : '#1a2745' };

    useEffect(() => {
        const loadStats = async () => {
            const data = await fetchAnalyticsData();
            setStats(data);
            setLoading(false);
        };

        loadStats();
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            if (chartContainerRef.current) {
                const width = chartContainerRef.current.offsetWidth;
                setChartDimensions({ width: width > 0 ? width : 300, height: 300 });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateDimensions);
            resizeObserver.disconnect();
        };
    }, [loading]);

    const SEGMENT_COLORS = [
        '#3159b8', '#1fa97a', '#f0b429', '#ee7c4f', '#7a5af8', '#e8517d',
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
                                        {item.name} ({item.value})
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
            label: 'Total Users',
            value: stats.totalUsers,
            accentClass: 'accent-blue',
            iconClass: 'icon-blue',
            trendValue: `${stats.userGrowthPercentage > 0 ? '↗' : '↘'} ${stats.userGrowthPercentage || 0}%`,
            trendLabel: 'vs last week',
            trendTone: stats.userGrowthPercentage >= 0 ? 'positive' : 'negative',
            icon: (
                <>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </>
            )
        },
        {
            label: 'Total Books',
            value: stats.totalBooks,
            accentClass: 'accent-green',
            iconClass: 'icon-green',
            trendValue: `+ ${stats.newBooksCount || 0}`,
            trendLabel: 'new added',
            trendTone: 'neutral',
            icon: (
                <>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </>
            )
        },
        {
            label: 'Total Visits',
            value: stats.totalVisits,
            accentClass: 'accent-orange',
            iconClass: 'icon-orange',
            trendValue: `${stats.visitGrowthPercentage > 0 ? '↗' : '↘'} ${stats.visitGrowthPercentage || 0}%`,
            trendLabel: 'vs last week',
            trendTone: stats.visitGrowthPercentage >= 0 ? 'positive' : 'negative',
            icon: (
                <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </>
            )
        },
        {
            label: 'Questions',
            value: stats.totalQuestions,
            accentClass: 'accent-purple',
            iconClass: 'icon-purple',
            trendValue: `${stats.totalProgrammingSolutions} solutions`,
            trendLabel: 'programming',
            trendTone: 'neutral',
            icon: (
                <>
                    <path d="M9 12h6"></path>
                    <path d="M12 9v6"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                </>
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {card.icon}
                                </svg>
                            </div>
                            <div className="stats-label">{card.label}</div>
                            <div className="stats-value">{card.value}</div>
                            <div className={`stats-trend ${card.trendTone}`}>
                                <span>{card.trendValue}</span>
                                <span className="text-muted small">{card.trendLabel}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-chart-stack">
                    <section className="chart-container chart-container-full" ref={chartContainerRef}>
                        <div className="chart-header">
                            <div>
                                <span className="chart-kicker">Traffic</span>
                                <h4 className="chart-title">Website Traffic</h4>
                            </div>
                        </div>

                        {chartDimensions.width > 0 && (
                            <div className="chart-canvas traffic-chart">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={stats.trafficData}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor }} />
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            itemStyle={tooltipItemStyle}
                                            labelStyle={tooltipLabelStyle}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="visits"
                                            stroke="var(--primary-color)"
                                            fillOpacity={1}
                                            fill="url(#colorVisits)"
                                            strokeWidth={3}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>

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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
