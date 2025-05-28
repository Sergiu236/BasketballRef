import React, { useState, useEffect } from 'react';
import { getUserSessions, revokeSession, logoutAllDevices, SessionInfo } from '../services/authService';
import '../styles/sessionManagement.css';

const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const userSessions = await getUserSessions();
      setSessions(userSessions);
      setError(null);
    } catch (err) {
      setError('Failed to load sessions');
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      const success = await revokeSession(sessionId);
      if (success) {
        setSessions(sessions.filter(session => session.id !== sessionId));
      } else {
        setError('Failed to revoke session');
      }
    } catch (err) {
      setError('Failed to revoke session');
      console.error('Error revoking session:', err);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (window.confirm('Are you sure you want to logout from all devices? This will end all your active sessions.')) {
      try {
        await logoutAllDevices();
        // User will be redirected to login page
      } catch (err) {
        setError('Failed to logout from all devices');
        console.error('Error logging out from all devices:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (deviceInfo: string | null) => {
    if (!deviceInfo) return '🖥️';
    const device = deviceInfo.toLowerCase();
    if (device.includes('mobile') || device.includes('android') || device.includes('iphone')) {
      return '📱';
    }
    if (device.includes('tablet') || device.includes('ipad')) {
      return '📱';
    }
    return '🖥️';
  };

  const getDeviceColorClass = (deviceInfo: string | null) => {
    if (!deviceInfo) return 'device-blue';
    const device = deviceInfo.toLowerCase();
    if (device.includes('mobile') || device.includes('android') || device.includes('iphone')) {
      return 'device-green';
    }
    if (device.includes('tablet') || device.includes('ipad')) {
      return 'device-purple';
    }
    return 'device-blue';
  };

  if (loading) {
    return (
      <div className="session-loading-container">
        <div className="session-loading-content">
          <div className="session-spinner"></div>
          <p className="session-loading-text">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-management-container">
      <div className="session-content-wrapper">
        {/* Header */}
        <div className="session-header-card">
          <div className="session-header-content">
            <div>
              <h1 className="session-title">
                Session Management
              </h1>
              <p className="session-subtitle">
                Manage your active sessions and security settings
              </p>
            </div>
            <button
              onClick={handleLogoutAllDevices}
              className="session-logout-all-btn"
            >
              🚪 Logout All Devices
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="session-error-card">
            <div className="session-error-content">
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <p className="session-error-text">{error}</p>
            </div>
          </div>
        )}

        {/* Sessions Overview */}
        <div className="session-overview-card">
          <div className="session-overview-header">
            <div className="session-overview-icon">
              📊
            </div>
            <div>
              <h2 className="session-overview-title">Active Sessions</h2>
              <p className="session-overview-subtitle">
                You have <span className="session-count">{sessions.length}</span> active session{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="session-empty-state">
              <div className="session-empty-icon">
                🔒
              </div>
              <p className="session-empty-title">No active sessions found</p>
              <p className="session-empty-subtitle">All your sessions have been logged out</p>
            </div>
          ) : (
            <div>
              {sessions.map((session, index) => (
                <div key={session.id} className="session-card">
                  <div className="session-card-content">
                    <div className="session-card-main">
                      <div className="session-device-header">
                        <div className={`session-device-icon ${getDeviceColorClass(session.deviceInfo)}`}>
                          {getDeviceIcon(session.deviceInfo)}
                        </div>
                        <div className="session-device-info">
                          <h3>{session.deviceInfo || 'Unknown Device'}</h3>
                          <div className="session-status">
                            <span className="session-status-dot"></span>
                            <span>Active Session</span>
                          </div>
                          <p className="session-location">
                            📍 {session.ipAddress || 'Unknown Location'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="session-details-grid">
                        <div className="session-detail-item">
                          <span className="session-detail-icon detail-icon-blue">
                            🕒
                          </span>
                          <div className="session-detail-content">
                            <p>Last Used</p>
                            <p>{formatDate(session.lastUsedAt)}</p>
                          </div>
                        </div>
                        <div className="session-detail-item">
                          <span className="session-detail-icon detail-icon-orange">
                            ⏰
                          </span>
                          <div className="session-detail-content">
                            <p>Expires</p>
                            <p>{formatDate(session.expiresAt)}</p>
                          </div>
                        </div>
                        {session.userAgent && (
                          <div className="session-detail-item session-browser-detail">
                            <span className="session-detail-icon detail-icon-purple">
                              🌐
                            </span>
                            <div className="session-detail-content">
                              <p>Browser</p>
                              <p>{session.userAgent}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="session-revoke-btn"
                    >
                      🗑️ Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="session-security-tips">
          <div className="session-security-header">
            <div className="session-security-icon">
              🛡️
            </div>
            <div>
              <h3 className="session-security-title">Security Tips</h3>
              <p className="session-security-subtitle">Keep your account secure</p>
            </div>
          </div>
          <div className="session-tips-grid">
            <div className="session-tip-card">
              <div className="session-tip-header">
                <span className="session-tip-icon detail-icon-green">
                  👀
                </span>
                <div className="session-tip-content">
                  <h4>Regular Review</h4>
                  <p>Check your active sessions regularly</p>
                </div>
              </div>
            </div>
            <div className="session-tip-card">
              <div className="session-tip-header">
                <span className="session-tip-icon detail-icon-yellow">
                  🧹
                </span>
                <div className="session-tip-content">
                  <h4>Clean Up</h4>
                  <p>Revoke sessions from unused devices</p>
                </div>
              </div>
            </div>
            <div className="session-tip-card">
              <div className="session-tip-header">
                <span className="session-tip-icon detail-icon-red">
                  🚨
                </span>
                <div className="session-tip-content">
                  <h4>Suspicious Activity</h4>
                  <p>Logout from all devices if you see anything suspicious</p>
                </div>
              </div>
            </div>
            <div className="session-tip-card">
              <div className="session-tip-header">
                <span className="session-tip-icon detail-icon-blue">
                  ⏱️
                </span>
                <div className="session-tip-content">
                  <h4>Auto Expiry</h4>
                  <p>Sessions expire automatically after 7 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;