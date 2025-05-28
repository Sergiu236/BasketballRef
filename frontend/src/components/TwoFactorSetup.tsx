import React, { useState, useEffect } from 'react';
import {
  getTwoFactorStatus,
  generateTwoFactorSetup,
  enableTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
} from '../services/twoFactorService';

const TwoFactorSetup: React.FC = () => {
  const [status, setStatus] = useState({ enabled: false, hasSecret: false });
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{
    qrCodeUrl?: string;
    backupCodes?: string[];
  } | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'disable'>('status');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      console.log('🔧 [2FA FRONTEND] loadStatus called');
      setLoading(true);
      const statusData = await getTwoFactorStatus();
      console.log('🔧 [2FA FRONTEND] getTwoFactorStatus response:', statusData);
      setStatus(statusData);
      console.log('✅ [2FA FRONTEND] Status loaded successfully');
    } catch (err) {
      console.error('💥 [2FA FRONTEND] Error in loadStatus:', err);
      setError(err instanceof Error ? err.message : 'Failed to load 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSetup = async () => {
    try {
      console.log('🔧 [2FA FRONTEND] handleGenerateSetup called - Enable 2FA button clicked');
      setLoading(true);
      setError(null);
      console.log('🔧 [2FA FRONTEND] Calling generateTwoFactorSetup API...');
      const setup = await generateTwoFactorSetup();
      console.log('🔧 [2FA FRONTEND] generateTwoFactorSetup response:', setup);
      setSetupData(setup);
      setStep('setup');
      console.log('✅ [2FA FRONTEND] Setup generated successfully, changed step to setup');
    } catch (err) {
      console.error('💥 [2FA FRONTEND] Error in handleGenerateSetup:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationToken.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await enableTwoFactor(verificationToken);
      setSuccess('Two-factor authentication enabled successfully!');
      setStep('status');
      await loadStatus();
      setVerificationToken('');
      setSetupData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!currentPassword.trim()) {
      setError('Please enter your current password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await disableTwoFactor(currentPassword);
      setSuccess('Two-factor authentication disabled successfully!');
      setStep('status');
      await loadStatus();
      setCurrentPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await regenerateBackupCodes();
      setSetupData({ backupCodes: result.backupCodes });
      setSuccess('Backup codes regenerated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationToken(value);
  };

  const renderStatus = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
      
      {status.enabled ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-800">
                Two-factor authentication is enabled
              </h4>
              <p className="text-sm text-green-700">
                Your account is protected with two-factor authentication.
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleRegenerateBackupCodes}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
              disabled={loading}
            >
              Regenerate Backup Codes
            </button>
            <button
              onClick={() => setStep('disable')}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              Disable 2FA
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Two-factor authentication is disabled
              </h4>
              <p className="text-sm text-yellow-700">
                Enable 2FA to add an extra layer of security to your account.
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleGenerateSetup}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              disabled={loading}
            >
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Set up Two-Factor Authentication</h3>
        <button
          onClick={() => setStep('status')}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Step 1: Scan QR Code</h4>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with Microsoft Authenticator or any other TOTP authenticator app:
          </p>
          {setupData?.qrCodeUrl && (
            <div className="flex justify-center">
              <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="border rounded-lg" />
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Step 2: Save Backup Codes</h4>
          <p className="text-sm text-gray-600 mb-4">
            Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device:
          </p>
          {setupData?.backupCodes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setStep('verify')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Continue to Verification
          </button>
        </div>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Verify Setup</h3>
        <button
          onClick={() => setStep('setup')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-4">
          Enter the 6-digit code from your authenticator app to complete the setup:
        </p>
        
        <div className="space-y-4">
          <input
            type="text"
            value={verificationToken}
            onChange={handleTokenChange}
            placeholder="000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono"
            maxLength={6}
            autoFocus
          />
          
          <button
            onClick={handleVerifyAndEnable}
            disabled={loading || verificationToken.length !== 6}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Enable Two-Factor Authentication'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDisable = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Disable Two-Factor Authentication</h3>
        <button
          onClick={() => setStep('status')}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">
          <strong>Warning:</strong> Disabling two-factor authentication will make your account less secure.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter your current password to confirm:
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Current password"
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('status')}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleDisable}
          disabled={loading || !currentPassword.trim()}
          className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Disabling...' : 'Disable 2FA'}
        </button>
      </div>
    </div>
  );

  const renderBackupCodes = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">New Backup Codes</h3>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700 mb-4">
          Your new backup codes have been generated. Save them in a safe place:
        </p>
        {setupData?.backupCodes && (
          <div className="bg-white p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded border text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setSetupData(null);
          setStep('status');
        }}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Done
      </button>
    </div>
  );

  if (loading && step === 'status') {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {step === 'status' && renderStatus()}
      {step === 'setup' && renderSetup()}
      {step === 'verify' && renderVerify()}
      {step === 'disable' && renderDisable()}
      {setupData?.backupCodes && step === 'status' && renderBackupCodes()}
    </div>
  );
};

export default TwoFactorSetup; 