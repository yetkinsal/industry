import React, { useEffect, useState } from 'react';
import { BuilderWidget } from '../../types';
import SqlEditor from './SqlEditor';
import apiService, { Connection } from '@/services/apiService';

interface WidgetEditorProps {
  widget: BuilderWidget | null;
  onUpdate: (widget: BuilderWidget) => void;
  onDelete: (widgetId: string) => void;
}

type TabName = 'data' | 'appearance' | 'settings';

const TabButton: React.FC<{ name: string; activeTab: TabName; onClick: () => void }> = ({ name, activeTab, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
            activeTab === name
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
        }`}
    >
        {name}
    </button>
);


const WidgetEditor: React.FC<WidgetEditorProps> = ({ widget, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState<Partial<BuilderWidget>>({});
  const [jsonParams, setJsonParams] = useState('');
  const [jsonViz, setJsonViz] = useState('');
  const [activeTab, setActiveTab] = useState<TabName>('data');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [testingQuery, setTestingQuery] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);

  // Fetch connections on mount
  useEffect(() => {
    const fetchConnections = async () => {
      setLoadingConnections(true);
      try {
        const conns = await apiService.getAllConnections();
        setConnections(conns);
      } catch (error) {
        console.error('Failed to fetch connections:', error);
      } finally {
        setLoadingConnections(false);
      }
    };
    fetchConnections();
  }, []);

  useEffect(() => {
    if (widget) {
      setFormData(widget);
      setJsonParams(JSON.stringify(widget.params || {}, null, 2));
      setJsonViz(JSON.stringify(widget.viz || {}, null, 2));
      setActiveTab('data'); // Reset to default tab on widget change
    }
  }, [widget]);

  if (!widget) {
    return (
      <div className="text-center text-text-secondary mt-10">
        <p>Select a widget to edit its properties.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    let parsedParams = {};
    let parsedViz = {};
    try {
        parsedParams = jsonParams ? JSON.parse(jsonParams) : {};
    } catch (e) {
        alert('Parameters JSON is invalid.');
        return;
    }
     try {
        parsedViz = jsonViz ? JSON.parse(jsonViz) : {};
    } catch (e) {
        alert('Visualization Options JSON is invalid.');
        return;
    }

    onUpdate({ ...widget, ...formData, params: parsedParams, viz: parsedViz });
  };
  
  const handleDelete = () => {
      if(window.confirm(`Are you sure you want to delete "${widget.title}"?`)){
          onDelete(widget.i);
      }
  }

  const handleTestQuery = async () => {
    if (!formData.connectionId) {
      alert('Please select a database connection first');
      return;
    }

    if (!formData.query || !formData.query.trim()) {
      alert('Please enter a SQL query to test');
      return;
    }

    let parsedParams = {};
    try {
      parsedParams = jsonParams ? JSON.parse(jsonParams) : {};
    } catch (e) {
      alert('Parameters JSON is invalid. Please fix before testing.');
      return;
    }

    setTestingQuery(true);
    setTestResult(null);

    try {
      const result = await apiService.testQuery(
        formData.connectionId,
        formData.query,
        parsedParams
      );
      setTestResult({
        success: true,
        data: result,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'Query execution failed',
      });
    } finally {
      setTestingQuery(false);
    }
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Edit Widget</h2>
        <p className="text-sm text-text-secondary">ID: <span className="font-mono text-xs">{widget.i}</span></p>
      </div>

        <div className="border-b border-border -mx-4 px-2">
            <div className="flex space-x-2">
                <TabButton name="data" activeTab={activeTab} onClick={() => setActiveTab('data')} />
                <TabButton name="appearance" activeTab={activeTab} onClick={() => setActiveTab('appearance')} />
                <TabButton name="settings" activeTab={activeTab} onClick={() => setActiveTab('settings')} />
            </div>
        </div>

      <div className="flex-grow space-y-4 overflow-y-auto pr-2 -mr-4">
        {activeTab === 'data' && (
            <div className="space-y-4">
                 <div>
                  <label htmlFor="connectionId" className="block text-sm font-medium text-text-secondary mb-1">
                    Database Connection *
                  </label>
                  <select
                    id="connectionId"
                    name="connectionId"
                    value={formData.connectionId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, connectionId: e.target.value }))}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loadingConnections}
                  >
                    <option value="">Select a connection...</option>
                    {connections.map((conn) => (
                      <option key={conn.id} value={conn.id}>
                        {conn.name} ({conn.dbType.toUpperCase()} - {conn.database})
                      </option>
                    ))}
                  </select>
                  {connections.length === 0 && !loadingConnections && (
                    <p className="text-xs text-yellow-600 mt-1">
                      No connections found. Add one in <a href="/#/admin/connections" className="underline">Connections</a>.
                    </p>
                  )}
                </div>
                 <div>
                  <label htmlFor="query" className="block text-sm font-medium text-text-secondary mb-1">SQL Query</label>
                  <SqlEditor
                    value={formData.query || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, query: value }))}
                  />
                </div>
                 <div>
                  <label htmlFor="params" className="block text-sm font-medium text-text-secondary mb-1">Parameters (JSON)</label>
                  <textarea
                    id="params"
                    name="params"
                    value={jsonParams}
                    onChange={(e) => setJsonParams(e.target.value)}
                    className="w-full h-28 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary no-drag"
                    placeholder={`{\n  "site_id": 1,\n  "start_date": "2023-01-01"\n}`}
                  />
                </div>

                {/* Test Query Button */}
                <div>
                  <button
                    onClick={handleTestQuery}
                    disabled={testingQuery || !formData.connectionId || !formData.query}
                    className="w-full px-4 py-2 text-sm font-semibold bg-surface border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingQuery ? 'Testing Query...' : 'Test Query'}
                  </button>
                </div>

                {/* Test Result Display */}
                {testResult && (
                  <div className={`p-3 rounded-md border ${testResult.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    {testResult.success ? (
                      <div>
                        <p className="text-sm font-semibold text-green-800 mb-2">✓ Query Successful</p>
                        <div className="text-xs text-green-700">
                          <p className="mb-1">Returned {testResult.data?.rowCount || 0} rows</p>
                          {testResult.data?.rows && testResult.data.rows.length > 0 && (
                            <div className="mt-2 max-h-32 overflow-auto bg-white p-2 rounded border border-green-200">
                              <pre className="text-xs">
                                {JSON.stringify(testResult.data.rows.slice(0, 3), null, 2)}
                              </pre>
                              {testResult.data.rows.length > 3 && (
                                <p className="text-xs text-green-600 mt-1">... and {testResult.data.rows.length - 3} more rows</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-red-800 mb-1">✗ Query Failed</p>
                        <p className="text-xs text-red-700">{testResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
            </div>
        )}

        {activeTab === 'appearance' && (
            <div className="space-y-4">
                 <div>
                  <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Widget Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                 <div>
                  <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Widget Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary no-drag"
                    placeholder="Explain the purpose of this widget..."
                  />
                </div>
                <div>
                  <label htmlFor="viz" className="block text-sm font-medium text-text-secondary mb-1">Visualization Options (JSON)</label>
                  <textarea
                    id="viz"
                    name="viz"
                    value={jsonViz}
                    onChange={(e) => setJsonViz(e.target.value)}
                    className="w-full h-28 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary no-drag"
                    placeholder={`{\n  "unit": "%",\n  "color": "#3498DB"\n}`}
                  />
                </div>
            </div>
        )}
        
        {activeTab === 'settings' && (
            <div className="space-y-4">
                 <div>
                  <label htmlFor="refreshCron" className="block text-sm font-medium text-text-secondary mb-1">Refresh Cron</label>
                  <input
                    type="text"
                    id="refreshCron"
                    name="refreshCron"
                    value={formData.refreshCron || ''}
                    onChange={handleChange}
                    placeholder="*/5 * * * *"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                   <p className="text-xs text-text-secondary mt-1">Uses standard cron syntax. e.g., "*/5 * * * *" for every 5 minutes.</p>
                </div>
            </div>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-border">
         <button 
            onClick={handleUpdate}
            className="w-full px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-blue-500"
        >
            Update Widget
        </button>
        <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-sm font-semibold bg-danger/10 text-danger rounded-md hover:bg-danger/20"
        >
            Delete Widget
        </button>
      </div>
    </div>
  );
};

// FIX: Add default export to make the component available for import in other files.
export default WidgetEditor;
