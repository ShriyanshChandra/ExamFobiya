import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Welcome.css';

const Welcome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [text, setText] = useState('');

    // Determine the full text based on role
    // user.role should start with lowercase 'admin' or 'user'
    const fullText = user?.role === 'admin'
        ? "Welcome Admin !"
        : "Welcome Student !";

    useEffect(() => {
        // Typing animation logic
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index <= fullText.length) {
                setText(fullText.slice(0, index));
                index++;
            } else {
                clearInterval(typingInterval);
            }
        }, 100); // Speed of typing

        // Redirect after 3 seconds (total wait time, overlaps with typing)
        const redirectTimer = setTimeout(() => {
            if (user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }, 3000);

        return () => {
            clearInterval(typingInterval);
            clearTimeout(redirectTimer);
        };
    }, [fullText, navigate, user]);

    return (
        <div className="welcome-container">
            <h1 className="welcome-text">
                {text}
                <span className="cursor">|</span>
            </h1>
        </div>
    );
};

export default Welcome;
