// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { RefereeProvider } from './context/RefereeContext';

// 1) IMPORT your websocket client
import { connectWebSocket } from './websocket/websocketClient';

function initApp() {
  // 2) CALL connectWebSocket once at startup
  connectWebSocket();

  // 3) Render your React app
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <BrowserRouter>
      <RefereeProvider>
        <App />
      </RefereeProvider>
    </BrowserRouter>
  );
}

initApp();
