

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import RGL, { WidthProvider } from "react-grid-layout";

import Topbar from '../components/layout/Topbar';
import WidgetLibrary from '../components/builder/WidgetLibrary';
import WidgetEditor from '../components/builder/WidgetEditor';
import { BuilderWidget, WidgetType } from '../types';
import { ICONS } from '../constants';
import apiService from '@/services/apiService';

const ReactGridLayout = WidthProvider(RGL);

const initialWidgets: BuilderWidget[] = [
    { i: 'a', type: 'KPI', title: 'OEE', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2, dashboardId: '1', query: 'SELECT oee FROM stats;', params: {} },
    { i: 'b', type: 'LINE', title: 'OEE By Hour', x: 2, y: 0, w: 4, h: 4, minW: 3, minH: 4, dashboardId: '1', query: 'SELECT oee, hour FROM hourly_stats;', params: {} },
    { i: 'c', type: 'TABLE', title: 'Last 50 Events', x: 0, y: 2, w: 6, h: 5, minW: 4, minH: 3, dashboardId: '1', query: 'SELECT * FROM events LIMIT 50;', params: {} },
];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const BuilderPage = () => {
  const { id } = useParams();
  const [widgets, setWidgets] = useState<BuilderWidget[]>([]);
  const [selectedWidgetI, setSelectedWidgetI] = useState<string | null>(null);
  const [compactType, setCompactType] = useState<'vertical' | 'horizontal' | null>('vertical');
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load dashboard and widgets from API
  useEffect(() => {
    if (!id) return;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const dashboard = await apiService.getDashboardById(id);

        // Load dashboard metadata
        setDashboardName(dashboard.name || 'My Dashboard');
        setDashboardDescription(dashboard.description || '');

        const loadedWidgets: BuilderWidget[] = (dashboard.widgets || []).map(w => ({
          i: w.id,
          type: w.type as WidgetType,
          title: w.title,
          description: w.description,
          x: 0,
          y: 0,
          w: 4,
          h: 4,
          minW: 2,
          minH: 2,
          dashboardId: id,
          query: w.query,
          params: w.params,
          vizOptions: w.vizOptions,
        }));

        // Apply layout if exists
        if (dashboard.layout && Array.isArray(dashboard.layout)) {
          dashboard.layout.forEach((layoutItem: any) => {
            const widget = loadedWidgets.find(w => w.i === layoutItem.i);
            if (widget) {
              widget.x = layoutItem.x;
              widget.y = layoutItem.y;
              widget.w = layoutItem.w;
              widget.h = layoutItem.h;
            }
          });
        }

        setWidgets(loadedWidgets);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [id]);

  // Debounced auto-save function
  const autoSave = useCallback(async (updatedWidgets: BuilderWidget[]) => {
    if (!id) return;

    setSaveStatus('saving');

    try {
      const widgetsWithIds: BuilderWidget[] = [];

      // Create or update widgets
      for (const widget of updatedWidgets) {
        if (widget.i.startsWith('new-')) {
          // New widget - create via API
          if (!widget.connectionId) {
            console.warn('Skipping widget creation - no connection selected:', widget.title);
            widgetsWithIds.push(widget);
            continue;
          }

          const createdWidget = await apiService.createWidget(id, {
            type: widget.type,
            title: widget.title,
            description: widget.description,
            connectionId: widget.connectionId,
            query: widget.query,
            params: widget.params,
            refreshInterval: widget.refreshCron ? parseInt(widget.refreshCron) : undefined,
            vizOptions: widget.viz,
            layout: { x: widget.x, y: widget.y, w: widget.w, h: widget.h }
          });

          // Replace temporary ID with real ID
          widgetsWithIds.push({
            ...widget,
            i: createdWidget.id,
            id: createdWidget.id
          });
        } else {
          // Existing widget - update
          await apiService.updateWidget(widget.i, {
            title: widget.title,
            description: widget.description,
            query: widget.query,
            params: widget.params,
            vizOptions: widget.viz,
          });
          widgetsWithIds.push(widget);
        }
      }

      // Update widget state with new IDs
      setWidgets(widgetsWithIds);

      // Save layout with real IDs
      const layout = widgetsWithIds.map(w => ({
        i: w.i,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
      }));

      await apiService.updateDashboardLayout(id, layout);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [id]);

  // Trigger auto-save with debounce
  const triggerAutoSave = useCallback((updatedWidgets: BuilderWidget[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(updatedWidgets);
    }, 500);
  }, [autoSave]);

  const handleAddWidget = (type: WidgetType) => {
    const newWidget: BuilderWidget = {
      i: `new-${Date.now()}`,
      type: type,
      title: `New ${type} Widget`,
      x: (widgets.length * 2) % 12,
      y: Infinity, // puts it at the bottom
      w: type === 'KPI' ? 2 : 4,
      h: type === 'KPI' ? 2 : 4,
      minW: 2,
      minH: 2,
      dashboardId: id || '1',
      query: '',
      params: {},
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleUpdateWidget = (updatedWidget: BuilderWidget) => {
    const updated = widgets.map(w => w.i === updatedWidget.i ? updatedWidget : w);
    setWidgets(updated);
    triggerAutoSave(updated);
  };

  const handleLayoutChange = (layout: RGL.Layout[]) => {
    setWidgets(prevWidgets => {
        const updated = prevWidgets.map(widget => {
            const layoutItem = layout.find(l => l.i === widget.i);
            if (layoutItem) {
                return {
                    ...widget,
                    x: layoutItem.x,
                    y: layoutItem.y,
                    w: layoutItem.w,
                    h: layoutItem.h
                };
            }
            return widget;
        });
        triggerAutoSave(updated);
        return updated;
    });
  };

  const handleSelectWidget = (i: string) => {
    setSelectedWidgetI(i);
  };
  
  const handleDeleteWidget = async (i: string) => {
    if (selectedWidgetI === i) {
      setSelectedWidgetI(null);
    }

    // Delete from backend if it's not a new widget
    if (!i.startsWith('new-')) {
      try {
        await apiService.deleteWidget(i);
      } catch (error) {
        console.error('Failed to delete widget:', error);
      }
    }

    setWidgets(widgets.filter(w => w.i !== i));
  }

  const handleResetLayout = () => {
    if (window.confirm("Are you sure you want to reset the layout? All position and size changes will be lost.")) {
      setWidgets(initialWidgets);
    }
  };

  const handleSaveDashboardMetadata = async () => {
    if (!id) return;

    try {
      await apiService.updateDashboard(id, {
        name: dashboardName,
        description: dashboardDescription,
      });
      setIsEditingName(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save dashboard metadata:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const selectedWidget = selectedWidgetI ? widgets.find(w => w.i === selectedWidgetI) : null;

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-text-primary flex-col">
        <Topbar title="Dashboard Builder" onMenuClick={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-text-primary flex-col">
      {/* Custom Header with Editable Dashboard Name */}
      <header className="bg-surface border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex-1">
          {isEditingName ? (
            <div className="space-y-2">
              <input
                type="text"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="text-xl font-bold text-text-primary bg-background border border-border rounded px-2 py-1 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Dashboard Name"
              />
              <input
                type="text"
                value={dashboardDescription}
                onChange={(e) => setDashboardDescription(e.target.value)}
                className="text-sm text-text-secondary bg-background border border-border rounded px-2 py-1 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Dashboard Description (optional)"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveDashboardMetadata}
                  className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-blue-500"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-3 py-1 text-sm bg-surface border border-border text-text-primary rounded hover:bg-border"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div>
                <h1 className="text-xl font-bold text-text-primary">{dashboardName}</h1>
                {dashboardDescription && (
                  <p className="text-sm text-text-secondary">{dashboardDescription}</p>
                )}
              </div>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-text-secondary hover:text-primary p-1"
                title="Edit dashboard name and description"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        <aside className="w-56 bg-surface p-4 border-r border-border flex-shrink-0">
          <WidgetLibrary onAddWidget={handleAddWidget} />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto">
             <ReactGridLayout
                className="layout"
                layout={widgets}
                cols={12}
                rowHeight={50}
                onLayoutChange={handleLayoutChange}
                draggableCancel=".no-drag"
                compactType={compactType}
                resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
                isDraggable={!isLayoutLocked}
                isResizable={!isLayoutLocked}
              >
                {widgets.map(widget => (
                  <div 
                    key={widget.i} 
                    onClick={() => !isLayoutLocked && handleSelectWidget(widget.i)} 
                    className={`bg-surface border rounded-lg overflow-hidden group ${isLayoutLocked ? 'cursor-default' : 'cursor-pointer hover:border-primary/50'} ${selectedWidgetI === widget.i ? 'border-primary shadow-lg' : 'border-border'}`}
                  >
                    <div className="p-2 h-full">
                      <div className="text-sm font-semibold text-text-primary">{widget.title}</div>
                      <div className="text-xs text-text-secondary">{widget.type}</div>
                    </div>
                  </div>
                ))}
              </ReactGridLayout>
          </div>
          <footer className="bg-surface p-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-text-secondary hidden md:inline">Layout Mode:</span>
                <div className="flex items-center space-x-1 bg-background p-1 rounded-md border border-border">
                    <button 
                        onClick={() => setCompactType('vertical')} 
                        className={`px-2 py-1 text-xs rounded ${compactType === 'vertical' ? 'bg-primary text-white' : 'hover:bg-border'}`}
                        title="Compact Vertically"
                    >
                        Vertical
                    </button>
                    <button 
                        onClick={() => setCompactType('horizontal')} 
                        className={`px-2 py-1 text-xs rounded ${compactType === 'horizontal' ? 'bg-primary text-white' : 'hover:bg-border'}`}
                        title="Compact Horizontally"
                    >
                        Horizontal
                    </button>
                    <button 
                        onClick={() => setCompactType(null)} 
                        className={`px-2 py-1 text-xs rounded ${compactType === null ? 'bg-primary text-white' : 'hover:bg-border'}`}
                        title="Freeform (No Compaction)"
                    >
                        Freeform
                    </button>
                </div>
                <button
                    onClick={handleResetLayout}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-border rounded-md"
                    title="Reset Layout"
                >
                    <span className="w-4 h-4">{ICONS.RESET}</span>
                    <span className="hidden md:inline">Reset</span>
                </button>
                 <button
                    onClick={() => setIsLayoutLocked(!isLayoutLocked)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-border rounded-md"
                    title={isLayoutLocked ? "Unlock Layout" : "Lock Layout"}
                >
                    <span className="w-4 h-4">{isLayoutLocked ? ICONS.LOCK : ICONS.UNLOCK}</span>
                    <span className="hidden md:inline">{isLayoutLocked ? "Locked" : "Lock"}</span>
                </button>
            </div>
            <div className="flex items-center space-x-3">
                 {saveStatus !== 'idle' && (
                   <div className={`text-sm font-medium ${
                     saveStatus === 'saving' ? 'text-yellow-600' :
                     saveStatus === 'saved' ? 'text-green-600' :
                     'text-red-600'
                   }`}>
                     {saveStatus === 'saving' && '💾 Saving...'}
                     {saveStatus === 'saved' && '✓ Saved'}
                     {saveStatus === 'error' && '⚠ Save failed'}
                   </div>
                 )}
                 <Link to={`/dashboards/${id}`} className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-blue-500">
                   View Dashboard
                 </Link>
            </div>
          </footer>
        </main>

        <aside className="w-80 bg-surface p-4 border-l border-border flex-shrink-0 overflow-y-auto">
          <WidgetEditor 
            widget={selectedWidget} 
            onUpdate={handleUpdateWidget} 
            onDelete={handleDeleteWidget}
          />
        </aside>
      </div>
    </div>
  );
};

export default BuilderPage;