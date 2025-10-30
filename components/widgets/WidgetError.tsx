import React from 'react';
import { ICONS } from '../../constants';

interface WidgetErrorProps {
  error: string;
}

const WidgetError: React.FC<WidgetErrorProps> = ({ error }) => {
  const timestamp = new Date().toLocaleTimeString();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary p-4">
      <div className="w-10 h-10 text-danger mb-2">
        {ICONS.ALERT_TRIANGLE}
      </div>
      <p className="text-sm font-semibold text-danger">{error}</p>
      <p className="text-xs mt-1">
        Timestamp: {timestamp}
      </p>
    </div>
  );
};

export default WidgetError;
