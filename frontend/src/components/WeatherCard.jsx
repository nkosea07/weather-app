import React, { useState } from 'react';
import { FiHeart, FiTrash2, FiRefreshCw, FiMapPin, FiDroplet, FiWind, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import weatherService from '../services/weatherService';

const WeatherCard = ({ 
  location, 
  units, 
  onToggleFavorite, 
  onDelete, 
  onRefresh, 
  onShowForecast 
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await weatherService.refreshWeather(location.locationId, units);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError('Failed to refresh weather data');
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await weatherService.updateLocation(location.locationId, {
        isFavorite: !location.isFavorite
      });
      if (onToggleFavorite) onToggleFavorite(location.locationId, location.isFavorite);
    } catch (err) {
      setError('Failed to update favorite status');
      console.error('Favorite toggle error:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${location.displayName || location.locationName}?`)) {
      try {
        await weatherService.deleteLocation(location.locationId);
        if (onDelete) onDelete(location.locationId);
      } catch (err) {
        setError('Failed to delete location');
        console.error('Delete error:', err);
      }
    }
  };

  const handleShowForecast = () => {
    if (onShowForecast) onShowForecast(location);
  };

  const getWeatherBackground = (condition) => {
    const conditions = {
      'Clear': 'from-yellow-400 to-orange-500',
      'Clouds': 'from-gray-400 to-gray-600',
      'Rain': 'from-blue-400 to-blue-600',
      'Drizzle': 'from-blue-300 to-blue-500',
      'Thunderstorm': 'from-purple-600 to-purple-800',
      'Snow': 'from-blue-100 to-gray-300',
      'Mist': 'from-gray-300 to-gray-500',
      'Fog': 'from-gray-300 to-gray-500',
      'Haze': 'from-yellow-200 to-orange-300',
      'Dust': 'from-yellow-600 to-orange-700',
      'Sand': 'from-yellow-700 to-orange-800',
      'Ash': 'from-gray-500 to-gray-700',
      'Squall': 'from-gray-600 to-blue-800',
      'Tornado': 'from-gray-700 to-gray-900'
    };
    return conditions[condition] || 'from-blue-400 to-blue-600';
  };

  if (!location.temperature) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <FiMapPin className="mx-auto h-12 w-12 mb-2" />
          <p className="font-medium">{location.displayName || location.locationName}</p>
          <p className="text-sm">No weather data available</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <FiRefreshCw className={`inline h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r ${getWeatherBackground(location.weatherCondition)} p-4 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{location.displayName || location.locationName}</h3>
            <p className="text-sm opacity-90">{location.country}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleToggleFavorite}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title={location.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart 
                className={`h-5 w-5 ${location.isFavorite ? 'fill-current' : ''}`} 
              />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Delete location"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weather content */}
      <div className="p-4">
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Current weather */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {location.weatherIcon && (
              <img
                src={weatherService.getWeatherIconUrl(location.weatherIcon)}
                alt={location.weatherDescription}
                className="h-16 w-16 mr-3"
              />
            )}
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {weatherService.formatTemperature(location.temperature, units)}
              </div>
              <div className="text-sm text-gray-600">{location.weatherDescription}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {location.lastUpdated && format(new Date(location.lastUpdated), 'MMM d, h:mm a')}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <FiRefreshCw className={`inline h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-gray-600">
            <FiDroplet className="h-4 w-4 mr-2 text-blue-500" />
            <span>Humidity: {weatherService.formatHumidity(location.humidity)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiWind className="h-4 w-4 mr-2 text-gray-500" />
            <span>Wind: {weatherService.formatWindSpeed(location.windSpeed, units)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="h-4 w-4 mr-2 text-purple-500">📊</span>
            <span>Pressure: {weatherService.formatPressure(location.pressure)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiEye className="h-4 w-4 mr-2 text-green-500" />
            <span>Visibility: {weatherService.formatVisibility(location.visibility || 10000, units)}</span>
          </div>
        </div>

        {/* Feels like temperature */}
        {location.feelsLike && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Feels like: {weatherService.formatTemperature(location.feelsLike, units)}
            </div>
          </div>
        )}

        {/* Forecast button */}
        <div className="mt-4">
          <button
            onClick={handleShowForecast}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            View 5-Day Forecast
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;