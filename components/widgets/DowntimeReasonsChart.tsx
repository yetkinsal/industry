
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DowntimeData } from '../../types';

interface DowntimeReasonsChartProps {
  data: DowntimeData[];
}

const DowntimeReasonsChart: React.FC<DowntimeReasonsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 20,
          left: 50,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
        <XAxis type="number" stroke="#8B949E" fontSize={12} />
        <YAxis type="category" dataKey="reason" stroke="#8B949E" fontSize={12} width={100} tick={{ fill: '#C9D1D9' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161B22',
            borderColor: '#30363D',
            color: '#C9D1D9',
          }}
          labelStyle={{ color: '#8B949E' }}
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
        />
        <Bar dataKey="minutes" fill="#8957E5" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DowntimeReasonsChart;
