import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);

        // Remove all theme classes and apply the current one
        const themeClasses = [
            'dark-mode', 'vintage-mode', 'ocean-mode', 'forest-mode',
            'midnight-mode', 'nord-mode'
        ];
        document.body.classList.remove(...themeClasses);
        if (theme !== 'light') {
            document.body.classList.add(`${theme}-mode`);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
