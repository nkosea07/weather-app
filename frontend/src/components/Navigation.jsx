import React from 'react';
import { FiHome, FiCode, FiBook, FiSettings } from 'react-icons/fi';

const Navigation = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: FiHome },
    { id: 'api-tester', name: 'API Tester', icon: FiCode },
    { id: 'api-docs', name: 'API Docs', icon: FiBook },
    { id: 'settings', name: 'Settings', icon: FiSettings },
  ];

  return (
    <nav className="glass-panel sticky top-4 z-30 animate-fade-in-up" aria-label="Main navigation">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">Weather Platform</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-w-fit items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-sky-400 text-slate-900 shadow-md'
                    : 'bg-white/10 text-slate-100 hover:bg-white/20'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
