import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import useSEO from '../utils/useSEO';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Login.css';

const LoginBox = ({ role, title, onAuth, onGoogleLogin, allowRegister = true, checkAccountExists, onSwitchToRegister, onForgotPassword }) => {
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
    const [googleLoading, setGoogleLoading] = useState(false);
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
        <div className="login-card container">
            <h2>{step === 'login' ? title : "Forgot Password"}</h2>
            
            {localError && <div className="register-error-message" style={{color: 'red', marginBottom: '10px'}}>{localError}</div>}
            {successMsg && <div className="success-message" style={{color: 'green', marginBottom: '10px'}}>{successMsg}</div>}

            {step === 'login' && (
                <>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor={`login-email-${role}`}>Email:</label>
                            <input
                                id={`login-email-${role}`}
                                name="email"
                                autoComplete="username"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`login-password-${role}`}>Password:</label>
                            <input
                                id={`login-password-${role}`}
                                name="password"
                                autoComplete="current-password"
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
                                name="showPassword"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor={`show-pass-login-${role}`}>Show Password</label>
                        </div>
                        <button type="submit" className="login-btn" disabled={loading || googleLoading}>
                            {loading ? 'Signing in...' : 'Login'}
                        </button>
                    </form>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                        <button
                            type="button"
                            onClick={() => {
                                if (onForgotPassword) {
                                    onForgotPassword(role);
                                } else {
                                    setStep('email');
                                }
                            }}
                            className="forgot-pass-btn"
                            disabled={loading || googleLoading}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {role === 'user' && onGoogleLogin && (
                        <>
                            <div className="or-divider">
                                <span>or</span>
                            </div>
                            <button
                                id="google-signin-btn"
                                type="button"
                                className="google-btn"
                                onClick={async () => {
                                    setLocalError('');
                                    setGoogleLoading(true);
                                    try {
                                        await onGoogleLogin();
                                    } catch (err) {
                                        setLocalError(err.message || 'Google sign-in failed. Please try again.');
                                    } finally {
                                        setGoogleLoading(false);
                                    }
                                }}
                                disabled={loading || googleLoading}
                            >
                                {googleLoading ? (
                                    <span className="google-btn-spinner"></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
                                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                                    </svg>
                                )}
                                <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
                            </button>
                        </>
                    )}

                    {allowRegister && (
                        <p className="toggle-auth">
                            Need an account?{' '}
                            {onSwitchToRegister ? (
                                <button type="button" onClick={onSwitchToRegister} className="register-link-btn">
                                    Register
                                </button>
                            ) : (
                                <Link to="/register" className="register-link">Register</Link>
                            )}
                        </p>
                    )}
                </>
            )}

            {step === 'email' && (
                <form onSubmit={handleSendOtp}>
                    <p className="login-subtext">Enter your email address and we'll send you a verification code to reset your password.</p>
                    <div className="form-group">
                        <label htmlFor={`reset-email-${role}`}>Email:</label>
                        <input
                            id={`reset-email-${role}`}
                            name="resetEmail"
                            autoComplete="email"
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
                    <button type="button" onClick={() => { setStep('login'); setLocalError(''); }} className="login-secondary-btn">
                        Cancel
                    </button>
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                    <p className="login-subtext">We've sent a 6-digit code to <strong>{resetEmail}</strong>. Enter it below.</p>
                    <div className="form-group">
                        <label htmlFor={`reset-otp-${role}`}>OTP Code:</label>
                        <input
                            id={`reset-otp-${role}`}
                            name="otp"
                            autoComplete="one-time-code"
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
                    <p className="login-subtext" style={{ marginTop: '12px', marginBottom: '0', textAlign: 'center' }}>
                        {resendTimer > 0
                            ? `Resend available in ${formatResendTimer(resendTimer)}`
                            : "Didn't receive the code?"}
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading || resendTimer > 0}
                        className="resend-code-btn"
                    >
                        {loading && resendTimer === 0 ? 'Sending...' : 'Resend Code'}
                    </button>
                    <button type="button" onClick={() => { setStep('email'); setLocalError(''); }} className="login-secondary-btn">
                        Back
                    </button>
                </form>
            )}

            {step === 'new-password' && (
                <form onSubmit={handleResetPassword}>
                    <p className="login-subtext">Create a new password for your account.</p>
                    <div className="form-group">
                        <label htmlFor={`new-password-${role}`}>New Password:</label>
                        <input
                            id={`new-password-${role}`}
                            name="newPassword"
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor={`confirm-password-${role}`}>Confirm Password:</label>
                        <input
                            id={`confirm-password-${role}`}
                            name="confirmPassword"
                            autoComplete="new-password"
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
                            name="showPasswordReset"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <label htmlFor={`show-pass-reset-${role}`}>Show Password</label>
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <button type="button" onClick={() => { setStep('login'); setLocalError(''); setShowPassword(false); }} className="login-secondary-btn">
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
};

/* ─── Forgot Password Box inside the book ─── */
const ForgotPasswordBox = ({ role, checkAccountExists, onCancel, onSuccess }) => {
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'new-password'
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
        if (resendTimer <= 0) return undefined;
        const timer = setInterval(() => {
            setResendTimer((cur) => {
                if (cur <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return cur - 1;
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

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            await sendResetOtp(resetEmail);
            setResendTimer(120);
            setStep('otp');
        } catch (err) {
            console.error(err);
            setLocalError(err.message || 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setLocalError('');
        if (enteredOtp.length !== 6) {
            return setLocalError('Please enter a valid 6-digit OTP.');
        }
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
            setLocalError(err.message || 'Failed to resend verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSuccessMsg('');

        if (newPassword !== confirmPassword) {
            return setLocalError('Passwords do not match');
        }
        if (newPassword.length < 6) {
            return setLocalError('Password should be at least 6 characters');
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

            setSuccessMsg('Password reset successfully! You can now login.');
            if (onSuccess) {
                onSuccess('Password reset successfully! You can now login.');
            }
        } catch (err) {
            console.error(err);
            setLocalError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-card container">
            <h2>{step === 'new-password' ? 'Create New Password' : step === 'otp' ? 'Verify Code' : 'Forgot Password'}</h2>

            {localError && <div className="register-error-message" role="alert" style={{ color: 'red', marginBottom: '10px' }}>{localError}</div>}
            {successMsg && <div className="success-message" role="status" style={{ color: 'green', marginBottom: '10px' }}>{successMsg}</div>}

            {step === 'email' && (
                <form onSubmit={handleSendOtp}>
                    <p className="login-subtext">Enter your email address and we'll send you a verification code to reset your password.</p>
                    <div className="form-group">
                        <label htmlFor={`forgot-email-${role}`}>Email:</label>
                        <input
                            id={`forgot-email-${role}`}
                            name="resetEmail"
                            autoComplete="email"
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
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="login-secondary-btn back-to-login-btn" style={{ marginTop: '10px', width: '100%' }}>
                            Back to Login
                        </button>
                    )}
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                    <p className="login-subtext">We've sent a 6-digit code to <strong>{resetEmail}</strong>. Enter it below.</p>
                    <div className="form-group">
                        <label htmlFor={`forgot-otp-${role}`}>OTP Code:</label>
                        <input
                            id={`forgot-otp-${role}`}
                            name="otp"
                            autoComplete="one-time-code"
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
                    <p className="login-subtext" style={{ marginTop: '12px', marginBottom: '0', textAlign: 'center' }}>
                        {resendTimer > 0
                            ? `Resend available in ${formatResendTimer(resendTimer)}`
                            : "Didn't receive the code?"}
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading || resendTimer > 0}
                        className="resend-code-btn"
                        style={{ marginTop: '8px', width: '100%' }}
                    >
                        {loading && resendTimer === 0 ? 'Sending...' : 'Resend Code'}
                    </button>
                    <button type="button" onClick={() => { setStep('email'); setLocalError(''); }} className="login-secondary-btn" style={{ marginTop: '10px', width: '100%' }}>
                        Back
                    </button>
                </form>
            )}

            {step === 'new-password' && (
                <form onSubmit={handleResetPassword}>
                    <p className="login-subtext">Create a new password for your account.</p>
                    <div className="form-group">
                        <label htmlFor={`forgot-new-pass-${role}`}>New Password:</label>
                        <input
                            id={`forgot-new-pass-${role}`}
                            name="newPassword"
                            autoComplete="new-password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor={`forgot-confirm-pass-${role}`}>Confirm Password:</label>
                        <input
                            id={`forgot-confirm-pass-${role}`}
                            name="confirmPassword"
                            autoComplete="new-password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id={`forgot-show-pass-${role}`}
                            name="showPasswordReset"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <label htmlFor={`forgot-show-pass-${role}`}>Show Password</label>
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="login-secondary-btn back-to-login-btn" style={{ marginTop: '10px', width: '100%' }}>
                            Back to Login
                        </button>
                    )}
                </form>
            )}
        </div>
    );
};

/* ─── Registration Box inside the book ─── */
const RegisterBox = ({ onSuccess, onSwitchToLogin, checkAccountExists, register }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 2FA / OTP State
    const [step, setStep] = useState('form'); // 'form' | 'verify'
    const [enteredOtp, setEnteredOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) return undefined;
        const timer = setInterval(() => {
            setResendTimer((cur) => {
                if (cur <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return cur - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [resendTimer]);

    const formatResendTimer = (seconds) => {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
        const remainingSeconds = String(seconds % 60).padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    };

    const sendOtpEmail = async (userEmail) => {
        const response = await fetch(getApiUrl('/send-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, purpose: 'register' }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send OTP');
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (password.length < 6) {
            return setError('Password should be at least 6 characters');
        }

        setLoading(true);
        try {
            const accountExists = await checkAccountExists(email);
            if (accountExists) {
                throw new Error('Account already exists. Please login.');
            }
            await sendOtpEmail(email);
            setResendTimer(120);
            setStep('verify');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            await sendOtpEmail(email);
            setResendTimer(120);
        } catch (err) {
            console.error(err);
            setError('Failed to resend verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (enteredOtp.length !== 6) {
                throw new Error('Please enter a valid 6-digit OTP.');
            }

            const verifyResponse = await fetch(getApiUrl('/api/verify-otp'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: enteredOtp })
            });

            if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                throw new Error(errorData.error || 'Invalid OTP. Please check your email and try again.');
            }

            const username = email.split('@')[0];
            await register(email, password, 'user', username);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-card container">
            <h2>{step === 'form' ? 'Create Account' : 'Verify Email'}</h2>

            {error && <div className="error-message" role="alert">{error}</div>}

            {step === 'form' ? (
                <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                        <label htmlFor="book-reg-email">Email:</label>
                        <input
                            id="book-reg-email"
                            name="email"
                            autoComplete="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="book-reg-pass">Password:</label>
                        <input
                            id="book-reg-pass"
                            name="password"
                            autoComplete="new-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="book-reg-confirm-pass">Confirm Password:</label>
                        <input
                            id="book-reg-confirm-pass"
                            name="confirmPassword"
                            autoComplete="new-password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="book-reg-show-pass"
                            name="showPassword"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <label htmlFor="book-reg-show-pass">Show Password</label>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </button>

                    <p className="toggle-auth">
                        Already have an account?{' '}
                        <button type="button" onClick={onSwitchToLogin} className="register-link-btn">
                            Login
                        </button>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleVerifyAndRegister}>
                    <p className="login-subtext">
                        We've sent a 6-digit code to <strong>{email}</strong>. Enter it below.
                    </p>

                    <div className="form-group">
                        <label htmlFor="book-reg-otp">OTP Code:</label>
                        <input
                            id="book-reg-otp"
                            name="otp"
                            autoComplete="one-time-code"
                            type="text"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            placeholder="123456"
                            maxLength="6"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Register'}
                    </button>

                    <p className="login-subtext" style={{ marginTop: '12px', marginBottom: '0', textAlign: 'center' }}>
                        {resendTimer > 0
                            ? `Resend available in ${formatResendTimer(resendTimer)}`
                            : "Didn't receive the code?"}
                    </p>

                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading || resendTimer > 0}
                        className="resend-code-btn"
                    >
                        {loading && resendTimer === 0 ? 'Sending...' : 'Resend Code'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setStep('form');
                            setError('');
                            setEnteredOtp('');
                            setResendTimer(0);
                        }}
                        className="login-secondary-btn"
                    >
                        Back to Sign Up
                    </button>
                </form>
            )}
        </div>
    );
};

/* ─── Page face component ─── */
const BookPage = ({ side, folio, running, ruled = false, children }) => {
    const isLeft = side === 'l';
    return (
        <div className={`lb-page-face lb-page-face--${isLeft ? 'left' : 'right'}${ruled ? ' lb-ruled' : ''}`}>
            <div className="lb-page-shadow" />
            <div className="lb-page-tab" />
            <div className="lb-page-inner">
                <header className={`lb-running-head${isLeft ? '' : ' lb-running-head--right'}`}>
                    <span className="lb-running-blue">ExamFobiya</span>
                </header>
                <div className="lb-page-body">
                    {children}
                </div>
                <footer className={`lb-folio${isLeft ? ' lb-folio--left' : ''}`}>
                    <span>{folio}</span>
                </footer>
            </div>
        </div>
    );
};

/* ─── Chapter landing content ─── */
const ChapterContent = ({ title, sub, points, onLogin, onRegister, showActions = true }) => (
    <div className="lb-chapter">
        <div className="lb-chapter-title">
            <div className="lb-chapter-label">
                <small>Chapter</small>
                <h2>{title}</h2>
            </div>
        </div>
        <p className="lb-chapter-sub">{sub}</p>
        <div className="lb-chapter-objectives">
            <strong>YOUR STUDY SPACE</strong>
            <ul>
                {points.map((p) => <li key={p}>{p}</li>)}
            </ul>
        </div>
        {showActions && (
            <div className="lb-chapter-actions">
                {title === 'Register' ? (
                    onLogin && (
                        <button type="button" className="lb-cta" onClick={onLogin}>
                            User login
                        </button>
                    )
                ) : (
                    <>
                        {onLogin && (
                            <button type="button" className="lb-cta" onClick={onLogin}>
                                {title === 'User' ? 'User login' : 'Admin login'}
                            </button>
                        )}
                        {title === 'User' && onRegister && (
                            <button type="button" className="lb-cta lb-cta--register" onClick={onRegister}>
                                Register
                            </button>
                        )}
                    </>
                )}
            </div>
        )}
    </div>
);

const Login = ({ initialMode = 'cover' }) => {
    const location = useLocation();
    const isRegisterRoute = location.pathname === '/register';
    const computedInitial = initialMode === 'register' || isRegisterRoute ? 'register' : 'cover';

    const [error, setError] = useState('');
    const [mode, setMode] = useState(computedInitial); // 'cover' | 'user' | 'register' | 'admin'
    const [leftPortal, setLeftPortal] = useState(computedInitial === 'register' ? 'register' : 'user');
    const [topLeaf, setTopLeaf] = useState(computedInitial === 'admin' ? 'admin' : 'user');
    const [forgotRole, setForgotRole] = useState('user'); // 'user' | 'admin'
    const [forgotState, setForgotState] = useState('closed'); // 'closed' | 'open' | 'closing'
    const resetTimerRef = useRef(null);
    const forgotTimerRef = useRef(null);
    const { login, register, checkAccountExists, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === '/register') {
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
                resetTimerRef.current = null;
            }
            if (forgotState !== 'closed') {
                setForgotState('closed');
            }
            setMode('register');
            setLeftPortal('register');
            setTopLeaf('user');
        } else if (location.pathname === '/login' && mode === 'register') {
            back();
        }
    }, [location.pathname]);

    useEffect(() => {
        return () => {
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
            }
            if (forgotTimerRef.current) {
                clearTimeout(forgotTimerRef.current);
            }
        };
    }, []);

    useSEO({
        title: mode === 'register'
            ? 'Create Your Free Account for Exam Prep'
            : 'Log In to Access Your Study Materials',
        description: mode === 'register'
            ? 'Create a free ExamFobiya account to save your favorite books and question papers for easy access.'
            : 'Sign in to your ExamFobiya account to save books, questions, and access personalized features.',
        path: mode === 'register' ? '/register' : '/login'
    });

    const handleAuth = async (role, email, password, isRegistering) => {
        setError('');
        try {
            if (isRegistering) {
                const username = email.split('@')[0];
                await register(email, password, role, username);
                if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                const userCred = await login(email, password);
                let targetRole = role;
                try {
                    const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
                    if (userDoc.exists() && userDoc.data()?.role) {
                        targetRole = userDoc.data().role;
                    }
                } catch (e) {
                    console.error("Error fetching user role on login:", e);
                }

                if (targetRole === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const open = (portal) => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
        if (forgotTimerRef.current) {
            clearTimeout(forgotTimerRef.current);
            forgotTimerRef.current = null;
        }
        setForgotState('closed');

        setTopLeaf(portal === 'admin' ? 'admin' : 'user');
        if (portal === 'register' || portal === 'user') {
            setLeftPortal(portal);
        }
        setMode(portal);
        setError('');
        if (portal === 'register') {
            window.history.replaceState(null, '', '/register');
        } else if (portal === 'user') {
            window.history.replaceState(null, '', '/login');
        }
    };

    const back = () => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }
        if (forgotTimerRef.current) {
            clearTimeout(forgotTimerRef.current);
        }

        setMode('cover');
        window.history.replaceState(null, '', '/login');
        // Preserve active leftPortal and forgotState throughout the 1200ms page-flip animation
        // so no abrupt content swap occurs mid-flip. Reset quietly once fully closed.
        resetTimerRef.current = setTimeout(() => {
            setLeftPortal('user');
            setForgotState('closed');
            resetTimerRef.current = null;
        }, 1250);
    };

    const openForgotPassword = (role) => {
        if (forgotTimerRef.current) {
            clearTimeout(forgotTimerRef.current);
            forgotTimerRef.current = null;
        }
        setForgotRole(role);
        setForgotState('open');
    };

    const closeForgotPassword = () => {
        if (forgotTimerRef.current) {
            clearTimeout(forgotTimerRef.current);
        }
        setForgotState('closing');
        forgotTimerRef.current = setTimeout(() => {
            setForgotState('closed');
            forgotTimerRef.current = null;
        }, 1250);
    };

    const backToContentsFromForgot = () => {
        if (forgotTimerRef.current) {
            clearTimeout(forgotTimerRef.current);
        }
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }
        setForgotState('closing-to-cover');
        setMode('cover');
        window.history.replaceState(null, '', '/login');
        forgotTimerRef.current = setTimeout(() => {
            setForgotState('closed');
            setLeftPortal('user');
            forgotTimerRef.current = null;
        }, 1250);
    };

    const isLeftLeafOpen = mode === 'user' || mode === 'register';
    const isRightLeafOpen = mode === 'admin';
    const isLeftLeafTop = topLeaf === 'user' || isLeftLeafOpen;
    const isRightLeafTop = topLeaf === 'admin' || isRightLeafOpen;

    const registerPoints = [
        'Create your free learner account',
        'Save study materials and question papers',
        'Personalize your learning space'
    ];
    const userPoints = ['Save books and question papers', 'Explore study material', 'Pick up where you left off'];
    const adminPoints = ['Publish and update course books', 'Manage learners and inventory', 'Review the learning library'];
    const forgotPoints = [
        'Enter your registered email address',
        'Verify identity with a 6-digit OTP',
        'Set a new secure password'
    ];

    return (
        <div className="login-container login-book-shell">
            <h1 className="sr-only">Log In to ExamFobiya</h1>
            {error && <div className="global-error-message login-book-error" role="alert">{error}</div>}

            <section className="login-book" aria-label="Choose a sign-in portal">
                {/* Decorative cloth cover */}
                <div className="lb-cloth-cover" aria-hidden="true" />
                {/* Page block edge */}
                <div className="lb-pages-edge" aria-hidden="true" />

                {/* ── Base pages (sit underneath the leaves) ── */}
                <div className="lb-base-pages">
                    <div className="lb-base-page lb-base-page--left">
                        <BookPage side="l" folio={2} running={leftPortal === 'register' ? 'Registration' : 'Learner portal'}>
                            <div className={`lb-base-left-content${forgotState !== 'closed' ? ' lb-mobile-hide' : ''}`}>
                                {leftPortal === 'register' ? (
                                    <ChapterContent
                                        key="chapter-reg"
                                        title="Register"
                                        sub="The learner portal for students and readers."
                                        points={registerPoints}
                                        showActions={false}
                                    />
                                ) : (
                                    <ChapterContent
                                        key="chapter-user"
                                        title="User"
                                        sub="The learner portal for students and readers."
                                        points={userPoints}
                                        onLogin={() => open('user')}
                                        onRegister={() => open('register')}
                                        showActions={false}
                                    />
                                )}
                            </div>
                            {forgotState !== 'closed' && (
                                <div className="lb-mobile-only-forgot">
                                    <ChapterContent
                                        key="forgot-ch"
                                        title="Forgot Password"
                                        sub="Account recovery and security desk."
                                        points={forgotPoints}
                                        showActions={false}
                                    />
                                    <button className="login-book-back" type="button" onClick={backToContentsFromForgot}>Back to contents</button>
                                </div>
                            )}
                        </BookPage>
                    </div>
                    <div className="lb-base-page lb-base-page--right">
                        <BookPage
                            side="r"
                            folio={forgotRole === 'admin' && forgotState !== 'closed' ? 5 : 3}
                            running={forgotRole === 'admin' && forgotState !== 'closed' ? 'Account recovery' : 'Instructor desk'}
                            ruled
                        >
                            <div
                                className={`lb-base-form-fade${mode === 'admin' || (forgotRole === 'admin' && forgotState !== 'closed') ? ' lb-base-form-fade--visible' : ''}`}
                                inert={mode !== 'admin' && forgotState === 'closed' ? '' : undefined}
                            >
                                {forgotRole === 'admin' && forgotState !== 'closed' ? (
                                    <ForgotPasswordBox
                                        role="admin"
                                        checkAccountExists={checkAccountExists}
                                        onCancel={closeForgotPassword}
                                        onSuccess={() => closeForgotPassword()}
                                    />
                                ) : (
                                    <LoginBox
                                        role="admin"
                                        title="Admin Portal"
                                        onAuth={handleAuth}
                                        allowRegister={false}
                                        checkAccountExists={checkAccountExists}
                                        onForgotPassword={() => openForgotPassword('admin')}
                                    />
                                )}
                                {!(forgotRole === 'admin' && forgotState !== 'closed') && (
                                    <button className="login-book-back" type="button" onClick={back}>
                                        Back to contents
                                    </button>
                                )}
                            </div>
                        </BookPage>
                    </div>
                </div>

                {/* ── Left leaf (User / Register portal) — rotates right-to-left to open ── */}
                <div
                    className={`lb-leaf lb-leaf--left${isLeftLeafOpen ? ' lb-leaf--open' : ''}${isLeftLeafTop ? ' lb-leaf--top' : ''}${forgotState === 'closing-to-cover' && forgotRole === 'user' ? ' lb-leaf--closing-from-forgot' : ''}`}
                >
                    <div className="lb-face lb-face--front" inert={isLeftLeafOpen ? '' : undefined}>
                        <BookPage side="l" folio={1} running="Contents">
                            <ChapterContent
                                title="User"
                                sub="The learner portal for students and readers."
                                points={userPoints}
                                onLogin={() => open('user')}
                                onRegister={() => open('register')}
                                showActions={true}
                            />
                        </BookPage>
                    </div>
                    <div className="lb-face lb-face--back" inert={!isLeftLeafOpen ? '' : undefined}>
                        <BookPage
                            side="r"
                            folio={forgotRole === 'user' && forgotState !== 'closed' ? 5 : 3}
                            running={forgotRole === 'user' && forgotState !== 'closed' ? 'Account recovery' : (leftPortal === 'register' ? 'Registration' : 'Learner portal')}
                            ruled
                        >
                            {forgotRole === 'user' && forgotState !== 'closed' ? (
                                <ForgotPasswordBox
                                    role="user"
                                    checkAccountExists={checkAccountExists}
                                    onCancel={closeForgotPassword}
                                    onSuccess={() => closeForgotPassword()}
                                />
                            ) : leftPortal === 'register' ? (
                                <RegisterBox
                                    key="reg-box"
                                    onSuccess={() => navigate('/')}
                                    onSwitchToLogin={() => open('user')}
                                    checkAccountExists={checkAccountExists}
                                    register={register}
                                />
                            ) : (
                                <LoginBox
                                    key="user-box"
                                    role="user"
                                    title="User Portal"
                                    onAuth={handleAuth}
                                    onGoogleLogin={handleGoogleLogin}
                                    allowRegister
                                    checkAccountExists={checkAccountExists}
                                    onSwitchToRegister={() => open('register')}
                                    onForgotPassword={() => openForgotPassword('user')}
                                />
                            )}
                            {!(forgotRole === 'user' && forgotState !== 'closed') && (
                                <button className="login-book-back" type="button" onClick={back}>
                                    Back to contents
                                </button>
                            )}
                        </BookPage>
                    </div>
                </div>

                {/* ── Right leaf (Admin portal) — rotates left-to-right to open ── */}
                <div
                    className={`lb-leaf lb-leaf--right${isRightLeafOpen ? ' lb-leaf--open' : ''}${isRightLeafTop && !isLeftLeafOpen ? ' lb-leaf--top' : ''}${forgotState === 'closing-to-cover' && forgotRole === 'admin' ? ' lb-leaf--closing-from-forgot' : ''}`}
                >
                    <div className="lb-face lb-face--front" inert={isRightLeafOpen || isLeftLeafOpen ? '' : undefined}>
                        <BookPage side="r" folio={2} running="Contents">
                            <ChapterContent
                                title="Admin"
                                sub="The instructor desk for managing the library."
                                points={adminPoints}
                                onLogin={() => open('admin')}
                                showActions={true}
                            />
                        </BookPage>
                    </div>
                    <div className="lb-face lb-face--back">
                        {forgotRole === 'admin' && forgotState === 'closing-to-cover' ? (
                            <BookPage side="l" folio={4} running="Forgot password">
                                <ChapterContent
                                    title="Forgot Password"
                                    sub="Account recovery and security desk."
                                    points={forgotPoints}
                                    showActions={false}
                                />
                                <button className="login-book-back" type="button" onClick={backToContentsFromForgot}>
                                    Back to contents
                                </button>
                            </BookPage>
                        ) : (
                            <BookPage side="l" folio={2} running="Instructor desk">
                                <ChapterContent
                                    title="Admin"
                                    sub="The instructor desk for managing the library."
                                    points={adminPoints}
                                    showActions={false}
                                />
                            </BookPage>
                        )}
                    </div>
                </div>

                {/* ── Forgot Password leaf (flips right-to-left) ── */}
                <div
                    className={`lb-leaf lb-leaf--forgot${
                        forgotState === 'open'
                            ? ' lb-leaf--open'
                            : forgotState === 'closing'
                            ? ' lb-leaf--closing'
                            : forgotState === 'closing-to-cover'
                            ? (forgotRole === 'user' ? ' lb-leaf--closing-cover-user' : ' lb-leaf--closing-cover-admin')
                            : ''
                    }`}
                    inert={forgotState === 'closed' ? '' : undefined}
                >
                    <div className="lb-face lb-face--front" inert={forgotState !== 'closed' ? '' : undefined}>
                        <BookPage side="r" folio={3} running={forgotRole === 'admin' ? 'Instructor desk' : 'Learner portal'} ruled>
                            {forgotState !== 'closing-to-cover' && (
                                <>
                                    <LoginBox
                                        role={forgotRole}
                                        title={forgotRole === 'admin' ? 'Admin Portal' : 'User Portal'}
                                        onAuth={handleAuth}
                                        onGoogleLogin={forgotRole === 'user' ? handleGoogleLogin : undefined}
                                        allowRegister={forgotRole === 'user'}
                                        checkAccountExists={checkAccountExists}
                                        onSwitchToRegister={() => open('register')}
                                        onForgotPassword={() => openForgotPassword(forgotRole)}
                                    />
                                    <button className="login-book-back" type="button" onClick={back}>Back to contents</button>
                                </>
                            )}
                        </BookPage>
                    </div>
                    <div className="lb-face lb-face--back" inert={forgotState !== 'open' ? '' : undefined}>
                        <BookPage side="l" folio={4} running="Forgot password">
                            <ChapterContent
                                title="Forgot Password"
                                sub="Account recovery and security desk."
                                points={forgotPoints}
                                showActions={false}
                            />
                            <button className="login-book-back" type="button" onClick={backToContentsFromForgot}>Back to contents</button>
                        </BookPage>
                    </div>
                </div>

                {/* Spine */}
                <div className="lb-spine" aria-hidden="true" />
            </section>
        </div>
    );
};

export default Login;
