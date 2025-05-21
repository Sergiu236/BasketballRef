// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaHome, FaShieldAlt } from 'react-icons/fa'; // Add FaShieldAlt for admin icon
import { isAdmin } from '../services/authService'; // Import isAdmin helper
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  
  // Check if current user is an admin
  const userIsAdmin = isAdmin();

  return (
    <div className="layout-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="hamburger" onClick={toggleSidebar}>
          ☰
        </div>

        <div className="sidebar-links">
          {/* Existing links */}
          <Link to="/add">Add Referee</Link>
          <Link to="/statistics">Statistics</Link>
          <Link to="/files">File Management</Link>
          
          {/* Admin links - only shown for admin users */}
          {userIsAdmin && (
            <>
              <div className="admin-divider">Admin Section</div>
              <Link to="/admin" className="admin-link">
                <FaShieldAlt /> Admin Dashboard
              </Link>
              <Link to="/admin/monitored-users" className="admin-link">
                Monitored Users
              </Link>
            </>
          )}
        </div>

        <div className="sidebar-bottom">
          <Link to="/" title="Go to Home" className="home-link">
            <FaHome size={20} />
          </Link>
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
