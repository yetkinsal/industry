import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ICONS } from '../../constants';
import { useFilters } from '../../contexts/FilterContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.hash === `#${to}`;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-text-primary hover:bg-border'
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

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
        {/* Navigation Section */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 px-3">
            Navigation
          </h2>
          <nav className="space-y-1">
            <NavLink
              to="/"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              }
              label="Home"
            />
            <NavLink
              to="/dashboards"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="9" x="3" y="3" rx="1"/>
                  <rect width="7" height="5" x="14" y="3" rx="1"/>
                  <rect width="7" height="9" x="14" y="12" rx="1"/>
                  <rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
              }
              label="Dashboards"
            />
            <NavLink
              to="/factory/new"
              icon={ICONS.FACTORY}
              label="New Factory"
            />
            <NavLink
              to="/admin/connections"
              icon={ICONS.SETTINGS}
              label="Connections"
            />
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6"></div>

        {/* Filters Section */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 px-3">
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
