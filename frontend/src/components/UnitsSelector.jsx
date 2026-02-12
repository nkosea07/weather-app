import React from 'react';
import { FiSettings } from 'react-icons/fi';

const UnitsSelector = ({ units, onUnitsChange, showLabel = true }) => {
  const unitOptions = [
    { value: 'METRIC', label: 'Metric (°C, m/s)', description: 'Celsius, meters/second' },
    { value: 'IMPERIAL', label: 'Imperial (°F, mph)', description: 'Fahrenheit, miles/hour' },
    { value: 'STANDARD', label: 'Standard (K, m/s)', description: 'Kelvin, meters/second' }
  ];

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <div className="flex items-center text-sm text-slate-200">
          <FiSettings className="mr-1 h-4 w-4" />
          <span>Units</span>
        </div>
      )}
      <select
        value={units}
        onChange={(e) => onUnitsChange(e.target.value)}
        className="block min-w-[12rem] rounded-xl border border-white/20 bg-white/90 py-2 pl-3 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
      >
        {unitOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UnitsSelector;
