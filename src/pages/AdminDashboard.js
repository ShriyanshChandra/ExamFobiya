import React, { useEffect, useState } from 'react';
import { fetchAnalyticsData } from '../services/AnalyticsService';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
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

    useEffect(() => {
        const loadStats = async () => {
            const data = await fetchAnalyticsData();
            setStats(data);
            setLoading(false);
        };
        loadStats();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

    if (loading) {
        return <div className="text-center mt-5" style={{ color: '#333' }}><h3>Loading Dashboard...</h3></div>;
    }

    return (
        <div className="admin-dashboard-container">
            <h1 className="dashboard-title">Dashboard Overview</h1>

            {/* Stats Components - Top Section */}
            <div className="row mb-5">
                <div className="col-6 mb-4">
                    <div className="stats-card">
                        <div className="stats-icon-wrapper icon-blue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div className="stats-label">Total Users</div>
                        <div className="stats-value">{stats.totalUsers}</div>
                        <div className="stats-trend"><span>↗ 12%</span> <span className="text-muted small">vs last week</span></div>
                    </div>
                </div>

                <div className="col-6 mb-4">
                    <div className="stats-card">
                        <div className="stats-icon-wrapper icon-green">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                        </div>
                        <div className="stats-label">Total Books</div>
                        <div className="stats-value">{stats.totalBooks}</div>
                        <div className="stats-trend"><span>+ {stats.totalBooks}</span> <span className="text-muted small">New added</span></div>
                    </div>
                </div>

                <div className="col-6 mb-4">
                    <div className="stats-card">
                        <div className="stats-icon-wrapper icon-orange">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </div>
                        <div className="stats-label">Total Visits</div>
                        <div className="stats-value">{stats.totalVisits}</div>
                        <div className="stats-trend"><span>↗ 5.3%</span> <span className="text-muted small">vs last week</span></div>
                    </div>
                </div>

                <div className="col-6 mb-4">
                    <div className="stats-card">
                        <div className="stats-icon-wrapper icon-purple">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                        <div className="stats-label">Revenue</div>
                        <div className="stats-value">$0.00</div>
                        <div className="stats-trend"><span className="text-muted small">Coming Soon</span></div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Main Content Area (Charts) */}
                <div className="col-md-8">
                    {/* Traffic Chart */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h4 className="chart-title">Website Traffic</h4>
                            <span className="chart-subtitle">Last 7 Days</span>
                        </div>
                        <div style={{ width: '100%', height: 300, minWidth: 200, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%" debounce={200}>
                                <AreaChart data={stats.trafficData}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Categories Chart */}
                <div className="col-md-4">
                    <div className="chart-container">
                        <div className="chart-header">
                            <h4 className="chart-title">Books per Category</h4>
                        </div>
                        <div style={{ width: '100%', height: 300, minWidth: 200, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%" debounce={200}>
                                <PieChart>
                                    <Pie
                                        data={stats.genreData}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.genreData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
