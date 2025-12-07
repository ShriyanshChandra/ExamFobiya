import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();

    if (!user) {
        // User is not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // User is logged in but doesn't have the required role
        // Redirect to home or specific unauthorized page
        // For now, redirecting to home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
