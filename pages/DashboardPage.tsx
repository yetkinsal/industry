
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import apiService, { Dashboard, Widget } from '@/services/apiService';
import { useFilters } from '@/contexts/FilterContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import KpiCard from '@/components/widgets/KpiCard';
import GaugeChart from '@/components/widgets/GaugeChart';
import RunTimeDowntimeChart from '@/components/widgets/RunTimeDowntimeChart';
import ProductionCostChart from '@/components/widgets/ProductionCostChart';
import WidgetWrapper from '@/components/widgets/WidgetWrapper';
import WidgetError from '@/components/widgets/WidgetError';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetData {
  widgetId: string;
  data: any[];
  loading: boolean;
  error: string | null;
}

const DashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const { filters } = useFilters();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [widgetData, setWidgetData] = useState<Map<string, WidgetData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load dashboard and widgets
  useEffect(() => {
    if (!id) return;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const dashboardData = await apiService.getDashboardById(id);
        setDashboard(dashboardData);
        setWidgets(dashboardData.widgets || []);

        // Initialize widget data state
        const initialData = new Map<string, WidgetData>();
        (dashboardData.widgets || []).forEach(widget => {
          initialData.set(widget.id, {
            widgetId: widget.id,
            data: [],
            loading: true,
            error: null,
          });
        });
        setWidgetData(initialData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [id]);

  // Execute a single widget query
  const executeWidget = async (widget: Widget) => {
    try {
      setWidgetData(prev => {
        const next = new Map(prev);
        const current = prev.get(widget.id);
        if (current) {
          next.set(widget.id, { ...current, loading: true, error: null });
        }
        return next;
      });

      const result = await apiService.executeWidget(widget.id, filters);

      setWidgetData(prev => {
        const next = new Map(prev);
        next.set(widget.id, {
          widgetId: widget.id,
          data: result.rows,
          loading: false,
          error: null,
        });
        return next;
      });
    } catch (err: any) {
      setWidgetData(prev => {
        const next = new Map(prev);
        next.set(widget.id, {
          widgetId: widget.id,
          data: [],
          loading: false,
          error: err.message || 'Query execution failed',
        });
        return next;
      });
    }
  };

  // Execute widget queries when filters change
  useEffect(() => {
    if (widgets.length === 0) return;

    const executeWidgets = async () => {
      for (const widget of widgets) {
        await executeWidget(widget);
      }
    };

    executeWidgets();
  }, [widgets, filters]);

  // Auto-refresh widgets based on their refreshInterval
  useEffect(() => {
    if (widgets.length === 0) return;

    const intervals: NodeJS.Timeout[] = [];

    widgets.forEach(widget => {
      // Only set up auto-refresh if widget has a refreshInterval defined
      if (widget.refreshInterval && widget.refreshInterval > 0) {
        const intervalMs = widget.refreshInterval * 1000; // Convert seconds to milliseconds
        const intervalId = setInterval(() => {
          executeWidget(widget);
        }, intervalMs);
        intervals.push(intervalId);
      }
    });

    // Cleanup intervals on unmount or when widgets change
    return () => {
      intervals.forEach(id => clearInterval(id));
    };
  }, [widgets, filters]); // Re-setup intervals when widgets or filters change

  const renderWidget = (widget: Widget) => {
    const data = widgetData.get(widget.id);

    if (!data) {
      return <WidgetError message="Widget data not found" />;
    }

    if (data.error) {
      return <WidgetError message={data.error} />;
    }

    // Map widget types to components
    switch (widget.type) {
      case 'KPI':
        if (data.data.length === 0) return <WidgetWrapper loading={data.loading}><div /></WidgetWrapper>;
        const kpiRow = data.data[0];
        return (
          <WidgetWrapper loading={data.loading}>
            <KpiCard
              title={widget.title}
              value={Object.values(kpiRow)[0] as number}
              delta={kpiRow.delta || 0}
              format="number"
            />
          </WidgetWrapper>
        );

      case 'GAUGE':
        if (data.data.length === 0) return <WidgetWrapper loading={data.loading}><div /></WidgetWrapper>;
        const gaugeRow = data.data[0];
        return (
          <WidgetWrapper loading={data.loading}>
            <GaugeChart
              title={widget.title}
              value={Object.values(gaugeRow)[0] as number}
            />
          </WidgetWrapper>
        );

      case 'BAR':
        return (
          <WidgetWrapper loading={data.loading}>
            <RunTimeDowntimeChart title={widget.title} data={data.data} />
          </WidgetWrapper>
        );

      case 'LINE':
      case 'AREA':
        return (
          <WidgetWrapper loading={data.loading}>
            <ProductionCostChart title={widget.title} data={data.data} />
          </WidgetWrapper>
        );

      case 'TABLE':
        return (
          <WidgetWrapper loading={data.loading}>
            <div className="overflow-auto">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              {data.data.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {Object.keys(data.data[0]).map(key => (
                        <th key={key} className="px-4 py-2 text-left font-medium text-text-secondary">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.data.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-2 text-text-primary">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-text-secondary text-center py-8">No data</p>
              )}
            </div>
          </WidgetWrapper>
        );

      default:
        return (
          <WidgetWrapper loading={data.loading}>
            <div className="p-4 text-center text-text-secondary">
              <p>Widget type "{widget.type}" not yet implemented</p>
              <p className="text-sm mt-2">{widget.title}</p>
            </div>
          </WidgetWrapper>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Error Loading Dashboard</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link to="/" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Dashboard Not Found</h1>
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Convert layout from dashboard to grid layout format
  const layout: Layout[] = (dashboard.layout || []).map(item => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
    maxW: item.maxW,
    maxH: item.maxH,
  }));

  return (
    <DashboardLayout title={dashboard.name} subtitle={dashboard.description}>
      {widgets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-text-secondary mb-4">This dashboard has no widgets yet</p>
          <Link
            to={`/builder/${id}`}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark inline-block"
          >
            Add Widgets in Builder
          </Link>
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={false}
          isResizable={false}
        >
          {widgets.map(widget => (
            <div key={widget.id} className="bg-white rounded-lg shadow p-4">
              {renderWidget(widget)}
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
