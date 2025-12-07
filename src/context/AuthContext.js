import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (role) => {
        // Mock user object based on role
        // In a real app, this would come from a backend response
        let userData = null;

        if (role === 'developer') {
            userData = { username: 'dev_user', role: 'developer', name: 'Developer Account' };
        } else if (role === 'admin') {
            userData = { username: 'admin_user', role: 'admin', name: 'Admin Account' };
        } else if (role === 'user') {
            userData = { username: 'standard_user', role: 'user', name: 'Standard User' };
        } else {
            console.error("Invalid role attempted");
            return false;
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
