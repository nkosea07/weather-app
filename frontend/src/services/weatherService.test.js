jest.mock('axios');

describe('weatherService', () => {
  const originalApiKey = process.env.REACT_APP_WEATHER_API_KEY;
  let axios;
  let weatherService;
  let mockApi;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    axios = require('axios');
    mockApi = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    };

    axios.create.mockReturnValue(mockApi);
    process.env.REACT_APP_WEATHER_API_KEY = 'test-api-key';
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    weatherService = require('./weatherService').default;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    process.env.REACT_APP_WEATHER_API_KEY = originalApiKey;
  });

  test('configures response interceptor on construction', () => {
    expect(mockApi.interceptors.response.use).toHaveBeenCalledTimes(1);
  });

  test('getAllLocations returns API data', async () => {
    const payload = [{ locationId: 1 }];
    mockApi.get.mockResolvedValue({ data: payload });

    const result = await weatherService.getAllLocations('IMPERIAL');

    expect(mockApi.get).toHaveBeenCalledWith('/weather/locations', {
      params: { units: 'IMPERIAL' },
    });
    expect(result).toEqual(payload);
  });

  test('searchLocations maps OpenWeather response', async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          name: 'London',
          country: 'GB',
          state: 'England',
          lat: 51.5074,
          lon: -0.1278,
        },
      ],
    });

    const result = await weatherService.searchLocations('London');

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/geo/1.0/direct',
      {
        params: {
          q: 'London',
          limit: 5,
          appid: 'test-api-key',
        },
      }
    );
    expect(result).toEqual([
      {
        name: 'London',
        country: 'GB',
        lat: 51.5074,
        lon: -0.1278,
        displayName: 'London, England, GB',
      },
    ]);
  });

  test('searchLocations throws friendly error when API key is missing', async () => {
    delete process.env.REACT_APP_WEATHER_API_KEY;

    await expect(weatherService.searchLocations('London')).rejects.toThrow(
      'Failed to search locations'
    );
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('reverseGeocodeCoordinates returns null on request failure', async () => {
    axios.get.mockRejectedValue(new Error('network'));

    const result = await weatherService.reverseGeocodeCoordinates(-33.9, 18.4);

    expect(result).toBeNull();
  });

  test('format helpers return expected strings', () => {
    expect(weatherService.formatTemperature(24.6, 'METRIC')).toBe('25°C');
    expect(weatherService.formatWindSpeed(12.2, 'IMPERIAL')).toBe('12 mph');
    expect(weatherService.formatPressure(1012)).toBe('1012 hPa');
    expect(weatherService.formatHumidity(80)).toBe('80%');
    expect(weatherService.formatVisibility(5000, 'METRIC')).toBe('5.0 km');
  });
});
