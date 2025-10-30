import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProductionCostData } from '../../types';

interface ProductionCostChartProps {
  data: ProductionCostData[];
}

const currencyFormatter = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toString();
}

const ProductionCostChart: React.FC<ProductionCostChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 20,
          bottom: 20,
        }}
      >
        <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#48C9B0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#48C9B0" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" />
        <XAxis dataKey="month" stroke="#6C757D" fontSize={12} />
        <YAxis stroke="#6C757D" fontSize={12} tickFormatter={currencyFormatter} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#DEE2E6',
            color: '#212529',
          }}
          labelStyle={{ color: '#6C757D' }}
          formatter={(value: number) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), 'Production Cost']}
        />
        <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}} verticalAlign="bottom" />
        <Area type="monotone" dataKey="cost" name="Production Cost" stroke="#48C9B0" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ProductionCostChart;
