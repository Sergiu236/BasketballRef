// Test script pentru 2FA
const speakeasy = require('speakeasy');

// Simulează un secret 2FA (înlocuiește cu secret-ul real din baza de date)
const secret = 'JBSWY3DPEHPK3PXP'; // Exemplu de secret

// Generează un token TOTP pentru testare
const token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});

console.log('Generated TOTP token:', token);

// Verifică token-ul
const verified = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: token,
  window: 2
});

console.log('Token verification result:', verified);

// Test cu un token invalid
const invalidVerified = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: '123456',
  window: 2
});

console.log('Invalid token verification result:', invalidVerified); 