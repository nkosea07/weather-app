import React, { useState } from 'react';
import { FiSend, FiCopy, FiCheck, FiRefreshCw, FiTrash2, FiHeart, FiPlus, FiSettings, FiCloud, FiMapPin, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ApiTester = () => {
  const [activeTab, setActiveTab] = useState('weather');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [copied, setCopied] = useState({});

  // Form states for different endpoints
  const [newLocation, setNewLocation] = useState({
    name: '',
    country: '',
    latitude: '',
    longitude: '',
    displayName: '',
    isFavorite: false
  });

  const [userPrefs, setUserPrefs] = useState({
    defaultUnits: 'METRIC',
    refreshIntervalMinutes: 30,
    autoRefreshEnabled: true
  });

  const [selectedUnits, setSelectedUnits] = useState('METRIC');
  const [locationId, setLocationId] = useState('1');
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const baseOrigin = (() => {
    try {
      return new URL(baseUrl).origin;
    } catch (error) {
      return 'http://localhost:8080';
    }
  })();

  const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);
  const resolveUrl = (endpoint) => (isAbsoluteUrl(endpoint) ? endpoint : `${baseUrl}${endpoint}`);

  const parseResponseBody = async (response) => {
    if (response.status === 204) {
      return { message: 'No content' };
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return text ? { raw: text } : { message: 'Empty response body' };
  };

  const saveResponse = (loadingKey, status, statusText, data) => {
    setResponses((prev) => ({
      ...prev,
      [loadingKey]: {
        status,
        statusText,
        data,
        timestamp: new Date().toLocaleTimeString()
      }
    }));
  };

  const makeRequest = async (endpoint, method = 'GET', body = null, tab = '', responseKey = null) => {
    const loadingKey = responseKey || `${tab}-${endpoint}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(resolveUrl(endpoint), options);
      const data = await parseResponseBody(response);
      saveResponse(loadingKey, response.status, response.statusText, data);

      if (response.ok) {
        toast.success(`Request successful: ${response.status}`);
      } else {
        toast.error(`Request failed: ${response.status}`);
      }
    } catch (error) {
      saveResponse(loadingKey, 'ERROR', error.message, { error: error.message });
      toast.error('Request failed');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleAddLocation = () => {
    const latitude = Number.parseFloat(newLocation.latitude);
    const longitude = Number.parseFloat(newLocation.longitude);
    const name = newLocation.name.trim();
    const countryRaw = newLocation.country.trim();
    const country = countryRaw.length === 2 ? countryRaw.toUpperCase() : countryRaw;

    if (!name) {
      toast.error('Location name is required');
      return;
    }

    if (!country) {
      toast.error('Country is required');
      return;
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      toast.error('Latitude and longitude must be valid numbers');
      return;
    }

    makeRequest(
      '/weather/locations',
      'POST',
      {
        name,
        country,
        latitude,
        longitude,
        displayName: newLocation.displayName.trim() || null,
        isFavorite: newLocation.isFavorite
      },
      'weather',
      'weather-add-location'
    );
  };

  const handleToggleFavorite = async () => {
    const id = locationId.trim();
    if (!id) {
      toast.error('Location ID is required');
      return;
    }

    const loadingKey = `weather-favorite-${id}`;
    setLoading((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      const currentResponse = await fetch(resolveUrl(`/weather/locations/${id}?units=${selectedUnits}`));
      const currentData = await parseResponseBody(currentResponse);

      if (!currentResponse.ok) {
        saveResponse(loadingKey, currentResponse.status, currentResponse.statusText, currentData);
        toast.error(`Failed to load location ${id}`);
        return;
      }

      const nextFavoriteState = !Boolean(currentData?.isFavorite);
      const updateResponse = await fetch(resolveUrl(`/weather/locations/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFavorite: nextFavoriteState })
      });
      const updateData = await parseResponseBody(updateResponse);
      saveResponse(loadingKey, updateResponse.status, updateResponse.statusText, updateData);

      if (updateResponse.ok) {
        toast.success(nextFavoriteState ? 'Marked as favorite' : 'Removed from favorites');
      } else {
        toast.error(`Failed to toggle favorite: ${updateResponse.status}`);
      }
    } catch (error) {
      saveResponse(loadingKey, 'ERROR', error.message, { error: error.message });
      toast.error('Favorite update failed');
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(prev => ({ ...prev, [key]: true }));
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const renderResponse = (key, label) => {
    if (!responses[key]) return null;
    const response = responses[key];

    return (
      <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">
            {label} ({response.status})
          </span>
          <button
            onClick={() => copyToClipboard(response.data, key)}
            className="text-blue-600 hover:text-blue-800"
          >
            {copied[key] ? <FiCheck /> : <FiCopy />}
          </button>
        </div>
        <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(response.data, null, 2)}</pre>
      </div>
    );
  };

  const tabs = [
    { id: 'weather', name: 'Weather', icon: FiCloud },
    { id: 'forecast', name: 'Forecast', icon: FiCloud },
    { id: 'preferences', name: 'Preferences', icon: FiSettings },
    { id: 'external', name: 'External APIs', icon: FiMapPin },
    { id: 'health', name: 'Health', icon: FiHeart }
  ];

  const renderWeatherTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiMapPin className="mr-2" /> Location Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Get All Locations</h4>
            <div className="flex space-x-2">
              <select 
                value={selectedUnits} 
                onChange={(e) => setSelectedUnits(e.target.value)}
                className="px-3 py-2 border rounded-md flex-1"
              >
                <option value="METRIC">Metric</option>
                <option value="IMPERIAL">Imperial</option>
                <option value="STANDARD">Standard</option>
              </select>
              <button
                onClick={() => makeRequest(`/weather/locations?units=${selectedUnits}`, 'GET', null, 'weather', 'weather-locations')}
                disabled={loading['weather-locations']}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading['weather-locations'] ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
              </button>
            </div>
            {renderResponse('weather-locations', 'Response')}
          </div>

          <div>
            <h4 className="font-medium mb-2">Get Location Weather</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                placeholder="Location ID"
                className="px-3 py-2 border rounded-md flex-1"
              />
              <button
                onClick={() => makeRequest(`/weather/locations/${locationId}?units=${selectedUnits}`, 'GET', null, 'weather', `weather-location-${locationId}`)}
                disabled={loading[`weather-location-${locationId}`]}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading[`weather-location-${locationId}`] ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
              </button>
            </div>
            {renderResponse(`weather-location-${locationId}`, 'Response')}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newLocation.name}
            onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Country (2-letter code)"
            value={newLocation.country}
            onChange={(e) => setNewLocation({...newLocation, country: e.target.value})}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Latitude"
            value={newLocation.latitude}
            onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value})}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={newLocation.longitude}
            onChange={(e) => setNewLocation({...newLocation, longitude: e.target.value})}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Display Name"
            value={newLocation.displayName}
            onChange={(e) => setNewLocation({...newLocation, displayName: e.target.value})}
            className="px-3 py-2 border rounded-md"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newLocation.isFavorite}
              onChange={(e) => setNewLocation({...newLocation, isFavorite: e.target.checked})}
              className="mr-2"
            />
            Favorite
          </label>
        </div>
        <button
          onClick={handleAddLocation}
          disabled={loading['weather-add-location']}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          {loading['weather-add-location'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiPlus className="mr-2" />}
          Add Location
        </button>
        {renderResponse('weather-add-location', 'Response')}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Location Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => makeRequest(`/weather/locations/${locationId}/refresh?units=${selectedUnits}`, 'POST', null, 'weather', `weather-refresh-${locationId}`)}
            disabled={loading[`weather-refresh-${locationId}`]}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading[`weather-refresh-${locationId}`] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiRefreshCw className="mr-2" />}
            Refresh Weather
          </button>
          <button
            onClick={handleToggleFavorite}
            disabled={loading[`weather-favorite-${locationId}`]}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading[`weather-favorite-${locationId}`] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiHeart className="mr-2" />}
            Toggle Favorite
          </button>
          <button
            onClick={() => makeRequest(`/weather/locations/${locationId}`, 'DELETE', null, 'weather', `weather-delete-${locationId}`)}
            disabled={loading[`weather-delete-${locationId}`]}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading[`weather-delete-${locationId}`] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiTrash2 className="mr-2" />}
            Delete Location
          </button>
        </div>
        {renderResponse(`weather-refresh-${locationId}`, 'Refresh response')}
        {renderResponse(`weather-favorite-${locationId}`, 'Favorite response')}
        {renderResponse(`weather-delete-${locationId}`, 'Delete response')}
      </div>
    </div>
  );

  const renderForecastTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiCloud className="mr-2" /> Forecast Data
        </h3>
        <div className="flex space-x-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Location ID</label>
            <input
              type="text"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Units</label>
            <select 
              value={selectedUnits} 
              onChange={(e) => setSelectedUnits(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="METRIC">Metric</option>
              <option value="IMPERIAL">Imperial</option>
              <option value="STANDARD">Standard</option>
            </select>
          </div>
          <button
            onClick={() => makeRequest(`/forecast/${locationId}?units=${selectedUnits}`, 'GET', null, 'forecast', `forecast-${locationId}`)}
            disabled={loading[`forecast-${locationId}`]}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading[`forecast-${locationId}`] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiSend className="mr-2" />}
            Get Forecast
          </button>
        </div>
        {renderResponse(`forecast-${locationId}`, 'Response')}
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiUser className="mr-2" /> User Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Current Preferences</h4>
            <button
              onClick={() => makeRequest('/preferences', 'GET', null, 'preferences', 'preferences-get')}
              disabled={loading['preferences-get']}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center mb-4"
            >
              {loading['preferences-get'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiSend className="mr-2" />}
              Get Preferences
            </button>
            {renderResponse('preferences-get', 'Response')}
          </div>

          <div>
            <h4 className="font-medium mb-3">Update Preferences</h4>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Default Units</label>
                <select
                  value={userPrefs.defaultUnits}
                  onChange={(e) => setUserPrefs({...userPrefs, defaultUnits: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="METRIC">Metric</option>
                  <option value="IMPERIAL">Imperial</option>
                  <option value="STANDARD">Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Refresh Interval (minutes)</label>
                <input
                  type="number"
                  value={userPrefs.refreshIntervalMinutes}
                  onChange={(e) =>
                    setUserPrefs({
                      ...userPrefs,
                      refreshIntervalMinutes: Number.parseInt(e.target.value, 10) || 1
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  min="1"
                  max="1440"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPrefs.autoRefreshEnabled}
                  onChange={(e) => setUserPrefs({...userPrefs, autoRefreshEnabled: e.target.checked})}
                  className="mr-2"
                />
                Auto Refresh
              </label>
            </div>
            <button
              onClick={() => makeRequest('/preferences', 'PUT', userPrefs, 'preferences', 'preferences-put')}
              disabled={loading['preferences-put']}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {loading['preferences-put'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiSettings className="mr-2" />}
              Update Preferences
            </button>
            {renderResponse('preferences-put', 'Response')}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExternalApiTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">OpenWeatherMap Direct APIs</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() =>
              makeRequest(
                `https://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=${apiKey}`,
                'GET',
                null,
                'external',
                'external-geocoding'
              )
            }
            disabled={!apiKey}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Geocoding API
          </button>
          <button
            onClick={() =>
              makeRequest(
                `https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=${apiKey}&units=metric`,
                'GET',
                null,
                'external',
                'external-current'
              )
            }
            disabled={!apiKey}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Current Weather
          </button>
          <button
            onClick={() =>
              makeRequest(
                `https://api.openweathermap.org/data/2.5/forecast?lat=51.5074&lon=-0.1278&appid=${apiKey}&units=metric`,
                'GET',
                null,
                'external',
                'external-forecast'
              )
            }
            disabled={!apiKey}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Forecast API
          </button>
        </div>
        {!apiKey && (
          <p className="mt-3 text-sm text-red-600">
            Set <code>REACT_APP_WEATHER_API_KEY</code> to test direct OpenWeatherMap APIs.
          </p>
        )}
        {renderResponse('external-geocoding', 'Geocoding response')}
        {renderResponse('external-current', 'Current weather response')}
        {renderResponse('external-forecast', 'Forecast response')}
      </div>
    </div>
  );

  const renderHealthTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiHeart className="mr-2" /> Application Health
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => makeRequest(`${baseOrigin}/actuator/health`, 'GET', null, 'health', 'health-check')}
            disabled={loading['health-check']}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {loading['health-check'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiHeart className="mr-2" />}
            Health Check
          </button>
          <button
            onClick={() => makeRequest(`${baseOrigin}/actuator/info`, 'GET', null, 'health', 'app-info')}
            disabled={loading['app-info']}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading['app-info'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiSettings className="mr-2" />}
            App Info
          </button>
        </div>
        {renderResponse('health-check', 'Health Check')}
        {renderResponse('app-info', 'App Info')}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'weather': return renderWeatherTab();
      case 'forecast': return renderForecastTab();
      case 'preferences': return renderPreferencesTab();
      case 'external': return renderExternalApiTab();
      case 'health': return renderHealthTab();
      default: return renderWeatherTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Testing Interface</h1>
          <p className="text-gray-600">Test and explore all Weather App API endpoints</p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ApiTester;
