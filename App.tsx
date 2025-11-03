
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// Auth disabled for now
// import { AuthProvider } from './contexts/AuthContext';
// import ProtectedRoute from './components/auth/ProtectedRoute';
import { FilterProvider } from './contexts/FilterContext';
import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
import BuilderPage from './pages/BuilderPage';
import NewFactoryPage from './pages/NewFactoryPage';
import ConnectionsPage from './pages/ConnectionsPage';
import DashboardPage from './pages/DashboardPage';
import DashboardsListPage from './pages/DashboardsListPage';

function App() {
  return (
    <HashRouter>
      <FilterProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}

          {/* All routes now public (auth disabled) */}
          <Route path="/dashboards" element={<DashboardsListPage />} />
          <Route path="/dashboards/:id" element={<DashboardPage />} />
          <Route path="/builder/:id" element={<BuilderPage />} />
          <Route path="/factory/new" element={<NewFactoryPage />} />
          <Route path="/admin/connections" element={<ConnectionsPage />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </FilterProvider>
    </HashRouter>
  );
}

export default App;
