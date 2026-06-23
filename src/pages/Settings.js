import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

/* ─── SVG Icons ───────────────────────────────────────────────── */
const IconUser = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const IconLock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const IconEye = ({ off }) => (
    off
        ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
);

const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconArrowRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const IconMail = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const IconCalendar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IconEdit = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

/* ─── Account Panel ───────────────────────────────────────────── */
const AccountPanel = ({ user, updateUsername }) => {
    const initials = (user?.username || user?.email || '?').charAt(0).toUpperCase();

    const joinDate = user?.createdAt
        ? new Date(
            user.createdAt.seconds
                ? user.createdAt.seconds * 1000
                : user.createdAt
          ).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'N/A';

    const [editing, setEditing] = useState(false);
    const [draftUsername, setDraftUsername] = useState(user?.username || '');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleEdit = () => {
        setDraftUsername(user?.username || '');
        setSaveError('');
        setSaveSuccess(false);
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setSaveError('');
    };

    const handleSave = async () => {
        const trimmed = draftUsername.trim();
        if (!trimmed) { setSaveError('Username cannot be empty.'); return; }
        if (trimmed.length < 3) { setSaveError('Username must be at least 3 characters.'); return; }
        setSaveError('');
        setSaving(true);
        try {
            await updateUsername(trimmed);
            setSaveSuccess(true);
            setEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            setSaveError(e.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-panel">
            <div className="settings-panel-header">
                <h2>Account Details</h2>
                <p>Your profile information and account summary.</p>
            </div>

            {/* Avatar card */}
            <div className="settings-avatar-card">
                <div className="settings-avatar-ring">
                    <div className="settings-avatar henny-penny">{initials}</div>
                </div>
                <div className="settings-avatar-info">
                    <span className="settings-avatar-name">{user?.username || 'Unknown User'}</span>
                    <span className="settings-avatar-role">
                        {user?.role === 'admin' ? 'Administrator' : 'Reader'}
                    </span>
                </div>
            </div>

            {saveSuccess && (
                <div className="settings-alert settings-alert--success">
                    <IconCheck /> Username updated successfully!
                </div>
            )}

            {/* Info rows */}
            <div className="settings-info-grid">

                {/* Username (editable) */}
                <div className="settings-info-row">
                    <div className="settings-info-icon"><IconUser /></div>
                    <div className="settings-info-body" style={{ flex: 1, minWidth: 0 }}>
                        <span className="settings-info-label">Username</span>
                        {editing ? (
                            <div className="settings-username-edit">
                                <input
                                    id="settings-username-input"
                                    className="settings-username-input"
                                    type="text"
                                    value={draftUsername}
                                    onChange={e => setDraftUsername(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') handleCancel();
                                    }}
                                    autoFocus
                                    maxLength={30}
                                />
                                {saveError && (
                                    <span className="settings-username-error">{saveError}</span>
                                )}
                                <div className="settings-username-actions">
                                    <button
                                        id="settings-save-username-btn"
                                        className="settings-btn settings-btn--primary settings-btn--sm"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? <span className="settings-spinner" />
                                            : <><IconCheck /><span>Save</span></>
                                        }
                                    </button>
                                    <button
                                        className="settings-link-btn"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <span className="settings-info-value">
                                {user?.username || '—'}
                            </span>
                        )}
                    </div>
                    {!editing && (
                        <button
                            id="settings-edit-username-btn"
                            className="settings-edit-btn"
                            onClick={handleEdit}
                            title="Edit username"
                            style={{ alignSelf: 'center' }}
                        >
                            <IconEdit />
                        </button>
                    )}
                </div>

                {/* Email */}
                <div className="settings-info-row">
                    <div className="settings-info-icon"><IconMail /></div>
                    <div className="settings-info-body">
                        <span className="settings-info-label">Email Address</span>
                        <span className="settings-info-value">{user?.email || '—'}</span>
                    </div>
                </div>

                {/* Member Since */}
                <div className="settings-info-row">
                    <div className="settings-info-icon"><IconCalendar /></div>
                    <div className="settings-info-body">
                        <span className="settings-info-label">Member Since</span>
                        <span className="settings-info-value">{joinDate}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

/* ─── Reset Password Panel ────────────────────────────────────── */
const ResetPasswordPanel = ({ user, checkAccountExists }) => {
    const [step, setStep] = useState('idle'); // idle | otp | new-pass | done
    const [otp, setOtp] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) return undefined;
        const t = setInterval(() => {
            setResendTimer(c => {
                if (c <= 1) { clearInterval(t); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [resendTimer]);

    const fmt = s =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const sendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const exists = await checkAccountExists(user.email);
            if (!exists) throw new Error('Account not found.');
            const res = await fetch(getApiUrl('/send-otp'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, purpose: 'reset-password' }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Failed to send OTP');
            }
            setResendTimer(120);
            setStep('otp');
        } catch (e) {
            setError(e.message);
            setStep('idle');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = e => {
        e.preventDefault();
        setError('');
        if (otp.length !== 6) { setError('Please enter a valid 6-digit code.'); return; }
        setStep('new-pass');
    };

    const resetPassword = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
        if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, otp, newPassword: newPass }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Reset failed');
            }
            setSuccess('Password updated successfully!');
            setStep('done');
            setOtp('');
            setNewPass('');
            setConfirmPass('');
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const score = newPass.length < 6 ? 0
        : newPass.length < 9 ? 1
        : /[A-Z]/.test(newPass) && /\d/.test(newPass) ? 3
        : 2;

    const scoreLabel = newPass.length === 0 ? ''
        : score === 0 ? 'Weak'
        : score === 1 ? 'Fair'
        : score === 2 ? 'Good'
        : 'Strong';

    return (
        <div className="settings-panel">
            <div className="settings-panel-header">
                <h2>Reset Password</h2>
                <p>Change your account password securely via a one-time verification code.</p>
            </div>

            {error && <div className="settings-alert settings-alert--error">{error}</div>}
            {success && (
                <div className="settings-alert settings-alert--success">
                    <IconCheck />{success}
                </div>
            )}

            {/* idle / done */}
            {(step === 'idle' || step === 'done') && (
                <div className="settings-reset-start">
                    <div className="settings-reset-email-display">
                        <IconMail />
                        <span>
                            We'll send a verification code to <strong>{user?.email}</strong>
                        </span>
                    </div>
                    <button
                        id="settings-send-otp-btn"
                        className="settings-btn settings-btn--primary"
                        onClick={sendOtp}
                        disabled={loading}
                    >
                        {loading
                            ? <span className="settings-spinner" />
                            : <><IconLock /><span>Send Verification Code</span><IconArrowRight /></>
                        }
                    </button>
                </div>
            )}

            {/* sending */}
            {step === 'sending' && (
                <div className="settings-loading-state">
                    <span className="settings-spinner settings-spinner--lg" />
                    <p>Sending verification code…</p>
                </div>
            )}

            {/* OTP */}
            {step === 'otp' && (
                <form onSubmit={verifyOtp} className="settings-form">
                    <p className="settings-form-hint">
                        A 6-digit code was sent to <strong>{user?.email}</strong>. Enter it below.
                    </p>
                    <div className="settings-field">
                        <label htmlFor="settings-otp-input">Verification Code</label>
                        <input
                            id="settings-otp-input"
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="• • • • • •"
                            maxLength={6}
                            className="settings-otp-input"
                            required
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        id="settings-verify-otp-btn"
                        className="settings-btn settings-btn--primary"
                    >
                        Verify Code <IconArrowRight />
                    </button>
                    <div className="settings-resend-row">
                        {resendTimer > 0
                            ? <span className="settings-timer">Resend available in {fmt(resendTimer)}</span>
                            : <span>Didn't receive the code?</span>
                        }
                        <button
                            type="button"
                            id="settings-resend-btn"
                            className="settings-link-btn"
                            onClick={sendOtp}
                            disabled={loading || resendTimer > 0}
                        >
                            {loading ? 'Sending…' : 'Resend'}
                        </button>
                    </div>
                </form>
            )}

            {/* New password */}
            {step === 'new-pass' && (
                <form onSubmit={resetPassword} className="settings-form">
                    <p className="settings-form-hint">Choose a strong new password for your account.</p>

                    <div className="settings-field">
                        <label htmlFor="settings-new-pass">New Password</label>
                        <div className="settings-pass-wrapper">
                            <input
                                id="settings-new-pass"
                                type={showPass ? 'text' : 'password'}
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                placeholder="At least 6 characters"
                                required
                                autoFocus
                            />
                            <button
                                type="button"
                                className="settings-eye-btn"
                                onClick={() => setShowPass(p => !p)}
                            >
                                <IconEye off={showPass} />
                            </button>
                        </div>
                    </div>

                    <div className="settings-field">
                        <label htmlFor="settings-confirm-pass">Confirm Password</label>
                        <div className="settings-pass-wrapper">
                            <input
                                id="settings-confirm-pass"
                                type={showPass ? 'text' : 'password'}
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                placeholder="Repeat new password"
                                required
                            />
                        </div>
                    </div>

                    {/* Strength indicator */}
                    <div className="settings-strength">
                        {[0, 1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`settings-strength-bar${newPass.length > 0 && i <= score ? ` active-${score}` : ''}`}
                            />
                        ))}
                        <span className="settings-strength-label">{scoreLabel}</span>
                    </div>

                    <button
                        type="submit"
                        id="settings-reset-pass-btn"
                        className="settings-btn settings-btn--primary"
                        disabled={loading}
                    >
                        {loading
                            ? <span className="settings-spinner" />
                            : <><IconCheck /><span>Update Password</span></>
                        }
                    </button>
                    <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() => { setStep('idle'); setError(''); }}
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
};

/* ─── Nav items ───────────────────────────────────────────────── */
const MENU_ITEMS = [
    { id: 'account',        label: 'Account',       icon: <IconUser /> },
    { id: 'reset-password', label: 'Reset Password', icon: <IconLock /> },
];

/* ─── Main Settings Page ──────────────────────────────────────── */
const Settings = () => {
    const { user, checkAccountExists, updateUsername } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('account');

    if (!user) {
        navigate('/login');
        return null;
    }

    const sidebarInitial = (user?.username || user?.email || '?').charAt(0).toUpperCase();

    return (
        <div className="settings-page">
            <div className="settings-shell">

                {/* Left Aside */}
                <aside className="settings-aside">
                    <div className="settings-aside-top">
                        <div className="settings-aside-avatar henny-penny">
                            {sidebarInitial}
                        </div>
                        <div className="settings-aside-user">
                            <span className="settings-aside-name">{user?.username || 'User'}</span>
                            <span className="settings-aside-email">{user?.email}</span>
                        </div>
                    </div>

                    <nav className="settings-nav" aria-label="Settings navigation">
                        <p className="settings-nav-label">Preferences</p>
                        {MENU_ITEMS.map(item => (
                            <button
                                key={item.id}
                                id={`settings-nav-${item.id}`}
                                className={`settings-nav-item${activeSection === item.id ? ' active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <span className="settings-nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                                {activeSection === item.id && <span className="settings-nav-dot" />}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="settings-main">
                    {activeSection === 'account' && (
                        <AccountPanel user={user} updateUsername={updateUsername} />
                    )}
                    {activeSection === 'reset-password' && (
                        <ResetPasswordPanel user={user} checkAccountExists={checkAccountExists} />
                    )}
                </main>

            </div>
        </div>
    );
};

export default Settings;
