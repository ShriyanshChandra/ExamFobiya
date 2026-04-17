import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 2FA State
    const [step, setStep] = useState('form'); // 'form' | 'verify'
    const [enteredOtp, setEnteredOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const { register, checkAccountExists } = useAuth();
    const navigate = useNavigate();

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

    const sendOtpEmail = async (userEmail) => {
        try {
            const response = await fetch(getApiUrl('/send-otp'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail, purpose: 'register' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send OTP');
            }
            console.log(`[BACKEND] OTP requested for ${userEmail}`);
        } catch (error) {
            console.error('Frontend Error sending email:', error);
            throw error; 
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        if (password.length < 6) {
            return setError("Password should be at least 6 characters");
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
            setError(err.message || "Failed to send verification code. Please try again.");
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
            setError("Failed to resend verification code. Please try again.");
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
                throw new Error("Please enter a valid 6-digit OTP.");
            }

            const verifyResponse = await fetch(getApiUrl('/api/verify-otp'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: enteredOtp })
            });

            if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                throw new Error(errorData.error || "Invalid OTP. Please check your email and try again.");
            }

            const username = email.split('@')[0];
            // Default role is 'user' for public registration
            await register(email, password, 'user', username);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            {error && <div className="register-error-message">{error}</div>}

            <div className="register-card">
                <h2>{step === 'form' ? 'Create Account' : 'Verify Email'}</h2>

                {step === 'form' ? (
                    <form onSubmit={handleSendOtp}>
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
                                placeholder="Create password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password:</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                required
                            />
                        </div>

                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="show-pass"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="show-pass">Show Password</label>
                        </div>

                        <button type="submit" className="register-btn" disabled={loading}>
                            {loading ? 'Sending Code...' : 'Send Verification Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyAndRegister}>
                        <p className="otp-instruction">
                            We've sent a 6-digit code to <strong>{email}</strong>.
                            Please enter it below to verify your account.
                        </p>

                        <div className="form-group">
                            <label>Enter OTP Code:</label>
                            <input
                                type="text"
                                value={enteredOtp}
                                onChange={(e) => setEnteredOtp(e.target.value)}
                                placeholder="123456"
                                maxLength="6"
                                className="otp-input"
                                required
                            />
                        </div>

                        <button type="submit" className="register-btn" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Register'}
                        </button>

                        <p style={{ marginTop: '12px', marginBottom: '0', textAlign: 'center', color: '#555', fontSize: '0.9rem' }}>
                            {resendTimer > 0
                                ? `Resend available in ${formatResendTimer(resendTimer)}`
                                : 'Didn’t receive the code?'}
                        </p>

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleResendOtp}
                            disabled={loading || resendTimer > 0}
                            style={{ marginTop: '10px', width: '100%' }}
                        >
                            {loading && resendTimer === 0 ? 'Sending...' : 'Resend Code'}
                        </button>

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                                setStep('form');
                                setError('');
                                setEnteredOtp('');
                                setResendTimer(0);
                            }}
                            style={{ marginTop: '10px', width: '100%' }}
                        >
                            Back to Sign Up
                        </button>
                    </form>
                )}

                <p className="redirect-login">
                    Already have an account? <Link to="/login" style={{ color: '#007bff' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
