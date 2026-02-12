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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Weather Platform</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`${
                      activeView === item.id
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <Icon className="mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
