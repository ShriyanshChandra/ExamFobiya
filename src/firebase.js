import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBthH_hNLr1qrvHxdz9dQV2P1_p5DI3aDw",
    authDomain: "examfobiya-ae233.firebaseapp.com",
    projectId: "examfobiya-ae233",
    storageBucket: "examfobiya-ae233.firebasestorage.app",
    messagingSenderId: "475827037278",
    appId: "1:475827037278:web:2e570b931a4a0789ef40cf",
    measurementId: "G-872Q0Y2Z6E"
};


const app = initializeApp(firebaseConfig);
// Initialize Firestore
export const db = getFirestore(app);
// Initialize Auth
export const auth = getAuth(app);
// Initialize Storage
export const storage = getStorage(app);
