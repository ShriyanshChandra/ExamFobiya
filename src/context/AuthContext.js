import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (item) => {
            if (item) {
                // User is signed in, fetch additional data (role) from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", item.uid));
                    if (userDoc.exists()) {
                        setUser({ ...item, ...userDoc.data() });
                    } else {
                        // User exists in Auth but not Firestore (e.g. created in Console)
                        // Create default user doc
                        await setDoc(doc(db, "users", item.uid), {
                            email: item.email,
                            role: 'user',
                            username: item.email.split('@')[0],
                            createdAt: new Date()
                        });
                        setUser({ ...item, role: 'user' });
                    }
                } catch (error) {
                    console.error("Error fetching/creating user data:", error);
                    setUser(item);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email, password, role, username) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document with role
        await setDoc(doc(db, "users", result.user.uid), {
            email,
            role,
            username,
            createdAt: new Date()
        });
        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
