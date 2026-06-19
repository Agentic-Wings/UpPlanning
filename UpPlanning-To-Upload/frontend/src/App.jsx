import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import DashboardLayout from './pages/DashboardLayout';
import CalendarView from './pages/Dashboard/CalendarView';
import AssetStorage from './pages/Dashboard/AssetStorage';
import PromptHub from './pages/Dashboard/PromptHub';
import TasksView from './pages/Dashboard/TasksView';
import BrainstormChat from './pages/Dashboard/BrainstormChat';
import StarBackground from './components/StarBackground';

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
      <StarBackground theme={theme} />
      <Routes>
        <Route path="/" element={<Landing theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/dashboard" element={<DashboardLayout theme={theme} toggleTheme={toggleTheme} />}>
          <Route index element={<CalendarView />} />
          <Route path="tasks" element={<TasksView />} />
          <Route path="chat" element={<BrainstormChat />} />
          <Route path="storage" element={<AssetStorage />} />
          <Route path="prompts" element={<PromptHub />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
