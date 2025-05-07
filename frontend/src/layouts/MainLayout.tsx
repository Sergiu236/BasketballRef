// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa'; // <--- NEW
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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
        </div>

        <div className="sidebar-bottom">
          <Link to="/" title="Go to Home" className="home-link">
            <FaHome size={20} />
          </Link>
        </div>
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
