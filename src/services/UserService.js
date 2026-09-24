import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';
import { getApiUrl } from '../utils/api';

/**
 * Helper to fetch current authenticated user's ID token
 */
const getAuthHeaders = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return {};
    try {
        const token = await currentUser.getIdToken();
        return { 'Authorization': `Bearer ${token}` };
    } catch (err) {
        return {};
    }
};

/**
 * Fetches all registered users from Firestore ('users' collection)
 */
export const fetchRegisteredUsers = async () => {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        return snapshot.docs.map(d => {
            const data = d.data() || {};
            let formattedDate = 'N/A';
            let createdAtTimestamp = 0;
            if (data.createdAt) {
                if (typeof data.createdAt.toDate === 'function') {
                    const dateObj = data.createdAt.toDate();
                    createdAtTimestamp = dateObj.getTime();
                    formattedDate = dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                } else if (typeof data.createdAt === 'string' || typeof data.createdAt === 'number') {
                    const dateObj = new Date(data.createdAt);
                    createdAtTimestamp = isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
                    formattedDate = isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                }
            }

            return {
                id: d.id,
                uid: d.id,
                username: data.username || data.email?.split('@')[0] || 'User',
                email: data.email || 'N/A',
                role: data.role || 'user',
                joinedDate: formattedDate,
                createdAt: createdAtTimestamp
            };
        });
    } catch (err) {
        console.error('Failed to fetch registered users:', err);
        return [];
    }
};

/**
 * Sends a welcome email to a newly registered user via the backend Brevo integration
 */
export const sendWelcomeEmail = async (email, username = '') => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) return;

    try {
        const response = await fetch(getApiUrl('/api/send-welcome-email'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: normalizedEmail,
                username: username || normalizedEmail.split('@')[0]
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.warn('Welcome email request warning:', errData.error || response.status);
        }
    } catch (err) {
        console.warn('Could not dispatch welcome email:', err.message);
    }
};

/**
 * Updates a user's role in Firestore ('users' collection) and optionally dispatches an email notification
 */
export const updateUserRole = async (userId, newRole, userEmail = null, username = null) => {
    try {
        await updateDoc(doc(db, 'users', userId), { role: newRole });

        // Dispatch email notification asynchronously if an email address is provided
        if (userEmail && userEmail !== 'N/A') {
            try {
                const headers = await getAuthHeaders();
                fetch(getApiUrl('/api/admin/notify-role-change'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    body: JSON.stringify({
                        email: userEmail,
                        username: username || userEmail.split('@')[0],
                        newRole
                    })
                }).catch(err => {
                    console.warn('Role notification email dispatch error:', err);
                });
            } catch (notifyErr) {
                console.warn('Role change email warning:', notifyErr);
            }
        }

        return true;
    } catch (err) {
        console.error(`Failed to update user role for ${userId}:`, err);
        throw err;
    }
};

/**
 * Sends a password reset email to a user.
 * Tries the backend endpoint first (which uses Brevo to send HTML email with button & fallback link).
 * If backend fails or is unreachable, falls back to Firebase Client SDK sendPasswordResetEmail.
 */
export const sendPasswordResetEmailToUser = async (userEmail) => {
    const email = String(userEmail || '').trim().toLowerCase();
    if (!email || email === 'n/a') {
        throw new Error('Valid email address is required.');
    }

    let backendErrorMessage = '';

    // 1. Attempt backend custom branded email dispatch
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(getApiUrl('/api/auth/send-password-reset'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            const data = await response.json().catch(() => ({}));
            return {
                success: true,
                message: data.message || `Password reset email sent successfully to ${email}.`
            };
        }

        const errData = await response.json().catch(() => ({}));
        backendErrorMessage = errData.error || errData.message || `Server error (${response.status})`;

        if (response.status === 404 || backendErrorMessage.toLowerCase().includes('no registered auth account')) {
            throw new Error(backendErrorMessage);
        }
    } catch (backendErr) {
        if (backendErr.message && backendErr.message.toLowerCase().includes('no registered auth account')) {
            throw backendErr;
        }
        console.warn('Backend password reset failed, attempting Firebase Auth fallback:', backendErr.message);
        backendErrorMessage = backendErr.message;
    }

    // 2. Direct fallback to Firebase Client SDK
    try {
        const actionCodeSettings = typeof window !== 'undefined' ? {
            url: `${window.location.origin}/reset-password`,
            handleCodeInApp: true
        } : undefined;

        await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
        return {
            success: true,
            message: `Password reset email sent to "${email}" via Firebase Auth.`
        };
    } catch (fbErr) {
        console.error('Firebase Client SDK password reset error:', fbErr);
        if (fbErr.code === 'auth/user-not-found') {
            throw new Error(`No registered Firebase account found for "${email}". The user may have registered with Google Sign-In or another provider.`);
        }
        if (fbErr.code === 'auth/invalid-email') {
            throw new Error(`The email address "${email}" is invalid.`);
        }
        if (fbErr.code === 'auth/too-many-requests') {
            throw new Error(`Too many password reset requests sent to "${email}". Please wait a few minutes and try again.`);
        }
        throw new Error(fbErr.message?.replace('Firebase: ', '') || backendErrorMessage || 'Failed to send password reset email.');
    }
};

/**
 * Deletes a user account via backend admin API or direct Firestore fallback
 */
export const deleteUserAccount = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required.');
    }

    let backendErrorMsg = '';

    try {
        const headers = await getAuthHeaders();
        const response = await fetch(getApiUrl('/api/admin/delete-user'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({ userId })
        });

        if (response.ok) {
            return true;
        }

        const errData = await response.json().catch(() => ({}));
        backendErrorMsg = errData.error || errData.message || `Server error (${response.status})`;
    } catch (err) {
        console.warn('Backend delete-user API call failed, attempting Firestore fallback:', err);
        backendErrorMsg = err.message;
    }

    // Direct Firestore deletion fallback
    try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        return true;
    } catch (firestoreErr) {
        console.error(`Firestore direct delete failed for user ${userId}:`, firestoreErr);
        throw new Error(backendErrorMsg || firestoreErr.message || 'Failed to delete user account.');
    }
};
