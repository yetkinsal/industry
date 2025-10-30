import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RunTimeDowntimeData } from '../../types';

interface RunTimeDowntimeChartProps {
  data: RunTimeDowntimeData[];
}

const RunTimeDowntimeChart: React.FC<RunTimeDowntimeChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" />
        <XAxis dataKey="name" stroke="#6C757D" fontSize={12} />
        <YAxis stroke="#6C757D" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#DEE2E6',
            color: '#212529',
          }}
          labelStyle={{ color: '#6C757D' }}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
        />
        <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}} verticalAlign="bottom" />
        <Bar dataKey="downtime" name="Downtime" fill="#3498DB" />
        <Bar dataKey="runTime" name="RunTime" fill="#48C9B0" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RunTimeDowntimeChart;
