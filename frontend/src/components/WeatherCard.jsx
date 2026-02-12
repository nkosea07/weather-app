import React, { useState } from 'react';
import { FiHeart, FiTrash2, FiRefreshCw, FiMapPin, FiDroplet, FiWind, FiEye, FiBarChart2, FiThermometer } from 'react-icons/fi';
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
      Clear: 'from-amber-400 via-orange-400 to-rose-400',
      Clouds: 'from-slate-500 via-slate-600 to-slate-800',
      Rain: 'from-cyan-500 via-blue-600 to-sky-700',
      Drizzle: 'from-cyan-400 via-blue-500 to-sky-700',
      Thunderstorm: 'from-slate-700 via-slate-800 to-indigo-900',
      Snow: 'from-sky-100 via-slate-200 to-slate-400',
      Mist: 'from-slate-300 via-slate-400 to-slate-500',
      Fog: 'from-slate-300 via-slate-400 to-slate-500',
      Haze: 'from-amber-200 via-amber-300 to-orange-300',
      Dust: 'from-amber-600 via-orange-700 to-orange-800',
      Sand: 'from-amber-700 via-orange-700 to-orange-900',
      Ash: 'from-slate-500 via-slate-600 to-slate-800',
      Squall: 'from-slate-600 via-blue-700 to-slate-900',
      Tornado: 'from-slate-700 via-slate-800 to-black',
    };
    return conditions[condition] || 'from-blue-400 to-blue-600';
  };

  const isMissingTemperature = location.temperature === null || location.temperature === undefined;

  if (isMissingTemperature) {
    return (
      <div className="h-full rounded-2xl border border-white/20 bg-white/10 p-6 shadow-soft backdrop-blur-lg">
        <div className="text-center text-slate-200">
          <FiMapPin className="mx-auto mb-3 h-12 w-12 text-cyan-200/80" />
          <p className="font-semibold">{location.displayName || location.locationName}</p>
          <p className="mt-1 text-sm text-slate-300">No weather data available</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="action-btn mt-3"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className={`bg-gradient-to-r ${getWeatherBackground(location.weatherCondition)} p-4 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{location.displayName || location.locationName}</h3>
            <p className="text-sm opacity-90">{location.country}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleToggleFavorite}
              className="rounded-lg p-1.5 transition hover:bg-white/20"
              aria-label={location.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={location.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart className={`h-5 w-5 ${location.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg p-1.5 transition hover:bg-white/20"
              aria-label="Delete location"
              title="Delete location"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

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
              <div className="text-sm font-medium capitalize text-gray-600">
                {location.weatherDescription}
              </div>
            </div>
          </div>
          <div className="text-right min-w-[104px]">
            <div className="text-xs text-gray-500">
              {location.lastUpdated && format(new Date(location.lastUpdated), 'MMM d, h:mm a')}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-2 inline-flex items-center rounded-lg bg-sky-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-1 h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="weather-stat-chip">
            <FiDroplet className="h-4 w-4 text-sky-600" />
            <span>Humidity {weatherService.formatHumidity(location.humidity)}</span>
          </div>
          <div className="weather-stat-chip">
            <FiWind className="h-4 w-4 text-slate-600" />
            <span>Wind {weatherService.formatWindSpeed(location.windSpeed, units)}</span>
          </div>
          <div className="weather-stat-chip">
            <FiBarChart2 className="h-4 w-4 text-cyan-700" />
            <span>Pressure {weatherService.formatPressure(location.pressure)}</span>
          </div>
          <div className="weather-stat-chip">
            <FiEye className="h-4 w-4 text-emerald-700" />
            <span>Visibility {weatherService.formatVisibility(location.visibility || 10000, units)}</span>
          </div>
        </div>

        {location.feelsLike !== null && location.feelsLike !== undefined && (
          <div className="mt-3 flex items-center border-t border-gray-200 pt-3 text-sm text-gray-600">
            <FiThermometer className="mr-2 h-4 w-4 text-orange-500" />
            <div>
              Feels like: {weatherService.formatTemperature(location.feelsLike, units)}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleShowForecast}
            className="w-full rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            View 5-Day Forecast
          </button>
        </div>
      </div>
    </article>
  );
};

export default WeatherCard;
