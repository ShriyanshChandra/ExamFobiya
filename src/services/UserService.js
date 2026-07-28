import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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
        const userRef = doc(db, 'userId');
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
        const headers = await getAuthHeaders();
        const response = await fetch(getApiUrl('/api/admin/send-password-reset'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, message: data.message || `Password reset email sent to ${email}` };
        } else {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Server error while sending custom password reset email.');
        }
    } catch (backendErr) {
        console.warn('Backend reset email API failed, attempting Firebase Auth fallback:', backendErr);
        // Fallback to Firebase Client Auth SDK only if network/server unavailable
        try {
            await firebaseSendPasswordResetEmail(auth, email);
            return { success: true, message: `Password reset email sent to ${email}` };
        } catch (firebaseErr) {
            console.error('Firebase Auth password reset failed:', firebaseErr);
            throw new Error(firebaseErr.message?.replace('Firebase: ', '') || backendErr.message || 'Failed to send password reset email.');
        }
    }
};
