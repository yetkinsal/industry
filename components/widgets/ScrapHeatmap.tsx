import React, { useMemo } from 'react';
import { ScrapData } from '../../types';

interface ScrapHeatmapProps {
  data: ScrapData[];
}

const ScrapHeatmap: React.FC<ScrapHeatmapProps> = ({ data }) => {
  const lines = useMemo(() => [...new Set(data.map(d => d.line))], [data]);
  // FIX: Explicitly type 'a' and 'b' as numbers in the sort callback to resolve the arithmetic operation error.
  const hours = useMemo(() => [...new Set(data.map(d => d.hour))].sort((a: number, b: number) => a - b), [data]);

  const getColor = (value: number) => {
    if (value > 4) return 'bg-red-800';
    if (value > 3) return 'bg-red-600';
    if (value > 2) return 'bg-yellow-600';
    if (value > 1) return 'bg-yellow-800';
    if (value > 0) return 'bg-green-800';
    return 'bg-gray-700';
  };

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(d => {
      map.set(`${d.line}-${d.hour}`, d.value);
    });
    return map;
  }, [data]);

  return (
    <div className="flex flex-col h-full overflow-x-auto">
        <div className="flex-grow grid gap-1" style={{gridTemplateColumns: `auto repeat(${hours.length}, 1fr)`}}>
            {/* Y-axis labels */}
            <div></div>
            {hours.map(hour => (
                <div key={hour} className="text-xs text-center text-text-secondary">{hour.toString().padStart(2, '0')}</div>
            ))}

            {/* Heatmap cells */}
            {lines.map(line => (
                <React.Fragment key={line}>
                    <div className="text-xs text-right pr-2 text-text-secondary flex items-center justify-end">{line}</div>
                    {hours.map(hour => {
                        const value = dataMap.get(`${line}-${hour}`) || 0;
                        return (
                            <div
                                key={`${line}-${hour}`}
                                className={`w-full h-full rounded-sm ${getColor(value)}`}
                                title={`Line: ${line}, Hour: ${hour}, Scrap: ${value.toFixed(2)}%`}
                            ></div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    </div>
  );
};

export default ScrapHeatmap;
