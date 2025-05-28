// Simple test script for authentication endpoints
// Run with: node test-auth.js

const API_BASE = 'http://192.168.189.243:3001/api/auth';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser_' + Date.now(),
        password: 'TestPassword123!',
        email: `test_${Date.now()}@example.com`,
        role: 'Regular'
      })
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful');
      console.log(`   User: ${registerData.user.username}`);
      console.log(`   Access Token: ${registerData.accessToken.substring(0, 20)}...`);
      
      const { accessToken, refreshToken } = registerData;

      // Test 2: Get user profile
      console.log('\n2. Testing profile access...');
      const profileResponse = await fetch(`${API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile access successful');
        console.log(`   Username: ${profileData.user.username}`);
        console.log(`   Role: ${profileData.user.role}`);
      } else {
        console.log('❌ Profile access failed');
      }

      // Test 3: Get active sessions
      console.log('\n3. Testing session listing...');
      const sessionsResponse = await fetch(`${API_BASE}/sessions`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        console.log('✅ Session listing successful');
        console.log(`   Active sessions: ${sessionsData.sessions.length}`);
      } else {
        console.log('❌ Session listing failed');
      }

      // Test 4: Refresh token
      console.log('\n4. Testing token refresh...');
      const refreshResponse = await fetch(`${API_BASE}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        console.log('✅ Token refresh successful');
        console.log(`   New Access Token: ${refreshData.accessToken.substring(0, 20)}...`);
      } else {
        console.log('❌ Token refresh failed');
      }

      // Test 5: Logout
      console.log('\n5. Testing logout...');
      const logoutResponse = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (logoutResponse.ok) {
        console.log('✅ Logout successful');
      } else {
        console.log('❌ Logout failed');
      }

    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.error);
    }

    // Test 6: Login with invalid credentials
    console.log('\n6. Testing invalid login...');
    const invalidLoginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'nonexistent',
        password: 'wrongpassword'
      })
    });

    if (!invalidLoginResponse.ok) {
      console.log('✅ Invalid login correctly rejected');
    } else {
      console.log('❌ Invalid login should have been rejected');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the server is running on http://192.168.189.243:3001');
  }

  console.log('\n🏁 Authentication tests completed!');
}

// Run the tests
testAuth(); 