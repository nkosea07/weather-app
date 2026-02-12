import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class UserPreferencesService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getUserPreferences() {
    const response = await this.api.get('/preferences');
    return response.data;
  }

  async updateUserPreferences(preferences) {
    const response = await this.api.put('/preferences', preferences);
    return response.data;
  }
}

export const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
