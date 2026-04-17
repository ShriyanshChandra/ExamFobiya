import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import './Login.css';

const LoginBox = ({ role, title, onAuth, allowRegister = true, checkAccountExists }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot Password State
    const [step, setStep] = useState('login'); // 'login' | 'email' | 'otp' | 'new-password'
    const [resetEmail, setResetEmail] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) {
            return undefined;
        }

        const timer = setInterval(() => {
            setResendTimer((current) => {
                if (current <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimer]);

    const formatResendTimer = (seconds) => {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
        const remainingSeconds = String(seconds % 60).padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    };

    const sendResetOtp = async (userEmail) => {
        const accountExists = await checkAccountExists(userEmail);

        if (!accountExists) {
            throw new Error('Account does not exist in the database. Please register first.');
        }

        if (role === 'admin') {
            const checkResponse = await fetch(getApiUrl('/api/check-admin'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });

            if (!checkResponse.ok) {
                const errorData = await checkResponse.json();
                throw new Error(errorData.error || 'Account checking failed.');
            }
        }

        const response = await fetch(getApiUrl('/send-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, purpose: 'reset-password' }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send OTP');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAuth(role, email, password, false);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            await sendResetOtp(resetEmail);
            // Backend stored the OTP. We just move to next step.
            setResendTimer(120);
            setStep('otp');
        } catch (err) {
            console.error(err);
            setLocalError(err.message || "Failed to send verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setLocalError('');
        if (enteredOtp.length !== 6) {
            return setLocalError("Please enter a valid 6-digit OTP.");
        }
        // Proceed to password input. Final validation happens securely on the backend.
        setStep('new-password');
    };

    const handleResendOtp = async () => {
        setLocalError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            await sendResetOtp(resetEmail);
            setResendTimer(120);
        } catch (err) {
            console.error(err);
            setLocalError(err.message || "Failed to resend verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSuccessMsg('');
        
        if (newPassword !== confirmPassword) {
            return setLocalError("Passwords do not match");
        }
        if (newPassword.length < 6) {
            return setLocalError("Password should be at least 6 characters");
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl('/api/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, otp: enteredOtp, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reset password');
            }

            setSuccessMsg("Password reset successfully! You can now login.");
            setStep('login');
            setResetEmail('');
            setEnteredOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setResendTimer(0);
        } catch (err) {
            console.error(err);
            setLocalError(err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-card">
            <h2>{step === 'login' ? title : "Forgot Password"}</h2>
            
            {localError && <div className="register-error-message" style={{color: 'red', marginBottom: '10px'}}>{localError}</div>}
            {successMsg && <div className="success-message" style={{color: 'green', marginBottom: '10px'}}>{successMsg}</div>}

            {step === 'login' && (
                <>
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
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id={`show-pass-login-${role}`}
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor={`show-pass-login-${role}`}>Show Password</label>
                        </div>
                        <button type="submit" className="login-btn">
                            Login
                        </button>
                    </form>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                        <button type="button" onClick={() => setStep('email')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0, fontSize: '15px', fontWeight: '500' }}>
                            Forgot Password?
                        </button>
                    </div>
                    {allowRegister && (
                        <p className="toggle-auth">
                            Need an account? <Link to="/register" style={{ color: '#007bff' }}>Register</Link>
                        </p>
                    )}
                </>
            )}

            {step === 'email' && (
                <form onSubmit={handleSendOtp}>
                    <p style={{marginBottom: '15px', color: '#555', fontSize: '0.9rem'}}>Enter your email address and we'll send you a verification code to reset your password.</p>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                    <button type="button" onClick={() => { setStep('login'); setLocalError(''); }} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', width: '100%', marginTop: '10px' }}>
                        Cancel
                    </button>
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                    <p style={{marginBottom: '15px', color: '#555', fontSize: '0.9rem'}}>We've sent a 6-digit code to <strong>{resetEmail}</strong>. Enter it below.</p>
                    <div className="form-group">
                        <label>OTP Code:</label>
                        <input
                            type="text"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            placeholder="123456"
                            maxLength="6"
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn">
                        Verify Code
                    </button>
                    <p style={{ marginTop: '12px', marginBottom: '0', textAlign: 'center', color: '#555', fontSize: '0.9rem' }}>
                        {resendTimer > 0
                            ? `Resend available in ${formatResendTimer(resendTimer)}`
                            : 'Didn’t receive the code?'}
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading || resendTimer > 0}
                        style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#999' : '#007bff', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', width: '100%', marginTop: '10px', fontWeight: '500' }}
                    >
                        {loading && resendTimer === 0 ? 'Sending...' : 'Resend Code'}
                    </button>
                    <button type="button" onClick={() => { setStep('email'); setLocalError(''); }} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', width: '100%', marginTop: '10px' }}>
                        Back
                    </button>
                </form>
            )}

            {step === 'new-password' && (
                <form onSubmit={handleResetPassword}>
                    <p style={{marginBottom: '15px', color: '#555', fontSize: '0.9rem'}}>Create a new password for your account.</p>
                    <div className="form-group">
                        <label>New Password:</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id={`show-pass-reset-${role}`}
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <label htmlFor={`show-pass-reset-${role}`}>Show Password</label>
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <button type="button" onClick={() => { setStep('login'); setLocalError(''); setShowPassword(false); }} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', width: '100%', marginTop: '10px' }}>
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
};

const Login = () => {
    const [error, setError] = useState('');
    const { login, register, checkAccountExists } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async (role, email, password, isRegistering) => {
        setError('');
        try {
            if (isRegistering) {
                // Register
                const username = email.split('@')[0];
                await register(email, password, role, username);
                // Redirect after registration
                if (role === 'admin') navigate('/welcome');
                else navigate('/welcome');
            } else {
                // Login
                await login(email, password);
                // Redirect logic could be improved by checking actual user role, 
                // but for now we trust the user's flow or let the protected route handle it.
                if (role === 'admin') navigate('/welcome');
                else navigate('/welcome');
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
                <LoginBox role="admin" title="Admin Portal" onAuth={handleAuth} allowRegister={false} checkAccountExists={checkAccountExists} />
                <LoginBox role="user" title="User Portal" onAuth={handleAuth} allowRegister={true} checkAccountExists={checkAccountExists} />
            </div>
        </div>
    );
};

export default Login;
