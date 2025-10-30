
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DemoDashboardPage from './pages/DemoDashboardPage';
import BuilderPage from './pages/BuilderPage';
import NewFactoryPage from './pages/NewFactoryPage';
import ConnectionsPage from './pages/ConnectionsPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoDashboardPage />} />
        <Route path="/dashboards/:id" element={<DashboardPage />} />
        <Route path="/builder/:id" element={<BuilderPage />} />
        <Route path="/factory/new" element={<NewFactoryPage />} />
        <Route path="/admin/connections" element={<ConnectionsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
