import React from 'react';

interface ChartType {
  type: string;
  name: string;
  description: string;
  icon: string;
  recommended?: boolean;
}

interface ChartTypePickerProps {
  selectedType: string;
  onChange: (type: string) => void;
  recommendedTypes?: string[];
}

const CHART_TYPES: ChartType[] = [
  {
    type: 'KPI',
    name: 'KPI Card',
    description: 'Single metric display',
    icon: '📊',
  },
  {
    type: 'LINE',
    name: 'Line Chart',
    description: 'Trends over time',
    icon: '📈',
  },
  {
    type: 'BAR',
    name: 'Bar Chart',
    description: 'Compare categories',
    icon: '📊',
  },
  {
    type: 'HORIZONTAL_BAR',
    name: 'Horizontal Bar',
    description: 'Compare categories horizontally',
    icon: '📊',
  },
  {
    type: 'AREA',
    name: 'Area Chart',
    description: 'Filled trends',
    icon: '📉',
  },
  {
    type: 'GAUGE',
    name: 'Gauge',
    description: 'Progress indicator',
    icon: '🎯',
  },
  {
    type: 'TABLE',
    name: 'Data Table',
    description: 'Raw data grid',
    icon: '📋',
  },
  {
    type: 'HEATMAP',
    name: 'Heatmap',
    description: 'Matrix visualization',
    icon: '🔥',
  },
];

export default function ChartTypePicker({ selectedType, onChange, recommendedTypes = [] }: ChartTypePickerProps) {
  // Mark recommended types
  const chartTypesWithRecommendations = CHART_TYPES.map(chart => ({
    ...chart,
    recommended: recommendedTypes.includes(chart.type),
  }));

  // Sort: recommended first
  const sortedChartTypes = [
    ...chartTypesWithRecommendations.filter(c => c.recommended),
    ...chartTypesWithRecommendations.filter(c => !c.recommended),
  ];

  return (
    <div className="space-y-4">
      {recommendedTypes.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>Recommended chart types based on your data</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sortedChartTypes.map((chart) => (
          <button
            key={chart.type}
            onClick={() => onChange(chart.type)}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${
                selectedType === chart.type
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }
            `}
          >
            {chart.recommended && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
                Recommended
              </div>
            )}

            <div className="text-4xl mb-2">{chart.icon}</div>
            <div className="text-white font-medium text-sm">{chart.name}</div>
            <div className="text-white/60 text-xs mt-1">{chart.description}</div>
          </button>
        ))}
      </div>

      {/* Preview Section */}
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
        <h3 className="text-sm font-medium text-white mb-2">Chart Preview</h3>
        <div className="text-white/60 text-sm">
          {selectedType
            ? `Selected: ${CHART_TYPES.find(c => c.type === selectedType)?.name || selectedType}`
            : 'Select a chart type to see preview'}
        </div>

        {/* Mini preview based on selected type */}
        {selectedType && (
          <div className="mt-4 p-6 bg-black/30 rounded-lg flex items-center justify-center">
            {selectedType === 'KPI' && (
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-400">1,234</div>
                <div className="text-sm text-white/60 mt-2">Total Orders</div>
                <div className="text-xs text-green-400 mt-1">+12% vs last period</div>
              </div>
            )}

            {selectedType === 'LINE' && (
              <div className="w-full h-32">
                <svg viewBox="0 0 200 80" className="w-full h-full">
                  <polyline
                    points="10,60 40,40 70,50 100,20 130,35 160,15 190,25"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2"
                  />
                  <circle cx="10" cy="60" r="3" fill="#a78bfa" />
                  <circle cx="40" cy="40" r="3" fill="#a78bfa" />
                  <circle cx="70" cy="50" r="3" fill="#a78bfa" />
                  <circle cx="100" cy="20" r="3" fill="#a78bfa" />
                  <circle cx="130" cy="35" r="3" fill="#a78bfa" />
                  <circle cx="160" cy="15" r="3" fill="#a78bfa" />
                  <circle cx="190" cy="25" r="3" fill="#a78bfa" />
                </svg>
              </div>
            )}

            {(selectedType === 'BAR' || selectedType === 'HORIZONTAL_BAR') && (
              <div className="w-full h-32 flex items-end justify-around gap-2 px-4">
                {[60, 80, 45, 90, 70].map((height, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                    style={{
                      [selectedType === 'HORIZONTAL_BAR' ? 'width' : 'height']: `${height}%`,
                      [selectedType === 'HORIZONTAL_BAR' ? 'height' : 'width']: '20%',
                    }}
                  />
                ))}
              </div>
            )}

            {selectedType === 'AREA' && (
              <div className="w-full h-32">
                <svg viewBox="0 0 200 80" className="w-full h-full">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.6 }} />
                      <stop offset="100%" style={{ stopColor: '#a78bfa', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="10,60 40,40 70,50 100,20 130,35 160,15 190,25 190,80 10,80"
                    fill="url(#areaGradient)"
                  />
                  <polyline
                    points="10,60 40,40 70,50 100,20 130,35 160,15 190,25"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}

            {selectedType === 'GAUGE' && (
              <div className="text-center">
                <svg viewBox="0 0 100 60" className="w-32 h-20">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#444"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 70 25"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-2xl font-bold text-purple-400">75%</div>
              </div>
            )}

            {selectedType === 'TABLE' && (
              <div className="w-full text-xs">
                <div className="grid grid-cols-3 gap-2 bg-white/10 p-2 rounded font-medium text-white">
                  <div>Column 1</div>
                  <div>Column 2</div>
                  <div>Column 3</div>
                </div>
                {[1, 2, 3].map((row) => (
                  <div key={row} className="grid grid-cols-3 gap-2 p-2 border-t border-white/5 text-white/60">
                    <div>Data {row}-1</div>
                    <div>Data {row}-2</div>
                    <div>Data {row}-3</div>
                  </div>
                ))}
              </div>
            )}

            {selectedType === 'HEATMAP' && (
              <div className="grid grid-cols-5 gap-1">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded"
                    style={{
                      backgroundColor: `rgba(167, 139, 250, ${Math.random() * 0.8 + 0.2})`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
