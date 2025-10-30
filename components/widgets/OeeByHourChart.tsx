
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OeeData } from '../../types';

interface OeeByHourChartProps {
  data: OeeData[];
}

const OeeByHourChart: React.FC<OeeByHourChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
        <XAxis dataKey="hour" stroke="#8B949E" fontSize={12} />
        <YAxis stroke="#8B949E" fontSize={12} unit="%" domain={[60, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161B22',
            borderColor: '#30363D',
            color: '#C9D1D9',
          }}
          labelStyle={{ color: '#8B949E' }}
        />
        <Legend wrapperStyle={{fontSize: "14px"}}/>
        <Line type="monotone" dataKey="oee" name="OEE" stroke="#2F81F7" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default OeeByHourChart;
