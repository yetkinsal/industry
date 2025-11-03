
import React from 'react';
import { Link } from 'react-router-dom';
// Auth disabled - all users have access
// import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border">
        <h2 className="text-xl font-bold text-text-primary">Industrial SQL Dashboard</h2>
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboards"
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboards
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-text-primary tracking-tight">
            Industrial SQL Dashboard
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-text-secondary">
            Monitor your factory's pulse in real-time. A fully modular, easy-to-use dashboard that connects directly to your SQL databases.
          </p>

          <div className="mt-8 space-y-4">
            <Link
              to="/dashboards"
              className="inline-block bg-primary text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-blue-500 transition-transform transform hover:scale-105"
            >
              Go to My Dashboards
            </Link>
            <div className="flex justify-center space-x-4">
              <Link
                to="/factory/new"
                className="text-primary hover:underline text-sm font-medium"
              >
                Create New Factory
              </Link>
              <Link
                to="/admin/connections"
                className="text-primary hover:underline text-sm font-medium"
              >
                Manage Connections
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-bold text-text-primary mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="text-primary text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-text-primary mb-2">SQL-Powered Widgets</h3>
              <p className="text-sm text-text-secondary">
                Write custom SQL queries to visualize your data exactly how you need it
              </p>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="text-primary text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-text-primary mb-2">Secure Connections</h3>
              <p className="text-sm text-text-secondary">
                AES-256 encryption for your database credentials and secure authentication
              </p>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="text-primary text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-text-primary mb-2">Real-Time Updates</h3>
              <p className="text-sm text-text-secondary">
                Auto-refresh widgets to keep your dashboards up-to-date with live data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
