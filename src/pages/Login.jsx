import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import useSEO from '../utils/useSEO';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Login.css';

const LoginBox = ({ role, title, onAuth, onGoogleLogin, allowRegister = true, checkAccountExists }) => {
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
                        <button type="button" onClick={() => setStep('email')} className="forgot-pass-btn" disabled={loading || googleLoading}>
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
                            Need an account? <Link to="/register" className="register-link">Register</Link>
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
                            : 'Didn’t receive the code?'}
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

const Login = () => {
    const [error, setError] = useState('');
    const { login, register, checkAccountExists, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useSEO({
        title: 'Log In to Access Your Study Materials',
        description: 'Sign in to your ExamFobiya account to save books, questions, and access personalized features.',
        path: '/login'
    });

    const handleAuth = async (role, email, password, isRegistering) => {
        setError('');
        try {
            if (isRegistering) {
                // Register
                const username = email.split('@')[0];
                await register(email, password, role, username);
                if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                // Login
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

    return (
        <div className="login-container">
            <h1 className="sr-only">Log In to ExamFobiya</h1>
            <div className="login-outer-container">
                {error && <div className="global-error-message">{error}</div>}
                <div className="login-boxes-wrapper">
                    <LoginBox role="user" title="User Portal" onAuth={handleAuth} onGoogleLogin={handleGoogleLogin} allowRegister={true} checkAccountExists={checkAccountExists} />
                    <div className="login-portals-divider" aria-hidden="true"></div>
                    <LoginBox role="admin" title="Admin Portal" onAuth={handleAuth} allowRegister={false} checkAccountExists={checkAccountExists} />
                </div>
            </div>
        </div>
    );
};

export default Login;
