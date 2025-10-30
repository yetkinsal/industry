import React from 'react';
import { ICONS } from '../../constants';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ title, onMenuClick }) => {
  return (
    <header className="bg-surface border-b border-border p-4 flex items-center justify-between z-10">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-text-secondary mr-4 lg:hidden">
          {ICONS.MENU}
        </button>
        <div className="flex items-center">
            <h1 className="text-xl font-bold text-text-primary">{title}</h1>
            <span className="ml-2 text-text-secondary cursor-pointer">{ICONS.INFO}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-text-secondary">
        <button className="flex items-center space-x-2">
            <span>Filters Overview</span>
            <span>{ICONS.CHEVRON_DOWN}</span>
        </button>
        <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>
         <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
