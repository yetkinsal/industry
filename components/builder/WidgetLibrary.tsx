
import React from 'react';
import { WidgetType } from '../../types';

interface WidgetLibraryProps {
  onAddWidget: (type: WidgetType) => void;
}

const WIDGET_TYPES: WidgetType[] = ['KPI', 'LINE', 'BAR', 'TABLE', 'HEATMAP'];

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ onAddWidget }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Widget Library</h2>
      <div className="space-y-2">
        {WIDGET_TYPES.map(type => (
          <button
            key={type}
            onClick={() => onAddWidget(type)}
            className="w-full text-left p-2 bg-background hover:bg-border rounded-md text-sm font-medium text-text-primary transition-colors"
          >
            + Add {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WidgetLibrary;
