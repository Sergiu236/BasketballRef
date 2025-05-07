// src/config.ts

// Change this IP address when moving to a different network
const IP_ADDRESS = '192.168.1.161';
const PORT = 3001;

const config = {
  API_URL: `http://${IP_ADDRESS}:${PORT}`,
  PORT: PORT
};

export default config; 
