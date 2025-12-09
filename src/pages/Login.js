import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const LoginBox = ({ role, title, onAuth, allowRegister = true }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAuth(role, email, password, isRegistering);
    };

    return (
        <div className="login-card">
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
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
                <button type="submit" className="login-btn">
                    {isRegistering ? 'Create Account' : 'Login'}
                </button>
            </form>

            {allowRegister && (
                <p className="toggle-auth">
                    Need an account? <Link to="/register" style={{ color: '#007bff' }}>Register</Link>
                </p>
            )}
        </div>
    );
};

const Login = () => {
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async (role, email, password, isRegistering) => {
        setError('');
        try {
            if (isRegistering) {
                // Register
                const username = email.split('@')[0];
                await register(email, password, role, username);
                // Redirect after registration
                if (role === 'admin') navigate('/admin');
                else navigate('/');
            } else {
                // Login
                await login(email, password);
                // Redirect logic could be improved by checking actual user role, 
                // but for now we trust the user's flow or let the protected route handle it.
                if (role === 'admin') navigate('/admin');
                else navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="login-container">
            {error && <div className="global-error-message">{error}</div>}
            <div className="login-boxes-wrapper">
                <LoginBox role="admin" title="Admin Portal" onAuth={handleAuth} allowRegister={false} />
                <LoginBox role="user" title="User Portal" onAuth={handleAuth} allowRegister={true} />
            </div>
        </div>
    );
};

export default Login;
