import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import useSEO from '../utils/useSEO';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Login.css';

const wideQ = '(min-width: 1001px)';
const stackQ = '(max-width: 1000px) and (max-aspect-ratio: 1/1)';

function useLayout() {
    const read = () => {
        if (typeof window === 'undefined') return 'wide';
        if (window.innerWidth <= 768) return 'stack';
        if (window.matchMedia(stackQ).matches) return 'stack';
        if (window.matchMedia(wideQ).matches) return 'wide';
        return 'mid';
    };
    const [layout, setLayout] = useState(read);
    useEffect(() => {
        const qs = [window.matchMedia(stackQ), window.matchMedia(wideQ)];
        const on = () => setLayout(read());
        window.addEventListener('resize', on);
        qs.forEach((q) => q.addEventListener('change', on));
        return () => {
            window.removeEventListener('resize', on);
            qs.forEach((q) => q.removeEventListener('change', on));
        };
    }, []);
    return layout;
}

const unitFor = {
    wide: 'calc(min(70vw, 105vh) / 100)',
    mid: 'calc(min(94vw, 150vh) / 100)',
    stack: 'calc(min(92vw / 54, (100dvh - 8rem) / 116))',
};

/* ─── Page Surface Component ─── */
const Page = ({ side, folio, running, ruled = false, stack = false, children }) => {
    const isLeft = side === 'l';
    const surfaceClass = stack
        ? (isLeft ? 'lb-page--stack-l' : 'lb-page--stack-r')
        : (isLeft ? 'lb-page--wide-l' : 'lb-page--wide-r');

    return (
        <div className={`lb-page-face ${surfaceClass}${ruled ? ' lb-page--ruled' : ''}`}>
            <div className="lb-page-inner">
                <header className="lb-running-head">
                    <span className="lb-running-blue">ExamFobiya</span>
                    {running && <span>{running}</span>}
                </header>
                <div className="lb-page-body">
                    {children}
                </div>
                <span className={`lb-folio${stack && isLeft ? ' lb-folio--stack-l' : ''}${isLeft ? ' lb-folio--left' : ''}`}>
                    {folio}
                </span>
            </div>
        </div>
    );
};

/* ─── Book Ornament Divider ─── */
const Ornament = () => (
    <div className="lb-ornament" aria-hidden="true">
        <span className="lb-ornament-line" />
        <span className="lb-ornament-symbol">❦</span>
        <span className="lb-ornament-line" />
    </div>
);

/* ─── Chapter Content Component ─── */
const ChapterContent = ({ eyebrow, title, sub, points, onLogin, onRegister, showActions = true, small = false }) => (
    <div className="lb-chapter">
        {eyebrow && <p className="lb-chapter-eyebrow">{eyebrow}</p>}
        <h2 className={`lb-chapter-title${small ? ' lb-chapter-title--small' : ''}`}>
            {title}
        </h2>
        <Ornament />
        {sub && <p className="lb-chapter-sub">{sub}</p>}
        {points && points.length > 0 && (
            <div className="lb-chapter-objectives">
                <strong>Your Study Space</strong>
                <ul>
                    {points.map((p) => <li key={p}>{p}</li>)}
                </ul>
            </div>
        )}
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
                            <button type="button" className="lb-cta lb-cta--outline" onClick={onRegister}>
                                Register
                            </button>
                        )}
                    </>
                )}
            </div>
        )}
    </div>
);

/* ─── Login Box Component ─── */
const LoginBox = ({ role, title, onAuth, onGoogleLogin, allowRegister = true, onSwitchToRegister, onForgotPassword, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setLoading(true);
        try {
            await onAuth(role, email, password, false);
        } catch (err) {
            setLocalError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="lb-form-container">
            <div className="lb-form-head">
                <p className="lb-form-eyebrow">{role === 'admin' ? 'Keepers Desk' : 'Reader Sign-in'}</p>
                <h3 className="lb-form-title">{title}</h3>
            </div>

            {localError && <div className="lb-error-msg" role="alert">{localError}</div>}

            <div className="lb-input-group">
                <label className="lb-input-label" htmlFor={`login-email-${role}`}>Email ID</label>
                <input
                    id={`login-email-${role}`}
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="lb-input-field"
                />
            </div>

            <div className="lb-input-group">
                <label className="lb-input-label" htmlFor={`login-password-${role}`}>Password</label>
                <input
                    id={`login-password-${role}`}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="lb-input-field"
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="lb-checkbox-group">
                    <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                    />
                    <span>Show Password</span>
                </label>
                <button
                    type="button"
                    onClick={() => onForgotPassword(role)}
                    className="lb-link-btn"
                    disabled={loading || googleLoading}
                >
                    Forgot password?
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'calc(var(--u) * 0.4)' }}>
                <button type="submit" className="lb-cta" disabled={loading || googleLoading} style={{ width: '100%' }}>
                    {loading ? 'Signing in...' : 'Login'}
                </button>

                {role === 'user' && onGoogleLogin && (
                    <>
                        <div className="lb-or-divider" style={{ width: '100%' }}>
                            <span>or</span>
                        </div>
                        <button
                            type="button"
                            className="lb-google-btn"
                            disabled={loading || googleLoading}
                            onClick={async () => {
                                setLocalError('');
                                setGoogleLoading(true);
                                try {
                                    await onGoogleLogin();
                                } catch (err) {
                                    setLocalError(err.message || 'Google sign-in failed.');
                                } finally {
                                    setGoogleLoading(false);
                                }
                            }}
                        >
                            {googleLoading ? (
                                <span className="google-btn-spinner" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
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
                    <p style={{ marginTop: 'calc(var(--u) * 0.8)', fontSize: 'calc(var(--u) * 1.15 * var(--k))', color: 'var(--book-ink)' }}>
                        Need an account?{' '}
                        <button type="button" onClick={onSwitchToRegister} className="lb-link-btn" style={{ fontWeight: 600 }}>
                            Register
                        </button>
                    </p>
                )}

                {onBack && (
                    <button type="button" onClick={onBack} className="login-book-back">
                        ← Back to cover
                    </button>
                )}
            </div>
        </form>
    );
};

/* ─── Registration Box Component ─── */
const RegisterBox = ({ onSuccess, onSwitchToLogin, onBack, register }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }

        setLoading(true);
        try {
            const username = email.split('@')[0];
            await register(email, password, 'user', username);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="lb-form-container">
            <div className="lb-form-head">
                <p className="lb-form-eyebrow">New Reader</p>
                <h3 className="lb-form-title">Create your account</h3>
            </div>

            {error && <div className="lb-error-msg" role="alert">{error}</div>}

            <div className="lb-input-group">
                <label className="lb-input-label" htmlFor="register-email">Email ID</label>
                <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="lb-input-field"
                />
            </div>

            <div className="lb-input-group">
                <label className="lb-input-label" htmlFor="register-password">Password</label>
                <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="lb-input-field"
                />
            </div>

            <div className="lb-input-group">
                <label className="lb-input-label" htmlFor="register-confirm">Confirm Password</label>
                <input
                    id="register-confirm"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="lb-input-field"
                />
            </div>

            <label className="lb-checkbox-group">
                <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                />
                <span>Show Password</span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'calc(var(--u) * 0.4)' }}>
                <button type="submit" className="lb-cta" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Registering...' : 'Register'}
                </button>

                <p style={{ marginTop: 'calc(var(--u) * 0.8)', fontSize: 'calc(var(--u) * 1.15 * var(--k))', color: 'var(--book-ink)' }}>
                    Already have an account?{' '}
                    <button type="button" onClick={onSwitchToLogin} className="lb-link-btn" style={{ fontWeight: 600 }}>
                        Login
                    </button>
                </p>

                {onBack && (
                    <button type="button" onClick={onBack} className="login-book-back">
                        ← Back to cover
                    </button>
                )}
            </div>
        </form>
    );
};

/* ─── Forgot Password Box Component ─── */
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
            throw new Error('Account does not exist. Please check your email or register.');
        }

        if (role === 'admin') {
            const checkResponse = await fetch(getApiUrl('/api/check-admin'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
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
            throw new Error(errorData.error || 'Failed to send verification code.');
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
            setLocalError(err.message || 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setLocalError('');
        if (enteredOtp.length !== 6) {
            return setLocalError('Please enter a valid 6-digit OTP code.');
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
            setLocalError(err.message || 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSuccessMsg('');

        if (newPassword !== confirmPassword) {
            return setLocalError('Passwords do not match.');
        }
        if (newPassword.length < 6) {
            return setLocalError('Password must be at least 6 characters.');
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
                throw new Error(errorData.error || 'Failed to reset password.');
            }

            setSuccessMsg('Password reset successfully! You can now login.');
            if (onSuccess) onSuccess();
        } catch (err) {
            setLocalError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lb-form-container">
            <div className="lb-form-head">
                <p className="lb-form-eyebrow">{role === 'admin' ? 'Keeper Security' : 'Account Recovery'}</p>
                <h3 className="lb-form-title">
                    {step === 'new-password' ? 'Create New Password' : step === 'otp' ? 'Verify Code' : 'Reset Password'}
                </h3>
            </div>

            {localError && <div className="lb-error-msg" role="alert">{localError}</div>}
            {successMsg && <div className="lb-success-msg" role="status">{successMsg}</div>}

            {step === 'email' && (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--u) * 0.85)' }}>
                    <div className="lb-input-group">
                        <label className="lb-input-label" htmlFor={`forgot-email-${role}`}>Enter your email</label>
                        <input
                            id={`forgot-email-${role}`}
                            name="resetEmail"
                            type="email"
                            required
                            autoComplete="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="lb-input-field"
                        />
                    </div>
                    <button type="submit" className="lb-cta lb-cta--send-code" disabled={loading} style={{ width: '100%', marginTop: 'calc(var(--u) * 0.4)' }}>
                        {loading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="login-book-back">
                            ← Back to login
                        </button>
                    )}
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--u) * 0.85)' }}>
                    <p style={{ fontSize: 'calc(var(--u) * 1.15 * var(--k))', color: 'var(--book-ink)', textAlign: 'center', margin: '0' }}>
                        We sent a 6-digit code to <strong>{resetEmail}</strong>
                    </p>
                    <div className="lb-input-group">
                        <label className="lb-input-label" htmlFor={`forgot-otp-${role}`}>OTP Code</label>
                        <input
                            id={`forgot-otp-${role}`}
                            name="otp"
                            type="text"
                            maxLength="6"
                            required
                            autoComplete="one-time-code"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            placeholder="Enter your OTP"
                            className="lb-input-field"
                        />
                    </div>
                    <button type="submit" className="lb-cta" style={{ width: '100%', marginTop: 'calc(var(--u) * 0.4)' }}>
                        Verify Code
                    </button>
                    <p style={{ textAlign: 'center', fontSize: 'calc(var(--u) * 1.05 * var(--k))', color: 'var(--book-muted)', margin: '0' }}>
                        {resendTimer > 0 ? `Resend available in ${formatResendTimer(resendTimer)}` : "Didn't receive the code?"}
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading || resendTimer > 0}
                        className="lb-link-btn"
                        style={{ alignSelf: 'center' }}
                    >
                        {loading && resendTimer === 0 ? 'Sending...' : 'Resend Code'}
                    </button>
                    <button type="button" onClick={() => { setStep('email'); setLocalError(''); }} className="login-book-back">
                        ← Back to email
                    </button>
                </form>
            )}

            {step === 'new-password' && (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--u) * 0.85)' }}>
                    <div className="lb-input-group">
                        <label className="lb-input-label" htmlFor={`forgot-new-pass-${role}`}>New Password</label>
                        <input
                            id={`forgot-new-pass-${role}`}
                            name="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="lb-input-field"
                        />
                    </div>
                    <div className="lb-input-group">
                        <label className="lb-input-label" htmlFor={`forgot-confirm-pass-${role}`}>Confirm Password</label>
                        <input
                            id={`forgot-confirm-pass-${role}`}
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            className="lb-input-field"
                        />
                    </div>
                    <label className="lb-checkbox-group">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <span>Show Password</span>
                    </label>
                    <button type="submit" className="lb-cta" disabled={loading} style={{ width: '100%', marginTop: 'calc(var(--u) * 0.4)' }}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="login-book-back">
                            ← Back to login
                        </button>
                    )}
                </form>
            )}
        </div>
    );
};

/* ─── Main Login Component ─── */
const Login = ({ initialMode = 'cover' }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const layout = useLayout();
    const stack = layout === 'stack';

    const isRegisterRoute = location.pathname === '/register';
    const computedInitial = initialMode === 'register' || isRegisterRoute ? 'register' : 'cover';

    const [error, setError] = useState('');
    const [mode, setMode] = useState(computedInitial); // 'cover' | 'user' | 'register' | 'admin'
    const [topLeaf, setTopLeaf] = useState(computedInitial === 'admin' ? 'admin' : 'user');
    const [view, setView] = useState(computedInitial === 'register' ? 'register' : 'login');
    const [forgot, setForgot] = useState(false);
    const [forgotRole, setForgotRole] = useState('user'); // 'user' | 'admin'

    const { login, register, checkAccountExists, loginWithGoogle } = useAuth();

    const back = () => {
        setForgot(false);
        setMode('cover');
        window.history.replaceState(null, '', '/login');
        setTimeout(() => {
            setView('login');
        }, 1200);
    };

    useEffect(() => {
        if (location.pathname === '/register') {
            setForgot(false);
            setMode('user');
            setView('register');
            setTopLeaf('user');
        } else if (location.pathname === '/login') {
            if (view === 'register' || location.state?.resetCover) {
                back();
            }
        }
    }, [location.pathname, location.state]);

    useEffect(() => {
        const handleResetCover = () => {
            if (mode !== 'cover' || forgot) {
                back();
            }
        };
        window.addEventListener('examfobiya:reset-login-cover', handleResetCover);
        return () => window.removeEventListener('examfobiya:reset-login-cover', handleResetCover);
    }, [mode, forgot]);

    useSEO({
        title: view === 'register'
            ? 'Create Your Free Account for Exam Prep'
            : 'Log In to Access Your Study Materials',
        description: view === 'register'
            ? 'Create a free ExamFobiya account to save your favorite books and question papers for easy access.'
            : 'Sign in to your ExamFobiya account to save books, questions, and access personalized features.',
        path: view === 'register' ? '/register' : '/login',
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
                    const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
                    if (userDoc.exists() && userDoc.data()?.role) {
                        targetRole = userDoc.data().role;
                    }
                } catch (e) {
                    console.error('Error fetching user role on login:', e);
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
            throw err;
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const open = (portal) => {
        setForgot(false);
        setTopLeaf(portal);
        setMode(portal);
        setError('');
        if (portal === 'register') {
            setView('register');
            setMode('user');
            window.history.replaceState(null, '', '/register');
        } else if (portal === 'user') {
            setView('login');
            window.history.replaceState(null, '', '/login');
        }
    };

    const openUser = (portalView) => {
        setView(portalView);
        setTopLeaf('user');
        setMode('user');
        setForgot(false);
        setError('');
        if (portalView === 'register') {
            window.history.replaceState(null, '', '/register');
        } else {
            window.history.replaceState(null, '', '/login');
        }
    };


    const startForgot = (role) => {
        setForgotRole(role);
        setForgot(true);
    };

    const flipEase = 'cubic-bezier(0.65, 0, 0.25, 1)';
    const vis = `visibility 0s linear ${forgot ? '0s' : '1.2s'}`;
    const persp = `perspective(calc(var(--u) * ${stack ? 220 : 180}))`;

    const turnLeft = (on) =>
        `${stack ? `translateY(calc(var(--u) * ${on ? 1.8 : 0})) ` : ''}${persp} ${
            stack ? `rotateX(${on ? -180 : 0}deg)` : `rotateY(${on ? 180 : 0}deg)`
        }`;

    const turnRight = (on) =>
        `${stack ? `translateY(calc(var(--u) * ${on ? -1.8 : 0})) ` : ''}${persp} ${
            stack ? `rotateX(${on ? 180 : 0}deg)` : `rotateY(${on ? -180 : 0}deg)`
        }`;

    const turnForgot = (on) =>
        `${stack ? `translateY(calc(var(--u) * ${on ? -1.8 : 0})) ` : ''}${persp} ${
            stack ? `rotateX(${on ? 180 : 0}deg)` : `rotateY(${on ? -180 : 0}deg)`
        }`;

    const baseL = stack ? 'lb-base--stack-l' : 'lb-base--wide-l';
    const baseR = stack ? 'lb-base--stack-r' : 'lb-base--wide-r';
    const leafL = stack ? 'lb-leaf--stack-l' : 'lb-leaf--wide-l';
    const leafR = stack ? 'lb-leaf--stack-r' : 'lb-leaf--wide-r';
    const backFace = stack ? 'lb-face--back-stack' : 'lb-face--back-wide';

    const userPoints = ['Save books and question papers', 'Explore study material', 'Pick up where you left off'];
    const registerPoints = ['Create your free learner account', 'Save study materials and papers', 'Personalize your learning space'];
    const adminPoints = ['Publish and update course books', 'Manage learners and inventory', 'Review the learning library'];
    const forgotPoints = ['Enter your registered email address', 'Verify identity with 6-digit OTP', 'Set a new secure password'];

    const vars = {
        '--u': unitFor[layout],
        '--k': stack ? 1.4 : 1,
        '--fw': stack ? 44 : 28,
        '--nw': stack ? 44 : 26,
        '--cp': stack ? 2.8 : 4,
        width: `calc(var(--u) * ${stack ? 54 : 100})`,
        height: `calc(var(--u) * ${stack ? 116 : 66.667})`,
    };

    const isUserOpen = mode === 'user';
    const isAdminOpen = mode === 'admin';

    return (
        <div className="login-container login-book-shell">
            <h1 className="sr-only">Log In to ExamFobiya</h1>
            {error && <div className="global-error-message login-book-error" role="alert">{error}</div>}

            <section className="login-book" aria-label="Choose a sign-in portal" style={vars}>
                {/* Decorative outer leather cover */}
                <div className="lb-cloth-cover" aria-hidden="true" />
                <div className="lb-cloth-border" aria-hidden="true" />
                {/* Page block edge */}
                <div className="lb-pages-edge" aria-hidden="true" />

                {/* Center gap background for stack notepad */}
                {stack && <div className="lb-binding--stack-bg" aria-hidden="true" />}

                {/* ── Base Pages (sit behind the leaves) ── */}
                <div className={`lb-base ${baseL}`}>
                    <Page side="l" folio={1} stack={stack} running={view === 'register' ? 'Registration' : 'Learner portal'}>
                        <ChapterContent
                            eyebrow={view === 'register' ? 'Chapter · New readers' : 'Chapter · Readers'}
                            title={view === 'register' ? 'Register' : 'User'}
                            sub={view === 'register' ? 'Join the reading room and start your shelf.' : 'Browse, borrow and collect the study materials you love.'}
                            points={view === 'register' ? registerPoints : userPoints}
                            showActions={false}
                        />
                    </Page>
                </div>

                <div className={`lb-base ${baseR}`}>
                    <Page side="r" folio={6} ruled stack={stack} running="Instructor desk">
                        <div
                            inert={!isAdminOpen}
                            className={`lb-base-form-fade${isAdminOpen ? ' lb-base-form-fade--visible' : ''}`}
                        >
                            <LoginBox
                                role="admin"
                                title="Admin Portal"
                                onAuth={handleAuth}
                                allowRegister={false}
                                onForgotPassword={() => startForgot('admin')}
                                onBack={back}
                            />
                        </div>
                    </Page>
                </div>

                {/* ── Left / Top Leaf (User / Register Portal) ── */}
                <div
                    className={`lb-leaf ${leafL}`}
                    style={{
                        transform: turnLeft(isUserOpen),
                        zIndex: topLeaf === 'user' ? 20 : 10,
                    }}
                >
                    <div className="lb-face" inert={isUserOpen}>
                        <Page side="l" folio={3} stack={stack} running="Contents">
                            <ChapterContent
                                eyebrow="Chapter · Readers"
                                title="User"
                                sub="Browse, borrow and collect the study materials you love."
                                points={userPoints}
                                onLogin={() => openUser('login')}
                                onRegister={() => openUser('register')}
                                showActions={true}
                            />
                        </Page>
                    </div>
                    <div className={`lb-face ${backFace}`} inert={!isUserOpen}>
                        <Page side="r" folio={2} ruled stack={stack} running={view === 'register' ? 'Registration' : 'Learner portal'}>
                            {view === 'register' ? (
                                <RegisterBox
                                    onSuccess={() => navigate('/')}
                                    onSwitchToLogin={() => openUser('login')}
                                    onBack={back}
                                    register={register}
                                />
                            ) : (
                                <LoginBox
                                    role="user"
                                    title="User Portal"
                                    onAuth={handleAuth}
                                    onGoogleLogin={handleGoogleLogin}
                                    allowRegister={true}
                                    onSwitchToRegister={() => openUser('register')}
                                    onForgotPassword={() => startForgot('user')}
                                    onBack={back}
                                />
                            )}
                        </Page>
                    </div>
                </div>

                {/* ── Right / Bottom Leaf (Admin Portal) ── */}
                <div
                    className={`lb-leaf ${leafR}`}
                    style={{
                        transform: turnRight(isAdminOpen),
                        zIndex: topLeaf === 'admin' ? 20 : 10,
                    }}
                >
                    <div className="lb-face" inert={isAdminOpen}>
                        <Page side="r" folio={4} stack={stack} running="Contents">
                            <ChapterContent
                                eyebrow="Chapter · Keepers"
                                title="Admin"
                                sub="Tend the shelves, the learners and the study library."
                                points={adminPoints}
                                onLogin={() => open('admin')}
                                showActions={true}
                            />
                        </Page>
                    </div>
                    <div className={`lb-face ${backFace}`}>
                        <Page side="l" folio={5} stack={stack} running="Instructor desk">
                            <ChapterContent
                                eyebrow="Chapter · Keepers"
                                title="Admin"
                                sub="Tend the shelves, the learners and the study library."
                                points={adminPoints}
                                showActions={false}
                            />
                        </Page>
                    </div>
                </div>

                {/* ── Forgot Password Under-layer (Revealed when turning forgot leaf) ── */}
                <div
                    className={`lb-base ${baseR}`}
                    style={{
                        visibility: forgot ? 'visible' : 'hidden',
                        transition: vis,
                        zIndex: 25,
                    }}
                >
                    <Page side="r" folio={8} ruled stack={stack} running="Account recovery">
                        <div
                            inert={!forgot}
                            className={`lb-base-form-fade${forgot ? ' lb-base-form-fade--visible' : ''}`}
                        >
                            <ForgotPasswordBox
                                role={forgotRole}
                                checkAccountExists={checkAccountExists}
                                onCancel={() => setForgot(false)}
                                onSuccess={() => setForgot(false)}
                            />
                        </div>
                    </Page>
                </div>

                {/* ── Forgot Password Leaf ── */}
                <div
                    className={`lb-leaf ${leafR}`}
                    style={{
                        transform: turnForgot(forgot),
                        visibility: forgot ? 'visible' : 'hidden',
                        transition: `transform 1200ms ${flipEase}, ${vis}`,
                        zIndex: 30,
                    }}
                >
                    <div className="lb-face" inert={true}>
                        <Page side="r" folio={forgotRole === 'admin' ? 6 : 2} ruled stack={stack} running="Recovery portal">
                            <div style={{ pointerEvents: 'none', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto 0' }}>
                                <LoginBox
                                    role={forgotRole}
                                    title={forgotRole === 'admin' ? 'Admin Portal' : 'User Portal'}
                                    onAuth={() => {}}
                                    onForgotPassword={() => {}}
                                />
                            </div>
                        </Page>
                    </div>
                    <div className={`lb-face ${backFace}`} inert={true}>
                        <Page side="l" folio={7} stack={stack} running="Lost key">
                            <ChapterContent
                                eyebrow="Lost your key?"
                                title="Forgot Password?"
                                sub="It happens to the best of learners. Verify your identity to set a new password."
                                points={forgotPoints}
                                showActions={false}
                                small={true}
                            />
                        </Page>
                    </div>
                </div>

                {/* ── Middle Binding: Center Crease in Wide / 8 Spiral Rings in Stack ── */}
                {stack ? (
                    <>
                        <div className="lb-binding--stack-shadow" aria-hidden="true" />
                        <div className="lb-binding--stack-rings" aria-hidden="true">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <span key={i} className="lb-spiral-ring" />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="lb-binding--wide" aria-hidden="true" />
                )}
            </section>
        </div>
    );
};

export default Login;
