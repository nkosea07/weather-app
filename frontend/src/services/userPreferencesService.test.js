jest.mock('axios');

describe('userPreferencesService', () => {
  let axios;
  let userPreferencesService;
  let mockApi;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    axios = require('axios');
    mockApi = {
      get: jest.fn(),
      put: jest.fn(),
    };

    axios.create.mockReturnValue(mockApi);
    userPreferencesService = require('./userPreferencesService').default;
  });

  test('getUserPreferences fetches preferences from API', async () => {
    const payload = { defaultUnits: 'METRIC' };
    mockApi.get.mockResolvedValue({ data: payload });

    const result = await userPreferencesService.getUserPreferences();

    expect(mockApi.get).toHaveBeenCalledWith('/preferences');
    expect(result).toEqual(payload);
  });

  test('updateUserPreferences sends payload to API', async () => {
    const payload = { defaultUnits: 'IMPERIAL', autoRefreshEnabled: true };
    mockApi.put.mockResolvedValue({ data: payload });

    const result = await userPreferencesService.updateUserPreferences(payload);

    expect(mockApi.put).toHaveBeenCalledWith('/preferences', payload);
    expect(result).toEqual(payload);
  });
});
