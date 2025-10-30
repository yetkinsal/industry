
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService, { Connection, Factory } from '@/services/apiService';

type ModalMode = 'add' | 'edit' | null;

interface ConnectionForm {
  factoryId: string;
  name: string;
  dbType: 'postgres' | 'mysql' | 'mssql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

const ConnectionsPage = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ConnectionForm>({
    factoryId: '',
    name: '',
    dbType: 'postgres',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connectionsData, factoriesData] = await Promise.all([
        apiService.getAllConnections(),
        apiService.getAllFactories(),
      ]);
      setConnections(connectionsData);
      setFactories(factoriesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      factoryId: factories[0]?.id || '',
      name: '',
      dbType: 'postgres',
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
    });
    setModalMode('add');
    setError('');
  };

  const handleEdit = (connection: Connection) => {
    setFormData({
      factoryId: connection.factoryId,
      name: connection.name,
      dbType: connection.dbType,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: '',
      password: '',
    });
    setEditingId(connection.id);
    setModalMode('edit');
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.database || !formData.username) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (modalMode === 'add') {
        await apiService.createConnection(formData);
      } else if (modalMode === 'edit' && editingId) {
        // Only send password if it's been changed
        const updateData = formData.password
          ? formData
          : { ...formData, password: undefined };
        await apiService.updateConnection(editingId, updateData);
      }
      await fetchData();
      setModalMode(null);
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save connection');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteConnection(id);
      await fetchData();
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete connection');
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const result = await apiService.testSavedConnection(id);
      if (result.success) {
        alert('Connection successful!');
      } else {
        alert(`Connection failed: ${result.error}`);
      }
    } catch (err: any) {
      alert(`Connection test failed: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'port' ? parseInt(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const getFactoryName = (factoryId: string) => {
    return factories.find(f => f.id === factoryId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Database Connections</h1>
            <p className="text-text-secondary mt-1">Manage SQL database connections for your factories</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/"
              className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300"
            >
              Back to Home
            </Link>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              + Add Connection
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Connections Table */}
        {connections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-text-secondary mb-4">No database connections configured yet</p>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Add Your First Connection
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Factory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Database
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {connections.map((connection) => (
                  <tr key={connection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">{connection.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {getFactoryName(connection.factoryId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {connection.dbType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {connection.host}:{connection.port}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {connection.database}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleTest(connection.id)}
                        disabled={testingId === connection.id}
                        className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                      >
                        {testingId === connection.id ? 'Testing...' : 'Test'}
                      </button>
                      <button
                        onClick={() => handleEdit(connection)}
                        className="text-primary hover:text-primary-dark mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(connection.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  {modalMode === 'add' ? 'Add New Connection' : 'Edit Connection'}
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Factory *
                    </label>
                    <select
                      name="factoryId"
                      value={formData.factoryId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {factories.map((factory) => (
                        <option key={factory.id} value={factory.id}>
                          {factory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Connection Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g., Production Database"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Database Type *
                    </label>
                    <select
                      name="dbType"
                      value={formData.dbType}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="postgres">PostgreSQL</option>
                      <option value="mysql" disabled>MySQL (Coming Soon)</option>
                      <option value="mssql" disabled>MS SQL Server (Coming Soon)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Host *
                      </label>
                      <input
                        type="text"
                        name="host"
                        value={formData.host}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Port *
                      </label>
                      <input
                        type="number"
                        name="port"
                        value={formData.port}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Database Name *
                    </label>
                    <input
                      type="text"
                      name="database"
                      value={formData.database}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Password {modalMode === 'edit' ? '(leave blank to keep unchanged)' : '*'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setModalMode(null);
                      setEditingId(null);
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    {modalMode === 'add' ? 'Add Connection' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">Confirm Deletion</h3>
              <p className="text-text-secondary mb-6">
                Are you sure you want to delete this connection? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;
