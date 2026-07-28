import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * Fetches the current Maintenance Mode status from Firestore ('stats/system_settings')
 */
export const fetchMaintenanceMode = async () => {
    try {
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
 * Toggles or sets the Maintenance Mode status in Firestore
 */
export const setMaintenanceMode = async (enabled) => {
    try {
        const docRef = doc(db, 'stats', 'system_settings');
        await setDoc(docRef, { 
            maintenanceMode: !!enabled, 
            updatedAt: new Date().toISOString() 
        }, { merge: true });
        return true;
    } catch (err) {
        console.error('Failed to update maintenance mode:', err);
        throw err;
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
