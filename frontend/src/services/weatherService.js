import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class WeatherService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Geocoding for location search
  async searchLocations(query) {
    try {
      // Use OpenWeatherMap Geocoding API directly
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      if (!apiKey) {
        throw new Error('Weather API key is not configured');
      }
      
      const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: apiKey
        }
      });
      
      return response.data.map(location => ({
        name: location.name,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
        displayName: `${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}`
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to search locations');
    }
  }

  async reverseGeocodeCoordinates(latitude, longitude) {
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      if (!apiKey) {
        throw new Error('Weather API key is not configured');
      }

      const response = await axios.get('https://api.openweathermap.org/geo/1.0/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          limit: 1,
          appid: apiKey
        }
      });

      const [location] = response.data || [];
      if (!location) {
        return null;
      }

      return {
        name: location.name,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
        displayName: `${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}`
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Location Management
  async getAllLocations(units = 'METRIC') {
    const response = await this.api.get('/weather/locations', {
      params: { units }
    });
    return response.data;
  }

  async getLocationWeather(locationId, units = 'METRIC') {
    const response = await this.api.get(`/weather/locations/${locationId}`, {
      params: { units }
    });
    return response.data;
  }

  async addLocation(locationData) {
    const response = await this.api.post('/weather/locations', locationData);
    return response.data;
  }

  async updateLocation(locationId, updateData) {
    const response = await this.api.put(`/weather/locations/${locationId}`, updateData);
    return response.data;
  }

  async deleteLocation(locationId) {
    await this.api.delete(`/weather/locations/${locationId}`);
  }

  async refreshWeather(locationId, units = 'METRIC') {
    const response = await this.api.post(`/weather/locations/${locationId}/refresh`, null, {
      params: { units }
    });
    return response.data;
  }

  // Forecast
  async getForecast(locationId, units = 'METRIC') {
    const response = await this.api.get(`/forecast/${locationId}`, {
      params: { units }
    });
    return response.data;
  }

  // User Preferences
  async getUserPreferences() {
    const response = await this.api.get('/preferences');
    return response.data;
  }

  async updateUserPreferences(preferences) {
    const response = await this.api.put('/preferences', preferences);
    return response.data;
  }

  // Utility method to get weather icon URL
  getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  // Utility method to format temperature
  formatTemperature(temp, units) {
    if (temp === null || temp === undefined) return 'N/A';
    
    const rounded = Math.round(temp);
    switch (units) {
      case 'IMPERIAL':
        return `${rounded}°F`;
      case 'STANDARD':
        return `${rounded}K`;
      case 'METRIC':
      default:
        return `${rounded}°C`;
    }
  }

  // Utility method to format wind speed
  formatWindSpeed(speed, units) {
    if (speed === null || speed === undefined) return 'N/A';
    
    const rounded = Math.round(speed);
    switch (units) {
      case 'IMPERIAL':
        return `${rounded} mph`;
      case 'STANDARD':
      case 'METRIC':
      default:
        return `${rounded} m/s`;
    }
  }

  // Utility method to format pressure
  formatPressure(pressure) {
    if (pressure === null || pressure === undefined) return 'N/A';
    return `${pressure} hPa`;
  }

  // Utility method to format humidity
  formatHumidity(humidity) {
    if (humidity === null || humidity === undefined) return 'N/A';
    return `${humidity}%`;
  }

  // Utility method to format visibility
  formatVisibility(visibility, units) {
    if (visibility === null || visibility === undefined) return 'N/A';
    
    switch (units) {
      case 'IMPERIAL':
        return `${(visibility / 1609.34).toFixed(1)} miles`;
      case 'STANDARD':
      case 'METRIC':
      default:
        return `${(visibility / 1000).toFixed(1)} km`;
    }
  }
}

export const weatherService = new WeatherService();
export default weatherService;
