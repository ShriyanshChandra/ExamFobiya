import React from 'react';

const DevDashboard = () => {
    return (
        <div className="container mt-5 text-center text-white">
            <h1>Developer Dashboard</h1>
            <p className="lead">Welcome, Developer. You have access to debugging tools and logs.</p>
            <div className="card text-dark mt-4 p-4" style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(255,255,255,0.9)' }}>
                <h3>System Diagnostics</h3>
                <p>API status: Online</p>
                <p>Database latency: 24ms</p>
            </div>
        </div>
    );
};

export default DevDashboard;
