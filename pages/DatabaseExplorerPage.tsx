import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface TableInfo {
  tableName: string;
  schemaName: string;
  tableType: 'table' | 'view';
  rowCount?: number;
}

interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  maxLength?: number;
}

interface Connection {
  id: string;
  name: string;
  dbType: string;
}

export default function DatabaseExplorerPage() {
  const navigate = useNavigate();
  const { connectionId } = useParams<{ connectionId?: string }>();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>(connectionId || '');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch connections
  useEffect(() => {
    fetchConnections();
  }, []);

  // Fetch tables when connection changes
  useEffect(() => {
    if (selectedConnection) {
      fetchTables();
    }
  }, [selectedConnection]);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections`);
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
        if (data.length > 0 && !selectedConnection) {
          setSelectedConnection(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchTables = async () => {
    if (!selectedConnection) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/schema/${selectedConnection}/tables`);
      if (response.ok) {
        const data = await response.json();
        setTables(data);

        // Auto-expand first schema
        if (data.length > 0) {
          setExpandedSchemas(new Set([data[0].schemaName]));
        }
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableDetails = async (table: TableInfo) => {
    setLoading(true);
    setSelectedTable(table);

    try {
      // Fetch columns
      const columnsResponse = await fetch(
        `${API_BASE_URL}/api/schema/${selectedConnection}/tables/${table.schemaName}/${table.tableName}/columns`
      );
      if (columnsResponse.ok) {
        const columnsData = await columnsResponse.json();
        setColumns(columnsData);
      }

      // Fetch preview data
      const previewResponse = await fetch(
        `${API_BASE_URL}/api/schema/${selectedConnection}/tables/${table.schemaName}/${table.tableName}/preview?limit=50`
      );
      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        setPreviewData(previewData);
      }
    } catch (error) {
      console.error('Error fetching table details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSchema = (schemaName: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schemaName)) {
      newExpanded.delete(schemaName);
    } else {
      newExpanded.add(schemaName);
    }
    setExpandedSchemas(newExpanded);
  };

  // Group tables by schema
  const tablesBySchema = tables.reduce((acc, table) => {
    if (!acc[table.schemaName]) {
      acc[table.schemaName] = [];
    }
    acc[table.schemaName].push(table);
    return acc;
  }, {} as Record<string, TableInfo[]>);

  const generateSelectQuery = () => {
    if (!selectedTable) return '';
    return `SELECT *\nFROM "${selectedTable.schemaName}"."${selectedTable.tableName}"\nLIMIT 100;`;
  };

  const createWidgetFromTable = () => {
    if (!selectedTable) return;

    const query = generateSelectQuery();
    // Navigate to builder with pre-filled query
    navigate(`/builder/new?query=${encodeURIComponent(query)}&connectionId=${selectedConnection}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Database Explorer</h1>
            <div className="flex gap-3">
              {selectedTable && (
                <button
                  onClick={createWidgetFromTable}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Create Widget
                </button>
              )}
              <button
                onClick={() => navigate('/dashboards')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Back to Dashboards
              </button>
            </div>
          </div>

          {/* Connection Selector */}
          <div className="mt-4">
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a connection</option>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.name} ({conn.dbType})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel: Table Tree */}
          <div className="col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sticky top-4">
              <h2 className="text-lg font-semibold text-white mb-4">Tables</h2>

              {loading && tables.length === 0 ? (
                <div className="text-white/60 text-center py-8">Loading...</div>
              ) : tables.length === 0 ? (
                <div className="text-white/60 text-center py-8">
                  No tables found
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(tablesBySchema).map(([schema, schemaTables]) => (
                    <div key={schema}>
                      {/* Schema Header */}
                      <button
                        onClick={() => toggleSchema(schema)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedSchemas.has(schema) ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-medium">{schema}</span>
                        <span className="text-xs text-white/60">({schemaTables.length})</span>
                      </button>

                      {/* Tables in Schema */}
                      {expandedSchemas.has(schema) && (
                        <div className="ml-6 space-y-1 mt-1">
                          {schemaTables.map((table) => (
                            <button
                              key={`${table.schemaName}.${table.tableName}`}
                              onClick={() => fetchTableDetails(table)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                selectedTable?.tableName === table.tableName &&
                                selectedTable?.schemaName === table.schemaName
                                  ? 'bg-purple-600 text-white'
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="flex-1 text-left">{table.tableName}</span>
                              {table.rowCount !== undefined && (
                                <span className="text-xs text-white/60">{table.rowCount}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Table Details */}
          <div className="col-span-9 space-y-6">
            {selectedTable ? (
              <>
                {/* Table Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedTable.schemaName}.{selectedTable.tableName}
                      </h2>
                      <div className="flex gap-3 mt-2">
                        <span className="text-sm text-white/60">
                          Type: <span className="text-white">{selectedTable.tableType}</span>
                        </span>
                        {selectedTable.rowCount !== undefined && (
                          <span className="text-sm text-white/60">
                            Rows: <span className="text-white">{selectedTable.rowCount.toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SQL Query */}
                  <div className="mt-4">
                    <label className="text-sm font-medium text-white/80 mb-2 block">Generated Query:</label>
                    <pre className="bg-black/30 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
                      {generateSelectQuery()}
                    </pre>
                  </div>
                </div>

                {/* Columns */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Columns ({columns.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-white/80 font-medium">Column</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium">Nullable</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium">Keys</th>
                        </tr>
                      </thead>
                      <tbody>
                        {columns.map((col, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-white font-mono text-sm">{col.columnName}</td>
                            <td className="py-3 px-4 text-blue-300 text-sm">
                              {col.dataType}
                              {col.maxLength && `(${col.maxLength})`}
                            </td>
                            <td className="py-3 px-4 text-white/60 text-sm">
                              {col.isNullable ? 'Yes' : 'No'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                {col.isPrimaryKey && (
                                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                                    PK
                                  </span>
                                )}
                                {col.isForeignKey && (
                                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                                    FK
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Data Preview (First 50 rows)
                  </h3>
                  <div className="overflow-x-auto">
                    {previewData.length === 0 ? (
                      <p className="text-white/60 text-center py-8">No data to preview</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            {Object.keys(previewData[0] || {}).map((key) => (
                              <th key={key} className="text-left py-2 px-3 text-white/80 font-medium whitespace-nowrap">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                              {Object.values(row).map((value: any, colIdx) => (
                                <td key={colIdx} className="py-2 px-3 text-white/80 whitespace-nowrap">
                                  {value === null ? (
                                    <span className="text-white/40 italic">null</span>
                                  ) : typeof value === 'object' ? (
                                    <span className="text-blue-300">{JSON.stringify(value)}</span>
                                  ) : (
                                    String(value)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 text-center">
                <svg
                  className="w-16 h-16 text-white/40 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
                <p className="text-white/60">Select a table from the left panel to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
