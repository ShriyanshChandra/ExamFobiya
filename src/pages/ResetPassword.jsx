import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import useSEO from '../utils/useSEO';
import './ResetPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useSEO({
        title: 'Reset Your Password - Account Recovery',
        description: 'Reset your ExamFobiya account password securely. Enter a new password to regain access.',
        path: '/reset-password'
    });

    const oobCode = searchParams.get('oobCode');
    const emailParam = searchParams.get('email');

    const [verifiedEmail, setVerifiedEmail] = useState(emailParam || '');
    const [verifyingCode, setVerifyingCode] = useState(true);
    const [invalidCode, setInvalidCode] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!oobCode) {
            setInvalidCode(true);
            setVerifyingCode(false);
            return;
        }

        verifyPasswordResetCode(auth, oobCode)
            .then((email) => {
                if (email) {
                    setVerifiedEmail(email);
                }
                setVerifyingCode(false);
            })
            .catch((err) => {
                console.error('Invalid or expired reset code:', err);
                setInvalidCode(true);
                setVerifyingCode(false);
            });
    }, [oobCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setSuccess(true);
        } catch (err) {
            console.error('Password reset failed:', err);
            setError(err.message?.replace('Firebase: ', '') || 'Failed to reset password. Link may have expired.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                {verifyingCode ? (
                    <div className="reset-status-box">
                        <div className="reset-spinner"></div>
                        <p className="status-text">Verifying security token...</p>
                    </div>
                ) : invalidCode ? (
                    <div className="reset-status-box">
                        <div className="status-icon-wrapper error">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <h2>Invalid or Expired Link</h2>
                        <p className="status-subtext">
                            This password reset link is invalid or has expired. Please ask your administrator to send a new password reset email.
                        </p>
                        <Link to="/login" className="reset-action-btn">
                            Return to Login
                        </Link>
                    </div>
                ) : success ? (
                    <div className="reset-status-box">
                        <div className="status-icon-wrapper success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h2>Password Reset Successful!</h2>
                        <p className="status-subtext">
                            Your password for {verifiedEmail ? <strong>{verifiedEmail}</strong> : 'your account'} has been updated successfully.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="reset-action-btn"
                        >
                            Proceed to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="reset-password-form">
                        <div className="reset-header">
                            <span className="reset-badge">Security Reset</span>
                            <h2>Set New Password</h2>
                            {verifiedEmail && (
                                <p className="user-email-tag">
                                    Account: <span>{verifiedEmail}</span>
                                </p>
                            )}
                        </div>

                        {error && <div className="reset-error-banner">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter at least 6 characters"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your new password"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="password-requirements">
                            <div className={`req-item ${newPassword.length >= 6 ? 'met' : ''}`}>
                                <span className="req-dot"></span> At least 6 characters
                            </div>
                            <div className={`req-item ${confirmPassword && newPassword === confirmPassword ? 'met' : ''}`}>
                                <span className="req-dot"></span> Passwords match
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="reset-submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
