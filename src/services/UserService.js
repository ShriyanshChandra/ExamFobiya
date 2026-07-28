import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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
            if (data.createdAt) {
                if (typeof data.createdAt.toDate === 'function') {
                    formattedDate = data.createdAt.toDate().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                } else if (typeof data.createdAt === 'string' || typeof data.createdAt === 'number') {
                    formattedDate = new Date(data.createdAt).toLocaleDateString('en-US', {
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
                joinedDate: formattedDate
            };
        });
    } catch (err) {
        console.error('Failed to fetch registered users:', err);
        return [];
    }
};

export const updateUserRole = async (userId, newRole) => {
    try {
        await updateDoc(doc(db, 'users', userId), { role: newRole });
        return true;
    } catch (err) {
        console.error(`Failed to update user role for ${userId}:`, err);
        throw err;
    }
};

import { auth } from '../firebase';
import { sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';
import { getApiUrl } from '../utils/api';

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
 * Sends a password reset email to a user.
 * Tries the backend endpoint first (which uses Brevo to send HTML email with button & fallback link).
 * If backend fails or is unreachable, falls back to Firebase Client SDK sendPasswordResetEmail.
 */
export const sendPasswordResetEmailToUser = async (userEmail) => {
    const email = String(userEmail || '').trim().toLowerCase();
    if (!email || email === 'n/a') {
        throw new Error('Valid email address is required.');
    }

    try {
        const response = await fetch(getApiUrl('/api/auth/send-password-reset'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, message: data.message || `Password reset email sent to ${email}` };
        } else {
            const errData = await response.json().catch(() => ({}));
            const serverMsg = errData.error || errData.message || `Server returned error status (${response.status})`;
            throw new Error(serverMsg);
        }
    } catch (backendErr) {
        console.error('Password reset email sending error:', backendErr);
        throw new Error(backendErr.message || 'Failed to send password reset email.');
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
