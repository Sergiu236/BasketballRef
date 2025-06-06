// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaShieldAlt, FaSignOutAlt, FaUserCog, FaCog } from 'react-icons/fa'; // Add logout, session, and settings icons
import { isAdmin, logout, getCurrentUser } from '../services/authService'; // Import logout and getCurrentUser
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const location = useLocation();
  
  // Check if current user is an admin
  const userIsAdmin = isAdmin();
  const currentUser = getCurrentUser();

  // Închide sidebar-ul la navigare pe ecrane mici
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Funcție pentru a închide sidebar-ul pe dispozitive mobile
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="layout-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="hamburger" onClick={toggleSidebar}>
          ☰
        </div>

        {/* User info section */}
        <div className="user-info">
          <div className="user-avatar">
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <div className="username">{currentUser?.username}</div>
            <div className="user-role">{currentUser?.role}</div>
          </div>
        </div>

        <div className="sidebar-links">
          {/* Adăugăm handleLinkClick la toate link-urile */}
          <Link to="/add" onClick={handleLinkClick}>Add Referee</Link>
          <Link to="/statistics" onClick={handleLinkClick}>Statistics</Link>
          <Link to="/files" onClick={handleLinkClick}>File Management</Link>
          <Link to="/sessions" onClick={handleLinkClick}>
            <FaUserCog /> Session Management
          </Link>
          <Link to="/settings" onClick={handleLinkClick}>
            <FaCog /> Settings
          </Link>
          
          {/* Admin links - only shown for admin users */}
          {userIsAdmin && (
            <>
              <div className="admin-divider">Admin Section</div>
              <Link to="/admin" className="admin-link" onClick={handleLinkClick}>
                <FaShieldAlt /> Admin Dashboard
              </Link>
              <Link to="/admin/monitored-users" className="admin-link" onClick={handleLinkClick}>
                Monitored Users
              </Link>
            </>
          )}
        </div>

        <div className="sidebar-bottom">
          <Link to="/" title="Go to Home" className="home-link" onClick={handleLinkClick}>
            <FaHome size={20} />
          </Link>
          <button 
            onClick={handleLogout} 
            title="Logout" 
            className="logout-button"
          >
            <FaSignOutAlt size={20} />
          </button>
          {userIsAdmin && (
            <div className="admin-badge" title="Admin Account">
              <FaShieldAlt size={16} />
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
