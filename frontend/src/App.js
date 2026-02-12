import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import WeatherDashboard from './components/WeatherDashboard';
import DashboardOverview from './components/DashboardOverview';
import AddLocationModal from './components/AddLocationModal';
import UnitsSelector from './components/UnitsSelector';
import Navigation from './components/Navigation';
import ApiTester from './components/ApiTester';
import ApiDocumentation from './components/ApiDocumentation';
import weatherService from './services/weatherService';
import userPreferencesService from './services/userPreferencesService';
import { FiSun, FiRefreshCw, FiPlus, FiSettings } from 'react-icons/fi';

function App() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [units, setUnits] = useState('METRIC');
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    fetchUserPreferences();
    fetchLocations();
  }, []);

  useEffect(() => {
    // Refresh locations when units change
    if (locations.length > 0) {
      fetchLocations();
    }
  }, [units]);

  const fetchUserPreferences = async () => {
    try {
      setPreferencesLoading(true);
      const preferences = await userPreferencesService.getUserPreferences();
      setUnits(preferences.defaultUnits || 'METRIC');
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const updateUserPreferences = async (newUnits) => {
    try {
      await userPreferencesService.updateUserPreferences({ defaultUnits: newUnits });
      setUnits(newUnits);
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getAllLocations(units);
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all(
        locations.map(loc => weatherService.refreshWeather(loc.locationId, units))
      );
      await fetchLocations();
    } catch (error) {
      console.error('Failed to refresh all:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLocationAdded = () => {
    fetchLocations();
    setIsAddModalOpen(false);
  };

  const handleLocationDeleted = async (id) => {
    try {
      await weatherService.deleteLocation(id);
      await fetchLocations();
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  const handleToggleFavorite = async (id, currentStatus) => {
    try {
      await weatherService.updateLocation(id, { isFavorite: !currentStatus });
      await fetchLocations();
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  };

  const handleUnitsChange = (newUnits) => {
    updateUserPreferences(newUnits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Toaster position="top-right" />

      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {activeView === 'dashboard' && (
        <>
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <FiSun className="h-8 w-8 text-yellow-500" />
                  <h1 className="ml-2 text-xl font-bold text-gray-800">
                    Weather Platform
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <UnitsSelector
                    units={units}
                    onUnitsChange={handleUnitsChange}
                    showLabel={false}
                  />
                  <button
                    onClick={handleRefreshAll}
                    disabled={refreshing}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh All
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Location
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <DashboardOverview />
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <WeatherDashboard
                locations={locations}
                units={units}
                onDelete={handleLocationDeleted}
                onToggleFavorite={handleToggleFavorite}
                onRefresh={fetchLocations}
              />
            )}
          </main>

          <AddLocationModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onLocationAdded={handleLocationAdded}
          />
        </>
      )}

      {activeView === 'api-tester' && <ApiTester />}

      {activeView === 'api-docs' && <ApiDocumentation />}

      {activeView === 'settings' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600">Application settings and configuration coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;