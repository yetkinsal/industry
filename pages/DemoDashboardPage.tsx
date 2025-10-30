import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import KpiCard from '../components/widgets/KpiCard';
import WidgetWrapper from '../components/widgets/WidgetWrapper';
import RunTimeDowntimeChart from '../components/widgets/RunTimeDowntimeChart';
import ProductionCostChart from '../components/widgets/ProductionCostChart';
import GaugeChart from '../components/widgets/GaugeChart';
import * as demoDataService from '../services/demoDataService';
import { KpiData, RunTimeDowntimeData, ProductionCostData, GaugeData } from '../types';
import { FilterProvider, useFilters } from '../contexts/FilterContext';

const DemoDashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [runTimeDowntimeData, setRunTimeDowntimeData] = useState<RunTimeDowntimeData[]>([]);
  const [productionCostData, setProductionCostData] = useState<ProductionCostData[]>([]);
  const [gaugeData, setGaugeData] = useState<GaugeData[]>([]);
  
  const { filters } = useFilters();

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        setKpiData(demoDataService.getKpiData());
        setRunTimeDowntimeData(demoDataService.getRunTimeVsDowntimeData());
        setProductionCostData(demoDataService.getProductionCostData());
        setGaugeData(demoDataService.getGaugeData());
        setLoading(false);
      }, 500);
    };

    fetchData();
  }, [filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Row 1: KPI Cards */}
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg h-32 animate-pulse"></div>
        ))
      ) : (
        kpiData.map((kpi) => (
          <div key={kpi.title} className="col-span-1">
            <KpiCard data={kpi} />
          </div>
        ))
      )}
      
      {/* Row 2: Charts */}
      <div className="lg:col-span-2 h-96">
        <WidgetWrapper title="Run Time vs Downtime" isLoading={loading} error={null}>
          <RunTimeDowntimeChart data={runTimeDowntimeData} />
        </WidgetWrapper>
      </div>
      <div className="lg:col-span-2 h-96">
        <WidgetWrapper title="Production Cost - Last 12 Months" isLoading={loading} error={null}>
          <ProductionCostChart data={productionCostData} />
        </WidgetWrapper>
      </div>

      {/* Row 3: Gauges */}
      {loading ? (
         Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg h-64 animate-pulse"></div>
        ))
      ) : (
        gaugeData.map(gauge => (
            <div key={gauge.name} className="lg:col-span-1 h-64">
                <WidgetWrapper title={gauge.name} isLoading={loading} error={null}>
                    <GaugeChart data={gauge} />
                </WidgetWrapper>
            </div>
        ))
      )}
    </div>
  );
}

const DemoDashboardPage = () => {
  return (
    <FilterProvider>
      <DashboardLayout title="Production Analysis">
        <DemoDashboardContent />
      </DashboardLayout>
    </FilterProvider>
  );
};

export default DemoDashboardPage;
