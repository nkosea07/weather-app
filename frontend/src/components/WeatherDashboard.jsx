import React, { useState } from 'react';
import WeatherCard from './WeatherCard';
import ForecastModal from './ForecastModal';
import { FiStar, FiMapPin, FiCloud, FiPlus } from 'react-icons/fi';

const WeatherDashboard = ({ locations, units, onDelete, onToggleFavorite, onRefresh, onAddLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);

  const handleViewForecast = (location) => {
    setSelectedLocation(location);
    setIsForecastModalOpen(true);
  };

  const favoriteLocations = locations.filter(loc => loc.isFavorite);
  const regularLocations = locations.filter(loc => !loc.isFavorite);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {favoriteLocations.length > 0 && (
        <section className="glass-panel p-6 sm:p-7">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-white">
            <FiStar className="mr-2 text-amber-300" />
            Favorite locations
            <span className="ml-2 rounded-full bg-amber-300/20 px-2 py-0.5 text-xs font-medium text-amber-200">
              {favoriteLocations.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteLocations.map(location => (
              <WeatherCard
                key={location.locationId}
                location={location}
                units={units}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onShowForecast={handleViewForecast}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </section>
      )}

      <section className="glass-panel p-6 sm:p-7">
        <h2 className="mb-4 flex items-center text-lg font-semibold text-white">
          <FiMapPin className="mr-2 text-cyan-300" />
          Tracked locations
          <span className="ml-2 rounded-full bg-cyan-300/20 px-2 py-0.5 text-xs font-medium text-cyan-100">
            {locations.length}
          </span>
        </h2>
        {locations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 py-14 text-center">
            <FiCloud className="mx-auto h-12 w-12 text-cyan-200/70" />
            <h3 className="mt-3 text-lg font-semibold text-white">No locations yet</h3>
            <p className="mt-2 text-sm text-slate-100">
              Get started by adding a location to track.
            </p>
            <button
              onClick={() => onAddLocation && onAddLocation()}
              className="action-btn-primary mt-5"
            >
              <FiPlus className="h-4 w-4" />
              Add your first location
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularLocations.map(location => (
              <WeatherCard
                key={location.locationId}
                location={location}
                units={units}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onShowForecast={handleViewForecast}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </section>

      <ForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        location={selectedLocation}
        units={units}
      />
    </div>
  );
};

export default WeatherDashboard;
