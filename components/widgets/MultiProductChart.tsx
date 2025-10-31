import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MultiProductChartProps {
  title: string;
  data: any[];
  type?: 'line' | 'area' | 'bar';
  xAxisKey?: string; // e.g., 'timestamp', 'month', 'hour'
}

// Color palette for different products
const PRODUCT_COLORS: Record<string, string> = {
  cement: '#48C9B0',
  iron: '#E74C3C',
  steel: '#3498DB',
  concrete: '#F39C12',
  aggregate: '#9B59B6',
  default: '#95A5A6',
};

const getProductColor = (product: string): string => {
  return PRODUCT_COLORS[product.toLowerCase()] || PRODUCT_COLORS.default;
};

const MultiProductChart: React.FC<MultiProductChartProps> = ({
  title,
  data,
  type = 'line',
  xAxisKey = 'timestamp'
}) => {
  // Extract product columns (all columns except the x-axis key)
  const productKeys = data.length > 0
    ? Object.keys(data[0]).filter(key => key !== xAxisKey)
    : [];

  // Format numbers for display
  const numberFormatter = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const ChartComponent = type === 'area' ? AreaChart : type === 'bar' ? BarChart : LineChart;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          {/* Gradient definitions for area charts */}
          {type === 'area' && (
            <defs>
              {productKeys.map(product => (
                <linearGradient key={product} id={`color${product}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getProductColor(product)} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getProductColor(product)} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
          )}

          <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" />
          <XAxis
            dataKey={xAxisKey}
            stroke="#6C757D"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6C757D"
            fontSize={12}
            tickFormatter={numberFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DEE2E6',
              color: '#212529',
            }}
            labelStyle={{ color: '#6C757D', fontWeight: 'bold' }}
            formatter={(value: number, name: string) => [numberFormatter(value), name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Legend
            wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}
            verticalAlign="bottom"
          />

          {/* Render series for each product */}
          {productKeys.map((product, index) => {
            const color = getProductColor(product);
            const productLabel = product.charAt(0).toUpperCase() + product.slice(1);

            if (type === 'area') {
              return (
                <Area
                  key={product}
                  type="monotone"
                  dataKey={product}
                  name={productLabel}
                  stroke={color}
                  fillOpacity={1}
                  fill={`url(#color${product})`}
                  strokeWidth={2}
                />
              );
            } else if (type === 'bar') {
              return (
                <Bar
                  key={product}
                  dataKey={product}
                  name={productLabel}
                  fill={color}
                />
              );
            } else {
              return (
                <Line
                  key={product}
                  type="monotone"
                  dataKey={product}
                  name={productLabel}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            }
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiProductChart;
