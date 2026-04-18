import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchAnalyticsData } from '../services/AnalyticsService';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import Loader from '../components/Loader';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalUsers: 0,
        totalVisits: 0,
        genreData: [],
        trafficData: []
    });
    const [loading, setLoading] = useState(true);
    const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 300 });
    const [isMobile, setIsMobile] = useState(false);

    const chartContainerRef = useRef(null);

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
            setIsMobile(window.innerWidth <= 768);
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

    const COLORS = ['#3159b8', '#1fa97a', '#f0b429', '#ee7c4f', '#7a5af8', '#e8517d'];

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
            label: 'Revenue',
            value: '$0.00',
            accentClass: 'accent-purple',
            iconClass: 'icon-purple',
            trendValue: 'Coming Soon',
            trendLabel: 'planned metric',
            trendTone: 'muted',
            icon: (
                <>
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
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
                        <p className="dashboard-subtitle">
                            A cleaner view of your library health, recent traffic, and where users are spending attention.
                        </p>
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

                <div className="dashboard-chart-grid">
                    <section className="chart-container chart-container-wide" ref={chartContainerRef}>
                        <div className="chart-header">
                            <div>
                                <span className="chart-kicker">Traffic</span>
                                <h4 className="chart-title">Website Traffic</h4>
                            </div>
                            <span className="chart-subtitle">Last 7 days</span>
                        </div>

                        {chartDimensions.width > 0 && (
                            <div className="chart-canvas traffic-chart">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={stats.trafficData}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4b6cb7" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4b6cb7" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#75839a' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#75839a' }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid rgba(148, 163, 184, 0.18)',
                                                boxShadow: '0 12px 30px rgba(15,23,42,0.12)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="visits"
                                            stroke="#4b6cb7"
                                            fillOpacity={1}
                                            fill="url(#colorVisits)"
                                            strokeWidth={3}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>

                    <section className="chart-container chart-container-side">
                        <div className="chart-header">
                            <div>
                                <span className="chart-kicker">Distribution</span>
                                <h4 className="chart-title">Books per Category</h4>
                            </div>
                        </div>

                        {chartDimensions.width > 0 && (
                            <div className="chart-canvas pie-chart-canvas">
                                <ResponsiveContainer width="100%" height={380}>
                                    <PieChart>
                                        <Pie
                                            data={stats.genreData}
                                            innerRadius={isMobile ? 46 : 88}
                                            outerRadius={isMobile ? 76 : 126}
                                            paddingAngle={4}
                                            dataKey="value"
                                            cx="50%"
                                            cy="45%"
                                        >
                                            {stats.genreData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            layout="horizontal"
                                            iconType="circle"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
