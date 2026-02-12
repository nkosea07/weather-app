import React from 'react';
import { FiSettings } from 'react-icons/fi';

const UnitsSelector = ({ units, onUnitsChange, showLabel = true }) => {
  const unitOptions = [
    { value: 'METRIC', label: 'Metric (°C, m/s)', description: 'Celsius, meters/second' },
    { value: 'IMPERIAL', label: 'Imperial (°F, mph)', description: 'Fahrenheit, miles/hour' },
    { value: 'STANDARD', label: 'Standard (K, m/s)', description: 'Kelvin, meters/second' }
  ];

  return (
    <div className="flex items-center space-x-2">
      {showLabel && (
        <div className="flex items-center text-sm text-gray-600">
          <FiSettings className="h-4 w-4 mr-1" />
          <span>Units:</span>
        </div>
      )}
      <select
        value={units}
        onChange={(e) => onUnitsChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white"
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
