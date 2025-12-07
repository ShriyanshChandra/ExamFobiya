import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="container mt-5 text-center text-white">
            <h1>Admin Dashboard</h1>
            <p className="lead">Welcome, Admin. You have access to administrative settings.</p>
            <div className="card text-dark mt-4 p-4" style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(255,255,255,0.9)' }}>
                <h3>Manage System</h3>
                <p>User stats and system logs will appear here.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
