import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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
 * Fetches the current Maintenance Mode status
 */
export const fetchMaintenanceMode = async () => {
    try {
        const response = await fetch(getApiUrl('/api/maintenance-mode')).catch(() => null);
        if (response && response.ok) {
            const data = await response.json();
            return data.maintenanceMode || false;
        }

        const docRef = doc(db, 'stats', 'system_settings');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return snap.data().maintenanceMode || false;
        }
        return false;
    } catch (err) {
        console.error('Failed to fetch maintenance mode status:', err);
        return false;
    }
};

/**
 * Toggles or sets the Maintenance Mode status via Backend API or Firestore fallback
 */
export const setMaintenanceMode = async (enabled) => {
    let backendError = null;

    try {
        const headers = await getAuthHeaders();
        const response = await fetch(getApiUrl('/api/admin/maintenance-mode'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({ enabled: !!enabled })
        });

        if (response.ok) {
            return true;
        }
        const errData = await response.json().catch(() => ({}));
        backendError = errData.error || `HTTP ${response.status}`;
    } catch (err) {
        console.warn('Backend maintenance-mode API failed, trying direct Firestore:', err);
        backendError = err.message;
    }

    try {
        const docRef = doc(db, 'stats', 'system_settings');
        await setDoc(docRef, { 
            maintenanceMode: !!enabled, 
            updatedAt: new Date().toISOString() 
        }, { merge: true });
        return true;
    } catch (firestoreErr) {
        console.error('Firestore direct update for maintenance mode failed:', firestoreErr);
        throw new Error(backendError || firestoreErr.message || 'Failed to update maintenance mode.');
    }
};

/**
 * Subscribes to real-time Maintenance Mode updates
 */
export const subscribeToMaintenanceMode = (callback) => {
    const docRef = doc(db, 'stats', 'system_settings');
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            callback(snap.data().maintenanceMode || false);
        } else {
            callback(false);
        }
    }, (err) => {
        console.error('Maintenance mode listener error:', err);
        callback(false);
    });
};
