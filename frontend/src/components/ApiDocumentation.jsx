import React, { useState } from 'react';
import { FiCopy, FiCheck, FiBook, FiCode, FiServer, FiDatabase, FiCloud, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ApiDocumentation = () => {
  const [copied, setCopied] = useState({});

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const endpoints = [
    {
      category: 'Weather Management',
      icon: FiCloud,
      endpoints: [
        {
          method: 'GET',
          path: '/api/weather/locations',
          description: 'Retrieve all locations with current weather data',
          parameters: [
            { name: 'units', type: 'query', required: false, description: 'Units: METRIC, IMPERIAL, STANDARD', default: 'METRIC' }
          ],
          response: 'Array of WeatherResponseDTO objects',
          example: 'GET /api/weather/locations?units=METRIC'
        },
        {
          method: 'POST',
          path: '/api/weather/locations',
          description: 'Add a new location to track weather data',
          parameters: [
            { name: 'name', type: 'body', required: true, description: 'Location name' },
            { name: 'country', type: 'body', required: true, description: 'Country code (2 letters)' },
            { name: 'latitude', type: 'body', required: true, description: 'Latitude coordinate' },
            { name: 'longitude', type: 'body', required: true, description: 'Longitude coordinate' },
            { name: 'displayName', type: 'body', required: false, description: 'Custom display name' },
            { name: 'isFavorite', type: 'body', required: false, description: 'Mark as favorite', default: 'false' }
          ],
          response: 'WeatherResponseDTO object',
          example: 'POST /api/weather/locations\nBody: {"name":"London","country":"GB","latitude":51.5074,"longitude":-0.1278,"displayName":"London, GB","isFavorite":false}'
        },
        {
          method: 'GET',
          path: '/api/weather/locations/{id}',
          description: 'Get current weather for a specific location',
          parameters: [
            { name: 'id', type: 'path', required: true, description: 'Location ID' },
            { name: 'units', type: 'query', required: false, description: 'Units: METRIC, IMPERIAL, STANDARD', default: 'METRIC' }
          ],
          response: 'WeatherResponseDTO object',
          example: 'GET /api/weather/locations/1?units=METRIC'
        },
        {
          method: 'POST',
          path: '/api/weather/locations/{id}/refresh',
          description: 'Force refresh weather data for a specific location',
          parameters: [
            { name: 'id', type: 'path', required: true, description: 'Location ID' },
            { name: 'units', type: 'query', required: false, description: 'Units: METRIC, IMPERIAL, STANDARD', default: 'METRIC' }
          ],
          response: 'WeatherResponseDTO object',
          example: 'POST /api/weather/locations/1/refresh?units=METRIC'
        },
        {
          method: 'PATCH',
          path: '/api/weather/locations/{id}/favorite',
          description: 'Toggle favorite status of a location',
          parameters: [
            { name: 'id', type: 'path', required: true, description: 'Location ID' }
          ],
          response: 'Updated WeatherResponseDTO object',
          example: 'PATCH /api/weather/locations/1/favorite'
        },
        {
          method: 'DELETE',
          path: '/api/weather/locations/{id}',
          description: 'Delete a location and all its weather data',
          parameters: [
            { name: 'id', type: 'path', required: true, description: 'Location ID' }
          ],
          response: '204 No Content',
          example: 'DELETE /api/weather/locations/1'
        }
      ]
    },
    {
      category: 'Forecast Management',
      icon: FiCloud,
      endpoints: [
        {
          method: 'GET',
          path: '/api/forecast/locations/{id}',
          description: 'Get 5-day forecast for a specific location',
          parameters: [
            { name: 'id', type: 'path', required: true, description: 'Location ID' },
            { name: 'units', type: 'query', required: false, description: 'Units: METRIC, IMPERIAL, STANDARD', default: 'METRIC' }
          ],
          response: 'Array of ForecastDTO objects grouped by date',
          example: 'GET /api/forecast/locations/1?units=METRIC'
        }
      ]
    },
    {
      category: 'User Preferences',
      icon: FiUser,
      endpoints: [
        {
          method: 'GET',
          path: '/api/user/preferences',
          description: 'Get current user preferences',
          parameters: [],
          response: 'UserPreferencesDTO object',
          example: 'GET /api/user/preferences'
        },
        {
          method: 'PUT',
          path: '/api/user/preferences',
          description: 'Update user preferences',
          parameters: [
            { name: 'defaultUnits', type: 'body', required: false, description: 'Default units system', default: 'METRIC' },
            { name: 'refreshInterval', type: 'body', required: false, description: 'Auto-refresh interval in minutes', default: '30' },
            { name: 'autoRefresh', type: 'body', required: false, description: 'Enable auto-refresh', default: 'true' }
          ],
          response: 'Updated UserPreferencesDTO object',
          example: 'PUT /api/user/preferences\nBody: {"defaultUnits":"METRIC","refreshInterval":30,"autoRefresh":true}'
        }
      ]
    },
    {
      category: 'Health & Monitoring',
      icon: FiServer,
      endpoints: [
        {
          method: 'GET',
          path: '/actuator/health',
          description: 'Check application health status',
          parameters: [],
          response: 'Health status object',
          example: 'GET /actuator/health'
        },
        {
          method: 'GET',
          path: '/actuator/info',
          description: 'Get application information',
          parameters: [],
          response: 'Application info object',
          example: 'GET /actuator/info'
        }
      ]
    }
  ];

  const dataModels = [
    {
      name: 'WeatherResponseDTO',
      description: 'Complete weather data for a location',
      fields: [
        { name: 'locationId', type: 'Long', description: 'Location identifier' },
        { name: 'name', type: 'String', description: 'Location name' },
        { name: 'country', type: 'String', description: 'Country code' },
        { name: 'displayName', type: 'String', description: 'Display name' },
        { name: 'latitude', type: 'Double', description: 'Latitude coordinate' },
        { name: 'longitude', type: 'Double', description: 'Longitude coordinate' },
        { name: 'isFavorite', type: 'Boolean', description: 'Favorite status' },
        { name: 'temperature', type: 'Double', description: 'Current temperature' },
        { name: 'feelsLike', type: 'Double', description: 'Feels like temperature' },
        { name: 'humidity', type: 'Integer', description: 'Humidity percentage' },
        { name: 'pressure', type: 'Integer', description: 'Atmospheric pressure' },
        { name: 'windSpeed', type: 'Double', description: 'Wind speed' },
        { name: 'windDirection', type: 'Integer', description: 'Wind direction in degrees' },
        { name: 'weatherCondition', type: 'String', description: 'Weather condition' },
        { name: 'weatherDescription', type: 'String', description: 'Weather description' },
        { name: 'weatherIcon', type: 'String', description: 'Weather icon code' },
        { name: 'cloudiness', type: 'Integer', description: 'Cloudiness percentage' },
        { name: 'visibility', type: 'Integer', description: 'Visibility in meters' },
        { name: 'fetchedAt', type: 'String', description: 'Data fetch timestamp' }
      ]
    },
    {
      name: 'ForecastDTO',
      description: 'Weather forecast data point',
      fields: [
        { name: 'forecastTime', type: 'String', description: 'Forecast timestamp' },
        { name: 'temperature', type: 'Double', description: 'Forecast temperature' },
        { name: 'feelsLike', type: 'Double', description: 'Feels like temperature' },
        { name: 'humidity', type: 'Integer', description: 'Humidity percentage' },
        { name: 'pressure', type: 'Integer', description: 'Atmospheric pressure' },
        { name: 'windSpeed', type: 'Double', description: 'Wind speed' },
        { name: 'windDirection', type: 'Integer', description: 'Wind direction in degrees' },
        { name: 'weatherCondition', type: 'String', description: 'Weather condition' },
        { name: 'weatherDescription', type: 'String', description: 'Weather description' },
        { name: 'weatherIcon', type: 'String', description: 'Weather icon code' },
        { name: 'cloudiness', type: 'Integer', description: 'Cloudiness percentage' },
        { name: 'precipitationProbability', type: 'Double', description: 'Precipitation probability' }
      ]
    },
    {
      name: 'UserPreferencesDTO',
      description: 'User preferences configuration',
      fields: [
        { name: 'defaultUnits', type: 'String', description: 'Default units system (METRIC, IMPERIAL, STANDARD)' },
        { name: 'refreshInterval', type: 'Integer', description: 'Auto-refresh interval in minutes' },
        { name: 'autoRefresh', type: 'Boolean', description: 'Enable auto-refresh' },
        { name: 'createdAt', type: 'String', description: 'Creation timestamp' },
        { name: 'updatedAt', type: 'String', description: 'Last update timestamp' }
      ]
    }
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <FiBook className="mr-3" /> API Documentation
          </h1>
          <p className="text-gray-600">Complete API reference for the Weather Data Integration Platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiDatabase className="mr-2" /> Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Endpoints:</span>
                  <span className="font-medium">{endpoints.reduce((acc, cat) => acc + cat.endpoints.length, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories:</span>
                  <span className="font-medium">{endpoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Models:</span>
                  <span className="font-medium">{dataModels.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base URL:</span>
                  <span className="font-medium text-sm">http://localhost:8080/api</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Authentication</h4>
                <p className="text-blue-800 text-sm">Currently, the API does not require authentication. All endpoints are publicly accessible.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Base URL</h4>
                <div className="flex items-center justify-between">
                  <code className="text-green-800 text-sm">http://localhost:8080/api</code>
                  <button
                    onClick={() => copyToClipboard('http://localhost:8080/api', 'base-url')}
                    className="text-green-600 hover:text-green-800"
                  >
                    {copied['base-url'] ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {endpoints.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Icon className="mr-2" /> {category.category}
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {category.endpoints.map((endpoint, endpointIndex) => (
                    <div key={endpointIndex} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}-${endpointIndex}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {copied[`endpoint-${index}-${endpointIndex}`] ? <FiCheck /> : <FiCopy />}
                        </button>
                      </div>
                      <p className="text-gray-700 mb-3">{endpoint.description}</p>
                      
                      {endpoint.parameters.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium text-sm mb-2">Parameters:</h4>
                          <div className="bg-gray-50 rounded p-3">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-1">Name</th>
                                  <th className="text-left py-1">Type</th>
                                  <th className="text-left py-1">Required</th>
                                  <th className="text-left py-1">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {endpoint.parameters.map((param, paramIndex) => (
                                  <tr key={paramIndex} className="border-b border-gray-100">
                                    <td className="py-1 font-mono text-xs">{param.name}</td>
                                    <td className="py-1 text-xs">{param.type}</td>
                                    <td className="py-1 text-xs">{param.required ? 'Yes' : 'No'}</td>
                                    <td className="py-1 text-xs">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-sm mb-1">Response:</h4>
                        <p className="text-sm text-gray-600">{endpoint.response}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">Example:</h4>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                          <pre>{endpoint.example}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiCode className="mr-2" /> Data Models
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataModels.map((model, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{model.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                  <div className="bg-gray-50 rounded p-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-1">Field</th>
                          <th className="text-left py-1">Type</th>
                          <th className="text-left py-1">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {model.fields.map((field, fieldIndex) => (
                          <tr key={fieldIndex} className="border-b border-gray-100">
                            <td className="py-1 font-mono text-xs">{field.name}</td>
                            <td className="py-1 text-xs">{field.type}</td>
                            <td className="py-1 text-xs">{field.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
