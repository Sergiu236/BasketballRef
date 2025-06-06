import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, isAuthenticated } from '../services/authService';
import TwoFactorVerification from '../components/TwoFactorVerification';
import '../styles/auth.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login({ username, password });
      
      // Check if 2FA is required
      if (result.requiresTwoFactor && result.userId) {
        setRequiresTwoFactor(true);
        setUserId(result.userId);
        setLoading(false);
        return;
      }
      
      // Regular login successful
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSuccess = () => {
    // Navigation will be handled by the auth state change
    navigate('/');
  };

  const handleTwoFactorError = (error: string) => {
    setError(error);
  };

  const handleBackToLogin = () => {
    setRequiresTwoFactor(false);
    setUserId(null);
    setError(null);
  };

  // Show 2FA verification if required
  if (requiresTwoFactor && userId) {
    return (
      <TwoFactorVerification
        userId={userId}
        onSuccess={handleTwoFactorSuccess}
        onError={handleTwoFactorError}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="text-center mt-4">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="auth-link">
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 