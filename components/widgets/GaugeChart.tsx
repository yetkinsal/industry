import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { GaugeData } from '../../types';

interface GaugeChartProps {
  data: GaugeData;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ data }) => {
  const chartData = [{ name: data.name, value: data.value }];

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={chartData}
          startAngle={180}
          endAngle={0}
          cy="90%"
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            angleAxisId={0}
            fill={data.color}
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-[15%] text-center">
        <p className="text-3xl font-bold text-text-primary">{data.value.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default GaugeChart;
