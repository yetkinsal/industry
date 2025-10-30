
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/apiService';

type Step = 1 | 2 | 3 | 4;

interface FactoryData {
  name: string;
  location: string;
  timezone: string;
}

interface ConnectionData {
  name: string;
  dbType: 'postgres' | 'mysql' | 'mssql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

const NewFactoryPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Form data
  const [factoryData, setFactoryData] = useState<FactoryData>({
    name: '',
    location: '',
    timezone: 'America/New_York',
  });

  const [connectionData, setConnectionData] = useState<ConnectionData>({
    name: 'Production Database',
    dbType: 'postgres',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });

  const handleFactoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFactoryData({ ...factoryData, [e.target.name]: e.target.value });
  };

  const handleConnectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'port' ? parseInt(e.target.value) : e.target.value;
    setConnectionData({ ...connectionData, [e.target.name]: value });
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setError('');

    try {
      const result = await apiService.testConnection({
        dbType: connectionData.dbType,
        host: connectionData.host,
        port: connectionData.port,
        database: connectionData.database,
        username: connectionData.username,
        password: connectionData.password,
      });

      if (result.success) {
        setTestStatus('success');
        setTimeout(() => setCurrentStep(4), 1500);
      } else {
        setTestStatus('error');
        setError(result.error || 'Connection test failed');
      }
    } catch (err: any) {
      setTestStatus('error');
      setError(err.message || 'Connection test failed');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Create factory
      const factory = await apiService.createFactory(factoryData);

      // Create connection
      await apiService.createConnection({
        factoryId: factory.id,
        ...connectionData,
      });

      // Create default dashboard
      const dashboard = await apiService.createDashboard({
        factoryId: factory.id,
        name: 'Production Analysis',
        description: 'Main production dashboard',
      });

      // Navigate to builder
      navigate(`/builder/${dashboard.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create factory');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!factoryData.name || !factoryData.location)) {
      setError('Please fill in all factory fields');
      return;
    }
    if (currentStep === 2 && (!connectionData.host || !connectionData.database || !connectionData.username)) {
      setError('Please fill in all connection fields');
      return;
    }
    setError('');
    setCurrentStep((currentStep + 1) as Step);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((currentStep - 1) as Step);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-text-primary mb-2">Onboard New Factory</h1>
        <p className="text-text-secondary mb-8">Set up your factory and database connection</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                <span className="text-xs mt-2 text-text-secondary">
                  {step === 1 && 'Factory Info'}
                  {step === 2 && 'Database'}
                  {step === 3 && 'Test'}
                  {step === 4 && 'Review'}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Factory Information */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Factory Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Factory Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={factoryData.name}
                  onChange={handleFactoryChange}
                  placeholder="e.g., Alpha Factory"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={factoryData.location}
                  onChange={handleFactoryChange}
                  placeholder="e.g., Detroit, MI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Timezone *
                </label>
                <select
                  name="timezone"
                  value={factoryData.timezone}
                  onChange={handleFactoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Detroit">Detroit</option>
                  <option value="America/Phoenix">Phoenix</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Database Connection */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Connection Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={connectionData.name}
                  onChange={handleConnectionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Database Type *
                </label>
                <select
                  name="dbType"
                  value={connectionData.dbType}
                  onChange={handleConnectionChange}
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
                    value={connectionData.host}
                    onChange={handleConnectionChange}
                    placeholder="localhost"
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
                    value={connectionData.port}
                    onChange={handleConnectionChange}
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
                  value={connectionData.database}
                  onChange={handleConnectionChange}
                  placeholder="production_data"
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
                  value={connectionData.username}
                  onChange={handleConnectionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={connectionData.password}
                  onChange={handleConnectionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Test Connection */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Connection</h2>
            <div className="text-center py-8">
              {testStatus === 'idle' && (
                <div>
                  <p className="text-text-secondary mb-6">
                    Ready to test the database connection
                  </p>
                  <button
                    onClick={handleTestConnection}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Test Connection
                  </button>
                </div>
              )}
              {testStatus === 'testing' && (
                <div>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-text-secondary">Testing connection...</p>
                </div>
              )}
              {testStatus === 'success' && (
                <div>
                  <div className="text-green-500 text-6xl mb-4">✓</div>
                  <p className="text-green-600 font-semibold">Connection Successful!</p>
                  <p className="text-text-secondary mt-2">Proceeding to review...</p>
                </div>
              )}
              {testStatus === 'error' && (
                <div>
                  <div className="text-red-500 text-6xl mb-4">✗</div>
                  <p className="text-red-600 font-semibold">Connection Failed</p>
                  <p className="text-text-secondary mt-2">{error}</p>
                  <button
                    onClick={() => prevStep()}
                    className="mt-4 px-6 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300"
                  >
                    Back to Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review and Submit */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review and Confirm</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Factory Information</h3>
                <div className="text-sm space-y-1 text-text-secondary">
                  <p><strong>Name:</strong> {factoryData.name}</p>
                  <p><strong>Location:</strong> {factoryData.location}</p>
                  <p><strong>Timezone:</strong> {factoryData.timezone}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Database Connection</h3>
                <div className="text-sm space-y-1 text-text-secondary">
                  <p><strong>Name:</strong> {connectionData.name}</p>
                  <p><strong>Type:</strong> {connectionData.dbType.toUpperCase()}</p>
                  <p><strong>Host:</strong> {connectionData.host}:{connectionData.port}</p>
                  <p><strong>Database:</strong> {connectionData.database}</p>
                  <p><strong>Username:</strong> {connectionData.username}</p>
                  <p className="text-green-600 flex items-center gap-2 mt-2">
                    <span>✓</span> Connection tested successfully
                  </p>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Factory...' : 'Create Factory and Dashboard'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          {currentStep > 1 && currentStep !== 3 && (
            <button
              onClick={prevStep}
              className="px-6 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300"
            >
              Back
            </button>
          )}
          {currentStep < 3 && (
            <button
              onClick={nextStep}
              className="ml-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewFactoryPage;
