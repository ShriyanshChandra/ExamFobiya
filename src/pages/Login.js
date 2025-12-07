import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const LoginBox = ({ role, title, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(role, username, password);
    };

    return (
        <div className="login-card">
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                    />
                </div>
                <button type="submit" className="login-btn">Login as {role === 'admin' ? 'Admin' : 'User'}</button>
            </form>
        </div>
    );
};

const Login = () => {
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (role, username, password) => {
        setError('');
        let isValid = false;

        const adminUser = process.env.REACT_APP_ADMIN_USERNAME;
        const adminPass = process.env.REACT_APP_ADMIN_PASSWORD;
        const userUser = process.env.REACT_APP_USER_USERNAME;
        const userPass = process.env.REACT_APP_USER_PASSWORD;

        // Validation Logic using Environment Variables
        if (role === 'admin' && username === adminUser && password === adminPass) {
            isValid = true;
        } else if (role === 'user' && username === userUser && password === userPass) {
            isValid = true;
        }

        if (isValid) {
            login(role);
            // Redirect based on role
            if (role === 'admin') navigate('/admin');
            else navigate('/');
        } else {
            setError(`Invalid ${role} credentials`);
        }
    };

    return (
        <div className="login-container">
            {error && <div className="global-error-message">{error}</div>}
            <div className="login-boxes-wrapper">
                <LoginBox role="admin" title="Admin Login" onLogin={handleLogin} />
                <LoginBox role="user" title="User Login" onLogin={handleLogin} />
            </div>
        </div>
    );
};

export default Login;
