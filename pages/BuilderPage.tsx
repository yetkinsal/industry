

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
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load dashboard and widgets from API
  useEffect(() => {
    if (!id) return;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const dashboard = await apiService.getDashboardById(id);
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
      // Save layout
      const layout = updatedWidgets.map(w => ({
        i: w.i,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
      }));

      await apiService.updateDashboardLayout(id, layout);

      // Update widgets
      for (const widget of updatedWidgets) {
        if (!widget.i.startsWith('new-')) {
          // Existing widget - update
          await apiService.updateWidget(widget.i, {
            title: widget.title,
            description: widget.description,
            query: widget.query,
            params: widget.params,
            vizOptions: widget.vizOptions,
          });
        }
      }

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
  
  const handleDeleteWidget = (i: string) => {
    if (selectedWidgetI === i) {
      setSelectedWidgetI(null);
    }
    setWidgets(widgets.filter(w => w.i !== i));
  }

  const handleResetLayout = () => {
    if (window.confirm("Are you sure you want to reset the layout? All position and size changes will be lost.")) {
      setWidgets(initialWidgets);
    }
  };

  const selectedWidget = selectedWidgetI ? widgets.find(w => w.i === selectedWidgetI) : null;

  return (
    <div className="flex h-screen bg-background text-text-primary flex-col">
      <Topbar title={`Dashboard Builder: My Production Line`} onMenuClick={() => {}} />
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