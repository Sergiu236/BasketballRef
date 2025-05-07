// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import AddReferee from './pages/AddReferee';
import UpdateReferee from './pages/UpdateReferee';
import RefereeDetails from './pages/RefereeDetails';
import StatisticsPage from './pages/StatisticsPage'; // <--
import FileManagement from './pages/FileManagement';
import { connectWebSocket } from './websocket/websocketClient';

const App: React.FC = () => {
  useEffect(() => {
    connectWebSocket();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="add" element={<AddReferee />} />
        <Route path="update/:id" element={<UpdateReferee />} />
        <Route path="referee/:id" element={<RefereeDetails />} />

        {/* NEW: Statistics page */}
        <Route path="statistics" element={<StatisticsPage />} />

        <Route path="files" element={<FileManagement />} />
      </Route>
    </Routes>
  );
};

export default App;
