import React, { useState } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import weatherService from '../services/weatherService';

const AddLocationModal = ({ isOpen, onClose, onLocationAdded }) => {
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!cityName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await weatherService.searchLocations(cityName.trim());
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      setError(error.message || 'Failed to search locations');
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (result) => {
    try {
      setError(null);
      await weatherService.addLocation({
        name: result.name,
        country: result.country,
        latitude: result.lat,
        longitude: result.lon,
        displayName: result.displayName,
        isFavorite: false
      });
      onLocationAdded();
      setCityName('');
      setShowResults(false);
      setSearchResults([]);
    } catch (error) {
      setError(error.message || 'Failed to add location');
      console.error('Failed to add location:', error);
    }
  };

  const handleInputChange = (e) => {
    setCityName(e.target.value);
    setError(null);
    if (showResults && e.target.value.trim() === '') {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add Location</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={cityName}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={loading || !cityName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              <FiSearch className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {showResults && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Search Results
              </h3>
              {searchResults.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No locations found for "{cityName}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddLocation(result)}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <p className="font-medium text-gray-800">{result.displayName}</p>
                      <p className="text-sm text-gray-500">
                        Lat: {result.lat.toFixed(4)}, Lon: {result.lon.toFixed(4)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;