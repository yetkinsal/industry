import React from 'react';
import { ICONS } from '../../constants';
import { useFilters } from '../../contexts/FilterContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const FilterInput: React.FC<{ label: string; id: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, id, checked, onChange }) => (
    <div className="flex items-center">
        <input id={id} name={id} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={checked} onChange={onChange}/>
        <label htmlFor={id} className="ml-2 block text-sm text-text-primary">{label}</label>
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { filters, setFilters } = useFilters();

  const handleCheckboxChange = (group: 'lines' | 'shifts') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setFilters(prev => {
      const currentValues = prev[group];
      const newValues = checked
        ? [...currentValues, id]
        : currentValues.filter(value => value !== id);
      return { ...prev, [group]: newValues };
    });
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, sku: e.target.value }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, productName: e.target.value }));
  };

  return (
    <aside className={`bg-surface border-r border-border flex-shrink-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden lg:w-64`}>
      <div className="h-full p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center text-text-primary">
                Filters
            </h2>
        </div>

        <div className="flex-grow space-y-6 overflow-y-auto">
             <FilterSection title="Product Name">
                <select 
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={filters.productName}
                    onChange={handleProductChange}
                  >
                    <option value="cement">Cement</option>
                    <option value="concrete">Concrete</option>
                    <option value="aggregate">Aggregate</option>
                  </select>
            </FilterSection>

            <FilterSection title="Line">
                <FilterInput id="line1" label="Line 1" checked={filters.lines.includes('line1')} onChange={handleCheckboxChange('lines')} />
                <FilterInput id="line2" label="Line 2" checked={filters.lines.includes('line2')} onChange={handleCheckboxChange('lines')} />
                <FilterInput id="line3" label="Line 3" checked={filters.lines.includes('line3')} onChange={handleCheckboxChange('lines')} />
                <FilterInput id="line4" label="Line 4" checked={filters.lines.includes('line4')} onChange={handleCheckboxChange('lines')} />
            </FilterSection>

             <FilterSection title="SKU">
                <input type="text" placeholder="Search SKU..." className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={filters.sku} onChange={handleSkuChange} />
            </FilterSection>

             <FilterSection title="Shift">
                <FilterInput id="shift1" label="Shift 1" checked={filters.shifts.includes('shift1')} onChange={handleCheckboxChange('shifts')} />
                <FilterInput id="shift2" label="Shift 2" checked={filters.shifts.includes('shift2')} onChange={handleCheckboxChange('shifts')} />
                <FilterInput id="shift3" label="Shift 3" checked={filters.shifts.includes('shift3')} onChange={handleCheckboxChange('shifts')} />
            </FilterSection>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
