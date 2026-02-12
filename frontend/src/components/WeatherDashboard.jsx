import React, { useState } from 'react';
import WeatherCard from './WeatherCard';
import ForecastModal from './ForecastModal';
import { FiStar, FiMapPin, FiCloud, FiDroplet, FiWind } from 'react-icons/fi';

const WeatherDashboard = ({ locations, units, onDelete, onToggleFavorite, onRefresh }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);

  const handleViewForecast = (location) => {
    setSelectedLocation(location);
    setIsForecastModalOpen(true);
  };

  const favoriteLocations = locations.filter(loc => loc.isFavorite);
  const regularLocations = locations.filter(loc => !loc.isFavorite);

  return (
    <div className="space-y-8">
      {favoriteLocations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FiStar className="mr-2 text-yellow-500" />
            Favorite Locations
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
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <FiMapPin className="mr-2 text-gray-500" />
          Tracked Locations
        </h2>
        {locations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiCloud className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No locations</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a location to track.
            </p>
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
      </div>

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