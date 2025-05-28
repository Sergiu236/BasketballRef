import config from '../config';

export interface TwoFactorSetupResponse {
  success: boolean;
  message?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
}

export interface TwoFactorStatusResponse {
  success: boolean;
  enabled: boolean;
  hasSecret: boolean;
}

export interface TwoFactorVerificationResponse {
  success: boolean;
  message?: string;
  user?: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  backupCodeUsed?: boolean;
}

export interface BackupCodesResponse {
  success: boolean;
  message?: string;
  backupCodes?: string[];
}

/**
 * Get the current user's 2FA status
 */
export const getTwoFactorStatus = async (): Promise<TwoFactorStatusResponse> => {
  console.log('🔧 [2FA API] getTwoFactorStatus called');
  const accessToken = localStorage.getItem('accessToken');
  console.log('🔧 [2FA API] Access token:', accessToken ? 'Present' : 'Missing');
  
  if (!accessToken) {
    console.log('❌ [2FA API] No access token found');
    throw new Error('Authentication required');
  }

  console.log('🔧 [2FA API] Making request to:', `${config.API_URL}/api/2fa/status`);
  const response = await fetch(`${config.API_URL}/api/2fa/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('🔧 [2FA API] Response status:', response.status);
  console.log('🔧 [2FA API] Response ok:', response.ok);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('💥 [2FA API] Error response:', errorData);
    throw new Error(errorData.message || 'Failed to get 2FA status');
  }

  const result = await response.json();
  console.log('✅ [2FA API] getTwoFactorStatus success:', result);
  return result;
};

/**
 * Generate 2FA setup (QR code and backup codes)
 */
export const generateTwoFactorSetup = async (): Promise<TwoFactorSetupResponse> => {
  console.log('🔧 [2FA API] generateTwoFactorSetup called');
  const accessToken = localStorage.getItem('accessToken');
  console.log('🔧 [2FA API] Access token:', accessToken ? 'Present' : 'Missing');
  
  if (!accessToken) {
    console.log('❌ [2FA API] No access token found');
    throw new Error('Authentication required');
  }

  console.log('🔧 [2FA API] Making request to:', `${config.API_URL}/api/2fa/setup`);
  const response = await fetch(`${config.API_URL}/api/2fa/setup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('🔧 [2FA API] Response status:', response.status);
  console.log('🔧 [2FA API] Response ok:', response.ok);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('💥 [2FA API] Error response:', errorData);
    throw new Error(errorData.message || 'Failed to generate 2FA setup');
  }

  const result = await response.json();
  console.log('✅ [2FA API] generateTwoFactorSetup success:', result);
  return result;
};

/**
 * Enable 2FA after verifying the setup token
 */
export const enableTwoFactor = async (token: string): Promise<{ success: boolean; message?: string }> => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${config.API_URL}/api/2fa/enable`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to enable 2FA');
  }

  return await response.json();
};

/**
 * Verify 2FA token during login
 */
export const verifyTwoFactor = async (userId: number, token: string): Promise<TwoFactorVerificationResponse> => {
  const response = await fetch(`${config.API_URL}/api/2fa/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, token }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to verify 2FA');
  }

  return await response.json();
};

/**
 * Disable 2FA
 */
export const disableTwoFactor = async (currentPassword: string): Promise<{ success: boolean; message?: string }> => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${config.API_URL}/api/2fa/disable`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to disable 2FA');
  }

  return await response.json();
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (): Promise<BackupCodesResponse> => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${config.API_URL}/api/2fa/backup-codes/regenerate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to regenerate backup codes');
  }

  return await response.json();
}; 