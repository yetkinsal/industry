import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import apiService, { Dashboard, Factory } from '@/services/apiService';
import { ICONS } from '../constants';

const DashboardsListPage = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    factoryId: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Load dashboards and factories
  useEffect(() => {
    loadData();
  }, [selectedFactoryId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, factoryData] = await Promise.all([
        apiService.getAllDashboards(selectedFactoryId || undefined),
        apiService.getAllFactories(),
      ]);
      setDashboards(dashboardData);
      setFactories(factoryData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDashboard = async () => {
    if (!newDashboard.name.trim()) {
      alert('Dashboard name is required');
      return;
    }
    if (!newDashboard.factoryId) {
      alert('Factory selection is required');
      return;
    }

    try {
      const created = await apiService.createDashboard({
        factoryId: newDashboard.factoryId,
        name: newDashboard.name,
        description: newDashboard.description || undefined,
      });
      setShowNewModal(false);
      setNewDashboard({ name: '', description: '', factoryId: '' });
      loadData();
      // Optionally navigate to builder
      // window.location.hash = `#/builder/${created.id}`;
    } catch (err: any) {
      console.error('Failed to create dashboard:', err);
      alert(`Failed to create dashboard: ${err.message}`);
    }
  };

  const handleDeleteDashboard = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all widgets.`)) {
      return;
    }

    try {
      await apiService.deleteDashboard(id);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete dashboard:', err);
      alert(`Failed to delete dashboard: ${err.message}`);
    }
  };

  const getFactoryName = (factoryId: string) => {
    const factory = factories.find((f) => f.id === factoryId);
    return factory?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-text-primary flex-col">
        <Topbar title="Dashboards" onMenuClick={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-text-primary flex-col">
      <Topbar title="Dashboards" onMenuClick={() => {}} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">My Dashboards</h1>
              <p className="text-sm text-text-secondary mt-1">
                Manage your industrial analytics dashboards
              </p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-500 transition-colors"
            >
              + New Dashboard
            </button>
          </div>

          {/* Factory Filter */}
          {factories.length > 1 && (
            <div className="mb-6">
              <label htmlFor="factory-filter" className="block text-sm font-medium text-text-secondary mb-2">
                Filter by Factory
              </label>
              <select
                id="factory-filter"
                value={selectedFactoryId}
                onChange={(e) => setSelectedFactoryId(e.target.value)}
                className="w-64 bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Factories</option>
                {factories.map((factory) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger rounded-md flex items-center space-x-3">
              <span className="w-6 h-6 text-danger">{ICONS.ALERT_TRIANGLE}</span>
              <div>
                <p className="text-sm font-medium text-danger">Error loading dashboards</p>
                <p className="text-xs text-danger/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          {dashboards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50">
                {ICONS.FACTORY}
              </div>
              <p className="text-text-secondary mb-4">
                {selectedFactoryId ? 'No dashboards found for this factory' : 'No dashboards yet'}
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-500 transition-colors"
              >
                Create Your First Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="bg-surface border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-text-primary line-clamp-1">
                        {dashboard.name}
                      </h3>
                    </div>

                    {dashboard.description && (
                      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                        {dashboard.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-text-secondary mb-4">
                      <div className="flex items-center space-x-1">
                        <span className="w-4 h-4">{ICONS.FACTORY}</span>
                        <span>{getFactoryName(dashboard.factoryId)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{dashboard.widgets?.length || 0} widgets</span>
                      </div>
                    </div>

                    <div className="text-xs text-text-secondary mb-4">
                      <span>Updated {formatDate(dashboard.updatedAt)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/dashboards/${dashboard.id}`}
                        className="flex-1 px-3 py-2 text-sm font-medium text-center bg-primary text-white rounded-md hover:bg-blue-500 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        to={`/builder/${dashboard.id}`}
                        className="flex-1 px-3 py-2 text-sm font-medium text-center bg-surface border border-border text-text-primary rounded-md hover:bg-border transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteDashboard(dashboard.id, dashboard.name)}
                        className="px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-md transition-colors"
                        title="Delete Dashboard"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Dashboard Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Create New Dashboard</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="dashboard-name" className="block text-sm font-medium text-text-secondary mb-1">
                  Dashboard Name *
                </label>
                <input
                  type="text"
                  id="dashboard-name"
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                  placeholder="Production Line A Dashboard"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="dashboard-factory" className="block text-sm font-medium text-text-secondary mb-1">
                  Factory *
                </label>
                <select
                  id="dashboard-factory"
                  value={newDashboard.factoryId}
                  onChange={(e) => setNewDashboard({ ...newDashboard, factoryId: e.target.value })}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a factory...</option>
                  {factories.map((factory) => (
                    <option key={factory.id} value={factory.id}>
                      {factory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dashboard-description" className="block text-sm font-medium text-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  id="dashboard-description"
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                  placeholder="Describe what this dashboard monitors..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={handleCreateDashboard}
                className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-500 transition-colors"
              >
                Create Dashboard
              </button>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewDashboard({ name: '', description: '', factoryId: '' });
                }}
                className="flex-1 px-4 py-2 bg-surface border border-border text-text-primary font-semibold rounded-md hover:bg-border transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardsListPage;
