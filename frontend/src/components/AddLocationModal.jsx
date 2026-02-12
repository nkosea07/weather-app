import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiX, FiSearch, FiMapPin, FiNavigation, FiWifiOff, FiCrosshair } from 'react-icons/fi';
import weatherService from '../services/weatherService';

const DEFAULT_CENTER = [20, 0];
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let leafletLoaderPromise = null;

const loadLeafletAssets = () => {
  if (typeof window !== 'undefined' && window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletLoaderPromise) {
    return leafletLoaderPromise;
  }

  leafletLoaderPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet-css="true"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_URL;
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      link.setAttribute('data-leaflet-css', 'true');
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector('script[data-leaflet-js="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Leaflet')), {
        once: true,
      });
      if (window.L) {
        resolve(window.L);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = LEAFLET_JS_URL;
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    script.setAttribute('data-leaflet-js', 'true');
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.body.appendChild(script);
  });

  return leafletLoaderPromise;
};

const parseCoordinate = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const AddLocationModal = ({ isOpen, onClose, onLocationAdded }) => {
  const [cityName, setCityName] = useState('');
  const [activeMode, setActiveMode] = useState('search');
  const [loading, setLoading] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [manualLocation, setManualLocation] = useState({
    displayName: '',
    name: '',
    country: '',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState('');

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const selectedPosition = useMemo(() => {
    const latitude = parseCoordinate(manualLocation.latitude);
    const longitude = parseCoordinate(manualLocation.longitude);

    if (latitude === null || longitude === null) return null;
    if (latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180) return null;
    return [latitude, longitude];
  }, [manualLocation.latitude, manualLocation.longitude]);

  const destroyMap = () => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      destroyMap();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => destroyMap();
  }, []);

  const resetModalState = () => {
    setCityName('');
    setActiveMode('search');
    setLoading(false);
    setManualSubmitting(false);
    setLocating(false);
    setSearchResults([]);
    setShowResults(false);
    setMapCenter(DEFAULT_CENTER);
    setManualLocation({
      displayName: '',
      name: '',
      country: '',
      latitude: '',
      longitude: '',
    });
    setError(null);
    setInfoMessage('');
    destroyMap();
  };

  const closeModal = () => {
    resetModalState();
    onClose();
  };

  const handleSearch = async () => {
    if (!cityName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await weatherService.searchLocations(cityName.trim());
      setSearchResults(results);
      setShowResults(true);
    } catch (searchError) {
      setError(searchError.message || 'Failed to search locations');
      console.error('Search failed:', searchError);
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
        isFavorite: false,
      });
      resetModalState();
      onLocationAdded();
    } catch (addError) {
      setError(addError.message || 'Failed to add location');
      console.error('Failed to add location:', addError);
    }
  };

  const handleInputChange = (event) => {
    setCityName(event.target.value);
    setError(null);
    if (showResults && event.target.value.trim() === '') {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const updateManualField = (field, value) => {
    setManualLocation((current) => ({ ...current, [field]: value }));
    setError(null);
    setInfoMessage('');
  };

  const hydrateLocationFromCoordinates = async (latitude, longitude) => {
    const resolved = await weatherService.reverseGeocodeCoordinates(latitude, longitude);
    if (!resolved) {
      setInfoMessage('Coordinates selected. Enter a location name/country if needed.');
      return;
    }

    setManualLocation((current) => ({
      ...current,
      displayName: current.displayName || resolved.displayName,
      name: current.name || resolved.name,
      country: current.country || resolved.country,
    }));
    setInfoMessage('Location details were auto-filled from the selected coordinates.');
  };

  const handleMapSelect = (latitude, longitude) => {
    setManualLocation((current) => ({
      ...current,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
    }));
    setMapCenter([latitude, longitude]);
    setError(null);
    hydrateLocationFromCoordinates(latitude, longitude);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Current location is unavailable on this device. Enter coordinates manually.');
      return;
    }

    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleMapSelect(latitude, longitude);
        setLocating(false);
      },
      (locationError) => {
        const message =
          locationError.code === 1
            ? 'Permission denied. Enable location permission or enter coordinates manually.'
            : 'Could not get current location. Enter coordinates manually.';
        setError(message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      }
    );
  };

  const handleAddManualLocation = async () => {
    const latitude = parseCoordinate(manualLocation.latitude);
    const longitude = parseCoordinate(manualLocation.longitude);

    if (latitude === null || longitude === null) {
      setError('Enter valid numeric latitude and longitude.');
      return;
    }

    if (latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180) {
      setError('Latitude must be between -90 and 90, and longitude between -180 and 180.');
      return;
    }

    const country = (manualLocation.country || 'XX').trim().toUpperCase();
    if (country.length !== 2) {
      setError('Country must be a 2-letter code (or leave it blank to use XX).');
      return;
    }

    const displayName =
      manualLocation.displayName.trim() ||
      manualLocation.name.trim() ||
      `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    const name =
      manualLocation.name.trim() ||
      manualLocation.displayName.trim() ||
      `Location ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

    setManualSubmitting(true);
    setError(null);
    try {
      await weatherService.addLocation({
        name,
        country,
        latitude,
        longitude,
        displayName,
        isFavorite: false,
      });
      resetModalState();
      onLocationAdded();
    } catch (manualError) {
      setError(manualError.message || 'Failed to add location from coordinates.');
      console.error('Manual location add failed:', manualError);
    } finally {
      setManualSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (!isOpen || activeMode !== 'coordinates' || !isOnline) {
      return () => {
        cancelled = true;
      };
    }

    const initializeMap = async () => {
      try {
        const L = await loadLeafletAssets();
        if (cancelled || !mapContainerRef.current) return;

        if (!mapRef.current) {
          const map = L.map(mapContainerRef.current);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);
          map.on('click', (event) => {
            handleMapSelect(event.latlng.lat, event.latlng.lng);
          });
          mapRef.current = map;
        }

        const targetCenter = selectedPosition || mapCenter;
        const zoom = selectedPosition ? 10 : 2;
        mapRef.current.setView(targetCenter, zoom);

        if (selectedPosition) {
          if (!markerRef.current) {
            markerRef.current = L.marker(selectedPosition).addTo(mapRef.current);
          } else {
            markerRef.current.setLatLng(selectedPosition);
          }
        } else if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
      } catch (leafletError) {
        console.error('Map initialization failed:', leafletError);
        setInfoMessage('Map is unavailable. Enter latitude and longitude manually.');
      }
    };

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeMode, isOnline, mapCenter, selectedPosition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Add location</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search by city or pick coordinates with map/manual fallback.
            </p>
          </div>
          <button onClick={closeModal} className="rounded-full p-2 transition-colors hover:bg-slate-200">
            <FiX className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
              {infoMessage}
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveMode('search')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeMode === 'search'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FiSearch className="mr-2 inline h-4 w-4" />
              Search
            </button>
            <button
              onClick={() => setActiveMode('coordinates')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeMode === 'coordinates'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FiMapPin className="mr-2 inline h-4 w-4" />
              Coordinates
            </button>
          </div>

          {activeMode === 'search' && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cityName}
                  onChange={handleInputChange}
                  onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                  placeholder="Enter city name (e.g. Cape Town)"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
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
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">Search results</h3>
                  {searchResults.length === 0 ? (
                    <div className="rounded-xl bg-slate-100 py-5 text-center text-slate-500">
                      <p>No locations found for "{cityName}"</p>
                      <p className="mt-1 text-sm">Try a different search term</p>
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
            </>
          )}

          {activeMode === 'coordinates' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={useCurrentLocation}
                  disabled={!isOnline || locating}
                  className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
                >
                  <FiNavigation className={`mr-2 h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
                  Use current location
                </button>
                {!isOnline && (
                  <span className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    <FiWifiOff className="mr-2 h-4 w-4" />
                    Offline: use manual latitude/longitude fields below.
                  </span>
                )}
                {isOnline && <span className="text-xs text-slate-500">Click on the map to select coordinates.</span>}
              </div>

              {isOnline && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div ref={mapContainerRef} className="h-64 w-full" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={manualLocation.displayName}
                  onChange={(event) => updateManualField('displayName', event.target.value)}
                  placeholder="Display name (optional)"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <input
                  type="text"
                  value={manualLocation.name}
                  onChange={(event) => updateManualField('name', event.target.value)}
                  placeholder="City/locality name (optional)"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <input
                  type="text"
                  value={manualLocation.latitude}
                  onChange={(event) => updateManualField('latitude', event.target.value)}
                  placeholder="Latitude (e.g. -33.9249)"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <input
                  type="text"
                  value={manualLocation.longitude}
                  onChange={(event) => updateManualField('longitude', event.target.value)}
                  placeholder="Longitude (e.g. 18.4241)"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <input
                  type="text"
                  value={manualLocation.country}
                  onChange={(event) => updateManualField('country', event.target.value.toUpperCase())}
                  placeholder="Country code (optional, 2 letters)"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 sm:col-span-2"
                />
              </div>

              <button
                onClick={handleAddManualLocation}
                disabled={manualSubmitting}
                className="inline-flex items-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                <FiCrosshair className={`mr-2 h-4 w-4 ${manualSubmitting ? 'animate-spin' : ''}`} />
                Add from coordinates
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;
