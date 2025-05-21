// src/config.ts

// API URLs with environment variable support for production deployment
const getApiUrl = () => {
  // Use environment variable in production (Render), fallback to local dev setup
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development environment
  const IP_ADDRESS = '192.168.69.243'; // IP-ul tău local
  const PORT = 3001;
  return `http://${IP_ADDRESS}:${PORT}`;
};

// Use secure WebSocket (wss://) in production, regular ws:// in development
const getWsUrl = () => {
  const apiUrl = getApiUrl();
  if (apiUrl.startsWith('https://')) {
    // Replace https:// with wss:// for production
    return apiUrl.replace('https://', 'wss://');
  }
  // Replace http:// with ws:// for development
  return apiUrl.replace('http://', 'ws://');
};

const config = {
  API_URL: getApiUrl(),
  WS_URL: getWsUrl()
};

export default config; 