import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export const trackVisit = async () => {
    try {
        const statsDocRef = doc(db, 'stats', 'general');
        const statsDoc = await getDoc(statsDocRef);

        if (!statsDoc.exists()) {
            // Create the doc if it doesn't exist
            await setDoc(statsDocRef, { visit_count: 1 });
        } else {
            // Increment the count
            await updateDoc(statsDocRef, {
                visit_count: increment(1)
            });
        }
    } catch (error) {
        console.error("Error tracking visit:", error);
    }
};
