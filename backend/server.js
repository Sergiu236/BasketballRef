// Simple server.js file to run the backend with Node.js
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting backend server...');

// Use ts-node to run the TypeScript file
const tsNode = spawn('npx', ['ts-node', path.join(__dirname, 'src', 'index.ts')], {
  stdio: 'inherit',
  shell: true
});

tsNode.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  tsNode.kill('SIGINT');
  process.exit(0);
}); 