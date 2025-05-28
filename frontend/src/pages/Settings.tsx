import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TwoFactorSetup from '../components/TwoFactorSetup';
import { getCurrentUser, isAuthenticated } from '../services/authService';
import '../styles/settings.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | '2fa' | 'sessions'>('profile');
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="settings-loading">
        <div className="settings-spinner"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-profile-section">
            <h3 className="settings-profile-title">👤 Profile Information</h3>
            <div className="settings-profile-card">
              <div className="settings-profile-grid">
                <div className="settings-input-group">
                  <label className="settings-input-label">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="settings-input"
                  />
                </div>
                <div className="settings-input-group">
                  <label className="settings-input-label">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="settings-input"
                  />
                </div>
                <div className="settings-input-group">
                  <label className="settings-input-label">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="settings-input"
                  />
                </div>
                <div className="settings-input-group">
                  <label className="settings-input-label">
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={new Date(user.createdAt).toLocaleDateString()}
                    disabled
                    className="settings-input"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case '2fa':
        return (
          <div className="settings-2fa-section">
            <TwoFactorSetup />
          </div>
        );
      
      case 'sessions':
        return (
          <div className="settings-sessions-section">
            <h3 className="settings-sessions-title">🔐 Session Management</h3>
            <div className="settings-sessions-card">
              <p className="settings-sessions-description">
                Manage your active sessions and devices. View all logged-in devices and revoke access when needed.
              </p>
              <button
                onClick={() => navigate('/sessions')}
                className="settings-button"
              >
                🖥️ View Session Management
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-content-wrapper">
        {/* Header */}
        <div className="settings-header-card">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account settings and preferences</p>
        </div>

        {/* Main Card with Tabs */}
        <div className="settings-main-card">
          {/* Tab Navigation */}
          <div className="settings-tab-nav">
            <nav>
              <button
                onClick={() => setActiveTab('profile')}
                className={`settings-tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab('2fa')}
                className={`settings-tab-button ${activeTab === '2fa' ? 'active' : ''}`}
              >
                🔐 Two-Factor Authentication
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`settings-tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
              >
                🖥️ Sessions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="settings-tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 