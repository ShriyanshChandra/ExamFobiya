import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const generateOtp = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const sendOtpEmail = async (userEmail, otp) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail, otp: otp }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send OTP');
            }
            console.log(`[BACKEND] OTP Sent successfully to ${userEmail}`);
        } catch (error) {
            console.error('Frontend Error sending email:', error);
            // Fallback for demo if backend is not running
            console.log(`[FALLBACK] Backend unreachable. Mock OTP: ${otp}`);
            // In production, you might want to re-throw this to show an error to user
            // throw error; 
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
            const otp = generateOtp();
            await sendOtpEmail(email, otp);
            setGeneratedOtp(otp);
            setStep('verify');
        } catch (err) {
            console.error(err);
            setError("Failed to send verification code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (enteredOtp !== generatedOtp) {
            setLoading(false);
            return setError("Invalid OTP. Please check your email and try again.");
        }

        try {
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

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                                setStep('form');
                                setError('');
                                setEnteredOtp('');
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
