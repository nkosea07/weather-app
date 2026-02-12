import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import weatherService from '../services/weatherService';
import { format } from 'date-fns';

const ForecastModal = ({ isOpen, onClose, location, units }) => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupedForecast, setGroupedForecast] = useState({});

  useEffect(() => {
    if (isOpen && location) {
      fetchForecast();
    }
  }, [isOpen, location, units]);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherService.getForecast(location.locationId, units);
      setForecast(data);

      // Group forecast by date
      const grouped = data.reduce((acc, item) => {
        const date = format(new Date(item.forecastTime), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      setGroupedForecast(grouped);
    } catch (error) {
      setError('Failed to fetch forecast data');
      console.error('Failed to fetch forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return weatherService.getWeatherIconUrl(iconCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              5-Day Forecast
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {location?.displayName || location?.locationName}, {location?.country}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={fetchForecast}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedForecast).map(([date, items]) => (
                <div key={date} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    {format(new Date(date), 'EEEE, MMMM d')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {items.map((item, index) => (
                      <div key={index} className="bg-white rounded p-3 text-center">
                        <p className="text-xs text-gray-500">
                          {format(new Date(item.forecastTime), 'h:mm a')}
                        </p>
                        <img
                          src={getWeatherIcon(item.weatherIcon)}
                          alt={item.weatherDescription}
                          className="w-10 h-10 mx-auto"
                        />
                        <p className="font-medium text-gray-800">
                          {weatherService.formatTemperature(item.temperature, units)}
                        </p>
                        <p className="text-xs text-gray-600 capitalize truncate">
                          {item.weatherDescription}
                        </p>
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="flex items-center justify-center">
                            💧 {weatherService.formatHumidity(item.humidity)}
                          </span>
                          <span className="flex items-center justify-center">
                            🌬️ {weatherService.formatWindSpeed(item.windSpeed, units)}
                          </span>
                          {item.precipitationProbability && (
                            <span className="flex items-center justify-center">
                              🌧️ {Math.round(item.precipitationProbability * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastModal;