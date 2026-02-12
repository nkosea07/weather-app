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
    refreshInterval: 30,
    autoRefresh: true
  });

  const [selectedUnits, setSelectedUnits] = useState('METRIC');
  const [locationId, setLocationId] = useState('1');

  const baseUrl = 'http://localhost:8080/api';

  const makeRequest = async (endpoint, method = 'GET', body = null, tab = '') => {
    const loadingKey = `${tab}-${endpoint}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${baseUrl}${endpoint}`, options);
      const data = await response.json();

      setResponses(prev => ({
        ...prev,
        [loadingKey]: {
          status: response.status,
          statusText: response.statusText,
          data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));

      toast.success(`Request successful: ${response.status}`);
    } catch (error) {
      setResponses(prev => ({
        ...prev,
        [loadingKey]: {
          status: 'ERROR',
          statusText: error.message,
          data: { error: error.message },
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      toast.error('Request failed');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(prev => ({ ...prev, [key]: true }));
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
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
                onClick={() => makeRequest(`/weather/locations?units=${selectedUnits}`, 'GET', null, 'weather')}
                disabled={loading['weather-/weather/locations']}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading['weather-/weather/locations'] ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
              </button>
            </div>
            {responses['weather-/weather/locations'] && (
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Response ({responses['weather-/weather/locations'].status})</span>
                  <button
                    onClick={() => copyToClipboard(responses['weather-/weather/locations'].data, 'weather-locations')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied['weather-locations'] ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(responses['weather-/weather/locations'].data, null, 2)}
                </pre>
              </div>
            )}
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
                onClick={() => makeRequest(`/weather/locations/${locationId}?units=${selectedUnits}`, 'GET', null, 'weather')}
                disabled={loading[`weather-/weather/locations/${locationId}`]}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading[`weather-/weather/locations/${locationId}`] ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
              </button>
            </div>
            {responses[`weather-/weather/locations/${locationId}`] && (
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Response ({responses[`weather-/weather/locations/${locationId}`].status})</span>
                  <button
                    onClick={() => copyToClipboard(responses[`weather-/weather/locations/${locationId}`].data, `weather-location-${locationId}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied[`weather-location-${locationId}`] ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(responses[`weather-/weather/locations/${locationId}`].data, null, 2)}
                </pre>
              </div>
            )}
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
            placeholder="Country"
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
          onClick={() => makeRequest('/weather/locations', 'POST', newLocation, 'weather')}
          disabled={loading['weather-/weather/locations-post']}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          {loading['weather-/weather/locations-post'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiPlus className="mr-2" />}
          Add Location
        </button>
        {responses['weather-/weather/locations-post'] && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Response ({responses['weather-/weather/locations-post'].status})</span>
              <button
                onClick={() => copyToClipboard(responses['weather-/weather/locations-post'].data, 'weather-add-location')}
                className="text-blue-600 hover:text-blue-800"
              >
                {copied['weather-add-location'] ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(responses['weather-/weather/locations-post'].data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Location Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => makeRequest(`/weather/locations/${locationId}/refresh?units=${selectedUnits}`, 'POST', null, 'weather')}
            disabled={loading[`weather-/weather/locations/${locationId}/refresh`]}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading[`weather-/weather/locations/${locationId}/refresh`] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiRefreshCw className="mr-2" />}
            Refresh Weather
          </button>
          <button
            onClick={() => makeRequest(`/weather/locations/${locationId}/favorite`, 'PATCH', null, 'weather')}
            disabled={loading[`weather-/weather/locations/${locationId}/favorite`]}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading[`weather-/weather/locations/${locationId}/favorite`] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiHeart className="mr-2" />}
            Toggle Favorite
          </button>
          <button
            onClick={() => makeRequest(`/weather/locations/${locationId}`, 'DELETE', null, 'weather')}
            disabled={loading[`weather-/weather/locations/${locationId}/delete`]}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading[`weather-/weather/locations/${locationId}/delete`] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiTrash2 className="mr-2" />}
            Delete Location
          </button>
        </div>
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
            onClick={() => makeRequest(`/forecast/locations/${locationId}?units=${selectedUnits}`, 'GET', null, 'forecast')}
            disabled={loading[`forecast-/forecast/locations/${locationId}`]}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading[`forecast-/forecast/locations/${locationId}`] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiSend className="mr-2" />}
            Get Forecast
          </button>
        </div>
        {responses[`forecast-/forecast/locations/${locationId}`] && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Response ({responses[`forecast-/forecast/locations/${locationId}`].status})</span>
              <button
                onClick={() => copyToClipboard(responses[`forecast-/forecast/locations/${locationId}`].data, `forecast-${locationId}`)}
                className="text-blue-600 hover:text-blue-800"
              >
                {copied[`forecast-${locationId}`] ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(responses[`forecast-/forecast/locations/${locationId}`].data, null, 2)}
            </pre>
          </div>
        )}
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
              onClick={() => makeRequest('/user/preferences', 'GET', null, 'preferences')}
              disabled={loading['preferences-/user/preferences']}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center mb-4"
            >
              {loading['preferences-/user/preferences'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiSend className="mr-2" />}
              Get Preferences
            </button>
            {responses['preferences-/user/preferences'] && (
              <div className="p-3 bg-gray-100 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Response ({responses['preferences-/user/preferences'].status})</span>
                  <button
                    onClick={() => copyToClipboard(responses['preferences-/user/preferences'].data, 'preferences-get')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied['preferences-get'] ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(responses['preferences-/user/preferences'].data, null, 2)}
                </pre>
              </div>
            )}
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
                  value={userPrefs.refreshInterval}
                  onChange={(e) => setUserPrefs({...userPrefs, refreshInterval: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                  min="1"
                  max="1440"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPrefs.autoRefresh}
                  onChange={(e) => setUserPrefs({...userPrefs, autoRefresh: e.target.checked})}
                  className="mr-2"
                />
                Auto Refresh
              </label>
            </div>
            <button
              onClick={() => makeRequest('/user/preferences', 'PUT', userPrefs, 'preferences')}
              disabled={loading['preferences-/user/preferences-put']}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {loading['preferences-/user/preferences-put'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiSettings className="mr-2" />}
              Update Preferences
            </button>
            {responses['preferences-/user/preferences-put'] && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Response ({responses['preferences-/user/preferences-put'].status})</span>
                  <button
                    onClick={() => copyToClipboard(responses['preferences-/user/preferences-put'].data, 'preferences-put')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied['preferences-put'] ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(responses['preferences-/user/preferences-put'].data, null, 2)}
                </pre>
              </div>
            )}
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
            onClick={() => makeRequest(`http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=d12efcda9379853b2a8618285c813282`, 'GET', null, 'external')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Geocoding API
          </button>
          <button
            onClick={() => makeRequest(`https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=d12efcda9379853b2a8618285c813282&units=metric`, 'GET', null, 'external')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Current Weather
          </button>
          <button
            onClick={() => makeRequest(`https://api.openweathermap.org/data/2.5/forecast?lat=51.5074&lon=-0.1278&appid=d12efcda9379853b2a8618285c813282&units=metric`, 'GET', null, 'external')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Forecast API
          </button>
        </div>
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
            onClick={() => makeRequest('http://localhost:8080/actuator/health', 'GET', null, 'health')}
            disabled={loading['health-/actuator/health']}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {loading['health-/actuator/health'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiHeart className="mr-2" />}
            Health Check
          </button>
          <button
            onClick={() => makeRequest('http://localhost:8080/actuator/info', 'GET', null, 'health')}
            disabled={loading['health-/actuator/info']}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading['health-/actuator/info'] ? <FiRefreshCw className="animate-spin mr-2" /> : <FiSettings className="mr-2" />}
            App Info
          </button>
        </div>
        
        {(responses['health-/actuator/health'] || responses['health-/actuator/info']) && (
          <div className="mt-4 space-y-4">
            {responses['health-/actuator/health'] && (
              <div className="p-3 bg-gray-100 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Health Check ({responses['health-/actuator/health'].status})</span>
                  <button
                    onClick={() => copyToClipboard(responses['health-/actuator/health'].data, 'health-check')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied['health-check'] ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(responses['health-/actuator/health'].data, null, 2)}
                </pre>
              </div>
            )}
            {responses['health-/actuator/info'] && (
              <div className="p-3 bg-gray-100 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">App Info ({responses['health-/actuator/info'].status})</span>
                  <button
                    onClick={() => copyToClipboard(responses['health-/actuator/info'].data, 'app-info')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied['app-info'] ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(responses['health-/actuator/info'].data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
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
