import React, 'react';
import { ReactNode } from 'react';
import { ICONS } from '../../constants';
import WidgetError from './WidgetError';

interface WidgetWrapperProps {
  title: string;
  children: ReactNode;
  isLoading: boolean;
  error: string | null;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ title, children, isLoading, error }) => {
  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm flex flex-col h-full">
      <div className="p-4 flex items-center">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <span className="ml-2 text-text-secondary cursor-pointer w-4 h-4">{ICONS.INFO}</span>
      </div>
      <div className="px-4 pb-4 flex-grow relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface bg-opacity-75 z-10">
            <WidgetError error={error} />
          </div>
        )}
        {!isLoading && !error && children}
      </div>
    </div>
  );
};

export default WidgetWrapper;
