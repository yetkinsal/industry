import React from 'react';
import { KpiData } from '../../types';
import { ICONS } from '../../constants';

interface KpiCardProps {
  data: KpiData;
}

const KpiCard: React.FC<KpiCardProps> = ({ data }) => {
  const isPositive = data.delta >= 0;
  const deltaColor = isPositive ? 'text-success' : 'text-danger';

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm p-4 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <h4 className="text-text-secondary font-medium">{data.title}</h4>
        <div className={`flex items-center text-lg font-bold ${deltaColor}`}>
          <span className="w-5 h-5 mr-1">
            {isPositive ? ICONS.CHEVRON_UP : ICONS.CHEVRON_DOWN}
          </span>
          <span>{Math.abs(data.delta)}%</span>
        </div>
      </div>
      <div className="flex items-end justify-between mt-4">
        <div>
          <p className="text-2xl font-bold text-text-primary">{data.value}</p>
          <p className="text-sm text-text-secondary">{data.valueLabel}</p>
        </div>
        {data.previousValue && (
          <div className="text-right">
            <p className="text-lg font-medium text-text-secondary">{data.previousValue}</p>
            <p className="text-sm text-text-secondary">{data.previousValueLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
