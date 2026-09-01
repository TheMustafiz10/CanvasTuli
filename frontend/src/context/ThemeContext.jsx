


// eslint-disable-next-line no-unused-vars
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('canvas-tulika-theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('canvas-tulika-theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    if (newTheme) setTheme(newTheme);
    else {
      const cycles = ['light', 'dark', 'sepia'];
      const currentIndex = cycles.indexOf(theme);
      const next = cycles[(currentIndex + 1) % cycles.length];
      setTheme(next);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};



// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};