import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import WeatherDashboard from './components/WeatherDashboard';
import DashboardOverview from './components/DashboardOverview';
import AddLocationModal from './components/AddLocationModal';
import UnitsSelector from './components/UnitsSelector';
import Navigation from './components/Navigation';
import ApiTester from './components/ApiTester';
import ApiDocumentation from './components/ApiDocumentation';
import weatherService from './services/weatherService';
import userPreferencesService from './services/userPreferencesService';
import { FiSun, FiRefreshCw, FiPlus, FiMapPin, FiStar } from 'react-icons/fi';

function App() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [units, setUnits] = useState('METRIC');
  const [activeView, setActiveView] = useState('dashboard');
  const [locationsError, setLocationsError] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [sessionRefreshCount, setSessionRefreshCount] = useState(0);

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
      const preferences = await userPreferencesService.getUserPreferences();
      setUnits(preferences.defaultUnits || 'METRIC');
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
      toast.error('Failed to load user preferences');
    }
  };

  const updateUserPreferences = async (newUnits) => {
    try {
      await userPreferencesService.updateUserPreferences({ defaultUnits: newUnits });
      setUnits(newUnits);
      toast.success(`Units set to ${newUnits}`);
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      toast.error('Failed to update units');
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setLocationsError(null);
      const data = await weatherService.getAllLocations(units);
      setLocations(data);
      setLastSyncAt(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setLocationsError(error);
      toast.error('Failed to load locations');
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
      setSessionRefreshCount((count) => count + 1);
      toast.success('Weather data refreshed');
    } catch (error) {
      console.error('Failed to refresh all:', error);
      toast.error('Failed to refresh all locations');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLocationAdded = () => {
    fetchLocations();
    setIsAddModalOpen(false);
    toast.success('Location added');
  };

  const handleLocationDeleted = async (id) => {
    await fetchLocations();
    toast.success('Location deleted');
  };

  const handleToggleFavorite = async (id, currentStatus) => {
    await fetchLocations();
    toast.success(!currentStatus ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleUnitsChange = (newUnits) => {
    updateUserPreferences(newUnits);
  };

  const favoriteCount = locations.filter((loc) => loc.isFavorite).length;

  return (
    <div className="app-shell">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(255, 255, 255, 0.92)',
            color: '#0f172a',
          },
        }}
      />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl animate-float-slow" />
        <div className="absolute right-8 top-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
      </div>

      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {activeView === 'dashboard' && (
        <>
          <section className="glass-panel mt-6 animate-fade-in-up">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold tracking-wide text-amber-100">
                    <FiSun className="mr-2 h-4 w-4" />
                    Live weather operations
                  </div>
                  <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                    Forecast control center
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-white sm:text-base">
                    Track every city, refresh with one click, and keep top priorities pinned.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <UnitsSelector units={units} onUnitsChange={handleUnitsChange} showLabel={true} />
                  <button onClick={handleRefreshAll} disabled={refreshing} className="action-btn">
                    <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh all
                  </button>
                  <button onClick={() => setIsAddModalOpen(true)} className="action-btn-primary">
                    <FiPlus className="h-4 w-4" />
                    Add location
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white">Tracked</p>
                  <p className="mt-1 flex items-center text-2xl font-bold text-white">
                    <FiMapPin className="mr-2 h-5 w-5 text-cyan-300" />
                    {locations.length}
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white">Favorites</p>
                  <p className="mt-1 flex items-center text-2xl font-bold text-white">
                    <FiStar className="mr-2 h-5 w-5 text-amber-300" />
                    {favoriteCount}
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white">Units</p>
                  <p className="mt-1 text-2xl font-bold text-white">{units}</p>
                </div>
              </div>
            </div>
          </section>

          <main className="mt-8 space-y-8">
            <div className="glass-panel p-6 sm:p-8">
              <DashboardOverview
                locations={locations}
                loading={loading}
                refreshing={refreshing}
                onRefreshAll={handleRefreshAll}
                lastSyncAt={lastSyncAt}
                sessionRefreshCount={sessionRefreshCount}
                hasError={Boolean(locationsError)}
              />
            </div>
            {loading ? (
              <div className="glass-panel flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-sky-300"></div>
              </div>
            ) : (
              <WeatherDashboard
                locations={locations}
                units={units}
                onDelete={handleLocationDeleted}
                onToggleFavorite={handleToggleFavorite}
                onRefresh={fetchLocations}
                onAddLocation={() => setIsAddModalOpen(true)}
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
        <div className="mt-8">
          <div className="glass-panel p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="mt-2 text-white">
              Application settings and configuration are coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
