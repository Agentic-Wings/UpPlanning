import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, Calendar, FolderHeart, LayoutDashboard, LogOut, Menu, X, ClipboardList, MessageCircle } from 'lucide-react';
import UpMascot from '../components/UpMascot';
import './DashboardLayout.css';

const DashboardLayout = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <UpMascot size={28} />
          <span className="sidebar-brand animated-gradient-text">UpPlanning</span>
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
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item btn-logout" onClick={() => navigate('/')}>
            <LogOut size={20} />
            <span>Back to Home</span>
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
          <div className="header-actions">
            <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="content-area animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
