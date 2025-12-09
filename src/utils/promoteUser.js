import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export const promoteUserToAdmin = async (email) => {
    console.log(`Attempting to promote ${email}...`);
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.warn(`User with email ${email} not found in 'users' collection. They must register first!`);
            return;
        }

        querySnapshot.forEach(async (userDoc) => {
            const userRef = doc(db, "users", userDoc.id);
            await updateDoc(userRef, {
                role: 'admin'
            });
            console.log(`SUCCESS: ${email} has been promoted to ADMIN.`);
            alert(`SUCCESS: ${email} is now an Admin! You can log in to the Admin Portal.`);
        });
    } catch (error) {
        console.error("Error promoting user:", error);
    }
};
