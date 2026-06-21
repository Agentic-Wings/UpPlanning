import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import DashboardLayout from './pages/DashboardLayout';
import CalendarView from './pages/Dashboard/CalendarView';
import AssetStorage from './pages/Dashboard/AssetStorage';
import PromptHub from './pages/Dashboard/PromptHub';
import TasksView from './pages/Dashboard/TasksView';
import BrainstormChat from './pages/Dashboard/BrainstormChat';
import StarBackground from './components/StarBackground';
import Login from './pages/Login/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Landing wrapper to redirect if already authenticated
const LandingWrapper = ({ theme, toggleTheme }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Landing theme={theme} toggleTheme={toggleTheme} />;
};

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <StarBackground theme={theme} />
        <Routes>
          <Route path="/" element={<LandingWrapper theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }>
            <Route index element={<CalendarView />} />
            <Route path="tasks" element={<TasksView />} />
            <Route path="chat" element={<BrainstormChat />} />
            <Route path="storage" element={<AssetStorage />} />
            <Route path="prompts" element={<PromptHub />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
