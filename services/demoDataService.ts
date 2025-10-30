import { KpiData, RunTimeDowntimeData, ProductionCostData, GaugeData } from '../types';

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;
const formatNumber = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 0 });

export const getKpiData = (): KpiData[] => [
  { 
    title: 'Quantity', 
    delta: 15,
    value: formatNumber(10994272),
    previousValue: formatNumber(9472706),
    valueLabel: 'Production',
    previousValueLabel: 'Target'
  },
  { 
    title: 'Rework Quantity', 
    delta: -45,
    value: formatNumber(157484),
    previousValue: formatNumber(248037),
    valueLabel: 'Current Month',
    previousValueLabel: 'Last Month'
  },
  { 
    title: 'Manufacturing Cost', 
    delta: -45,
    value: formatCurrency(34000),
    previousValue: formatCurrency(54000),
    valueLabel: 'Current Month',
    previousValueLabel: 'Last Month',
    isCurrency: true
  },
  { 
    title: 'Labor Cost', 
    delta: -49,
    value: formatCurrency(7000),
    previousValue: formatCurrency(12000),
    valueLabel: 'Current Month',
    previousValueLabel: 'Last Month',
    isCurrency: true
  },
];

export const getRunTimeVsDowntimeData = (): RunTimeDowntimeData[] => [
    { name: 'Kiln phase', runTime: 3209, downtime: 124 },
    { name: 'Pre-Heating', runTime: 3191, downtime: 125 },
    { name: 'Packaging and shipping', runTime: 3191, downtime: 125 },
    { name: 'Another Phase 1', runTime: 3185, downtime: 124 },
    { name: 'Another Phase 2', runTime: 3183, downtime: 124 },
];

export const getProductionCostData = (): ProductionCostData[] => [
    { month: 'Sep', cost: 169790000 },
    { month: 'Oct', cost: 186830000 },
    { month: 'Nov', cost: 192370000 },
    { month: 'Dec', cost: 195340000 },
    { month: 'Jan', cost: 192210000 },
    { month: 'Feb', cost: 174730000 },
    { month: 'Mar', cost: 752900000 },
    { month: 'Apr', cost: 802550000 },
    { month: 'May', cost: 593660000 },
    { month: 'Jun', cost: 1010000000 },
    { month: 'Jul', cost: 1020000000 },
    { month: 'Aug', cost: 1210000000 },
];

export const getGaugeData = (): GaugeData[] => [
    { name: 'Availability', value: 73.59, color: '#3498DB' },
    { name: 'Performance', value: 94.56, color: '#48C9B0' },
    { name: 'Quality', value: 90.85, color: '#8E44AD' },
    { name: 'Overall Equipment Effectiveness', value: 63.21, color: '#E91E63' },
]
