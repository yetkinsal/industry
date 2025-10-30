import React, { useEffect, useState } from 'react';
import { BuilderWidget } from '../../types';
import SqlEditor from './SqlEditor';

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
