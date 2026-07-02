import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, Calendar, FolderHeart, LayoutDashboard, LogOut, Menu, X, ClipboardList, MessageCircle, Palette, Flame } from 'lucide-react';
import UpMascot from '../components/UpMascot';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [streak, setStreak] = React.useState({ currentStreak: 0, isProductiveToday: false });
  const [typewriterText, setTypewriterText] = useState('');
  const fullText = "UpPlanning";

  React.useEffect(() => {
    fetch(`${API_URL}/streaks`)
      .then(res => res.json())
      .then(data => setStreak(data))
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    let timeout;
    let isDeleting = false;
    let currentText = '';
    const typingSpeed = 150;
    const deletingSpeed = 100;
    const pauseTime = 2000;
    
    const type = () => {
      if (!isDeleting) {
        currentText = fullText.substring(0, currentText.length + 1);
        setTypewriterText(currentText);
        if (currentText === fullText) {
          isDeleting = true;
          timeout = setTimeout(type, pauseTime);
        } else {
          timeout = setTimeout(type, typingSpeed);
        }
      } else {
        currentText = fullText.substring(0, currentText.length - 1);
        setTypewriterText(currentText);
        if (currentText === '') {
          isDeleting = false;
          timeout = setTimeout(type, pauseTime);
        } else {
          timeout = setTimeout(type, deletingSpeed);
        }
      }
    };
    
    timeout = setTimeout(type, typingSpeed);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <UpMascot size={28} />
          <span className="sidebar-brand animated-gradient-text">
            {typewriterText}
            <span className="typewriter-cursor">|</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Calendar size={20} />
            <span>Calendar</span>
          </NavLink>
          
          <NavLink to="/dashboard/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <ClipboardList size={20} />
            <span>Tasks</span>
          </NavLink>

          <NavLink to="/dashboard/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <MessageCircle size={20} />
            <span>Chatbot</span>
          </NavLink>

          <NavLink to="/dashboard/storage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <FolderHeart size={20} />
            <span>Storage</span>
          </NavLink>

          <NavLink to="/dashboard/prompts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <LayoutDashboard size={20} />
            <span>Prompt</span>
          </NavLink>

          <NavLink to="/dashboard/drawing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Palette size={20} />
            <span>Drawing Board</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item btn-logout" onClick={() => {
            const isRemembered = localStorage.getItem('up_auth_remember') === 'true';
            if (!isRemembered) {
              logout();
            }
            navigate('/');
          }}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-icon mobile-menu-btn" onClick={toggleSidebar} aria-label="Open menu">
              <Menu size={24} />
            </button>
            <h2>Dashboard</h2>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: streak.isProductiveToday ? 'var(--color-green-bg)' : 'var(--bg-subtle)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: `1px solid ${streak.isProductiveToday ? 'var(--color-green-border)' : 'var(--border-color)'}`,
                color: streak.isProductiveToday ? 'var(--color-green)' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
              title={streak.isProductiveToday ? "Hari ini produktif! Streak aman." : "Lakukan 1 tugas atau chat untuk mengamankan streak hari ini!"}
            >
              <Flame size={16} fill={streak.isProductiveToday ? 'var(--color-green)' : 'none'} className={streak.isProductiveToday ? 'animate-pulse' : ''} />
              {streak.currentStreak}
            </div>
            
            <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="content-area animate-fade-in">
          <Outlet />
        </main>
      </div>
    </motion.div>
  );
};

export default DashboardLayout;
