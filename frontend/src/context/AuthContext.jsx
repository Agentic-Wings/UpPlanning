import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isRemembered, setIsRemembered] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('up_auth');
    const storedTime = localStorage.getItem('up_auth_time');
    const remembered = localStorage.getItem('up_auth_remember') === 'true';
    
    if (storedAuth === 'true' && storedTime) {
      const timeDiff = Date.now() - parseInt(storedTime);
      const sixtyMinutes = 60 * 60 * 1000;
      
      // Even if remembered, it expires after 60 minutes.
      if (timeDiff < sixtyMinutes && remembered) {
        setIsAuthenticated(true);
        setIsRemembered(true);
        setLastActivity(Date.now()); // Reset activity on load
        localStorage.setItem('up_auth_time', Date.now().toString());
      } else {
        logout();
      }
    }
  }, []);

  const login = (remember) => {
    setIsAuthenticated(true);
    setIsRemembered(remember);
    const now = Date.now();
    setLastActivity(now);
    
    if (remember) {
      localStorage.setItem('up_auth', 'true');
      localStorage.setItem('up_auth_time', now.toString());
      localStorage.setItem('up_auth_remember', 'true');
    } else {
      // If not remembered, use sessionStorage so it clears on tab close
      sessionStorage.setItem('up_auth', 'true');
      sessionStorage.setItem('up_auth_time', now.toString());
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsRemembered(false);
    localStorage.removeItem('up_auth');
    localStorage.removeItem('up_auth_time');
    localStorage.removeItem('up_auth_remember');
    sessionStorage.removeItem('up_auth');
    sessionStorage.removeItem('up_auth_time');
  };

  // Handle Inactivity Timeout (60 mins)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInactivity = () => {
      const now = Date.now();
      const timeDiff = now - lastActivity;
      const sixtyMinutes = 60 * 60 * 1000;
      
      if (timeDiff >= sixtyMinutes) {
        logout();
        window.location.href = '/'; // Redirect to landing page
      }
    };

    const interval = setInterval(checkInactivity, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity]);

  // Update activity on user interaction (throttle to avoid too many renders)
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const handleActivity = () => {
      if (timeoutId) return;
      
      timeoutId = setTimeout(() => {
        const now = Date.now();
        setLastActivity(now);
        if (isRemembered) {
          localStorage.setItem('up_auth_time', now.toString());
        } else {
          sessionStorage.setItem('up_auth_time', now.toString());
        }
        timeoutId = null;
      }, 5000); // Throttle updates to every 5s max
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated, isRemembered]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
