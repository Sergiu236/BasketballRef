// src/config.ts

// Change this IP address when moving to a different network
const IP_ADDRESS = '192.168.189.243';
const PORT = 3001;

const config = {
  API_URL: `http://${IP_ADDRESS}:${PORT}`,
  PORT: PORT
};

export default config; 
