import React, { useState } from 'react';
import { verifyTwoFactor } from '../services/twoFactorService';
import '../styles/auth.css';

interface TwoFactorVerificationProps {
  userId: number;
  onSuccess: (user: any, tokens: any) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  userId,
  onSuccess,
  onError,
  onBack,
}) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!token.trim()) {
      setError('Please enter your verification code');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyTwoFactor(userId, token.trim());
      
      if (result.success && result.user && result.tokens) {
        // Save tokens to localStorage
        localStorage.setItem('accessToken', result.tokens.accessToken);
        localStorage.setItem('refreshToken', result.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Dispatch auth event to notify components
        window.dispatchEvent(new Event('auth-change'));
        
        onSuccess(result.user, result.tokens);
        
        if (result.backupCodeUsed) {
          alert('You used a backup code. Consider regenerating your backup codes for security.');
        }
      } else {
        setError('Verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      onError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>
          Two-Factor Authentication
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
          Enter the 6-digit code from your authenticator app
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={token}
              onChange={handleTokenChange}
              placeholder="000000"
              className="auth-input"
              style={{ 
                textAlign: 'center', 
                fontSize: '1.5rem', 
                letterSpacing: '0.5rem',
                fontFamily: 'monospace'
              }}
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ 
              color: '#e74c3c', 
              marginBottom: '1rem', 
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading || token.length !== 6}
            style={{
              opacity: loading || token.length !== 6 ? 0.6 : 1,
              cursor: loading || token.length !== 6 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#8a4baf',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            disabled={loading}
          >
            Back to Login
          </button>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          fontSize: '0.85rem',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
            Having trouble?
          </p>
          <p style={{ margin: 0 }}>
            • Make sure your device's time is correct<br/>
            • Try using a backup code if available<br/>
            • Contact support if you've lost access to your authenticator
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification; 