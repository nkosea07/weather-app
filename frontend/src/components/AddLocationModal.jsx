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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Add location</h2>
            <p className="mt-1 text-sm text-slate-500">Search by city name and choose a result.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-slate-200"
          >
            <FiX className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={cityName}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter city name (e.g. Cape Town)"
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={loading || !cityName.trim()}
              className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2.5 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              <FiSearch className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {showResults && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Search results
              </h3>
              {searchResults.length === 0 ? (
                <div className="rounded-xl bg-slate-100 py-5 text-center text-slate-500">
                  <p>No locations found for "{cityName}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddLocation(result)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-sky-300 hover:bg-sky-50"
                    >
                      <p className="font-medium text-slate-800">{result.displayName}</p>
                      <p className="text-sm text-slate-500">
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
