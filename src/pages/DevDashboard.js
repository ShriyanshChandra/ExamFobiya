import React, { useState } from 'react';
import { useBooks } from '../context/BookContext';

const DevDashboard = () => {
    const { removePriceFromAllBooks, books } = useBooks();
    const [migrationStatus, setMigrationStatus] = useState('');
    const [running, setRunning] = useState(false);

    const handleRemovePrice = async () => {
        if (!window.confirm(`This will permanently delete the "price" field from all ${books.length} book(s) in Firestore. Continue?`)) return;
        setRunning(true);
        setMigrationStatus('Running...');
        try {
            const count = await removePriceFromAllBooks();
            setMigrationStatus(`✅ Done! Removed price from ${count} book(s).`);
        } catch (err) {
            setMigrationStatus(`❌ Error: ${err.message}`);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="container mt-5 text-center text-white">
            <h1>Developer Dashboard</h1>
            <p className="lead">Welcome, Developer. You have access to debugging tools and logs.</p>
            <div className="card text-dark mt-4 p-4" style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(255,255,255,0.9)' }}>
                <h3>System Diagnostics</h3>
                <p>API status: Online</p>
                <p>Database latency: 24ms</p>
            </div>

            <div className="card text-dark mt-4 p-4" style={{ maxWidth: '500px', margin: '20px auto', background: 'rgba(255,255,255,0.9)' }}>
                <h3>Database Migrations</h3>
                <p style={{ fontSize: '14px', color: '#555' }}>
                    One-time operations to clean up the Firestore database.
                </p>
                <button
                    onClick={handleRemovePrice}
                    disabled={running}
                    style={{
                        backgroundColor: running ? '#ccc' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: running ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        marginTop: '10px'
                    }}
                >
                    {running ? 'Running...' : '🗑 Remove Price Field from All Books'}
                </button>
                {migrationStatus && (
                    <p style={{ marginTop: '12px', fontWeight: 'bold', color: migrationStatus.startsWith('✅') ? 'green' : 'red' }}>
                        {migrationStatus}
                    </p>
                )}
            </div>
        </div>
    );
};

export default DevDashboard;
