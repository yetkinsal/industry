import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface FilterState {
  site: string;
  range: string;
  lines: string[];
  sku: string;
  shifts: string[];
  productName: string; // Legacy: single product (kept for backward compatibility)
  products: string[]; // New: multiple products for comparison
}

const defaultFilters: FilterState = {
  site: 'alpha',
  range: '24h',
  lines: ['line1', 'line2', 'line3', 'line4'],
  sku: '',
  shifts: ['shift1', 'shift2', 'shift3'],
  productName: 'cement', // Legacy default
  products: ['cement'], // New: default to single product
};

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
