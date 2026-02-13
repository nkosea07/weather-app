import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  const modalRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => modalRef.current?.querySelector('button')?.focus(), 0);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="forecast-modal-title">
      <div ref={modalRef} className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/20 bg-white shadow-soft">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50 p-6">
          <div>
            <h2 id="forecast-modal-title" className="text-xl font-semibold text-slate-800">
              5-Day Forecast
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {location?.displayName || location?.locationName}, {location?.country}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-slate-200"
            aria-label="Close forecast modal"
          >
            <FiX className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-sky-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={fetchForecast}
                className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedForecast).map(([date, items]) => (
                <div key={date} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 font-semibold text-slate-800">
                    {format(new Date(date), 'EEEE, MMMM d')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {items.map((item, index) => (
                      <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                        <p className="text-xs font-medium text-slate-500">
                          {format(new Date(item.forecastTime), 'h:mm a')}
                        </p>
                        <img
                          src={getWeatherIcon(item.weatherIcon)}
                          alt={item.weatherDescription}
                          className="w-10 h-10 mx-auto"
                        />
                        <p className="font-semibold text-slate-800">
                          {weatherService.formatTemperature(item.temperature, units)}
                        </p>
                        <p className="truncate text-xs capitalize text-slate-600">
                          {item.weatherDescription}
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-slate-500">
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
