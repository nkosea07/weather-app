import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiServer, FiDatabase, FiActivity, FiMapPin, FiRefreshCw, FiHeart } from 'react-icons/fi';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

const hasWeatherSnapshot = (location) => location.temperature !== null && location.temperature !== undefined;

const DashboardOverview = ({
  locations = [],
  loading = false,
  refreshing = false,
  onRefreshAll,
  lastSyncAt,
  sessionRefreshCount = 0,
  hasError = false
}) => {
  const safeLocations = Array.isArray(locations) ? locations : [];
  const totalLocations = safeLocations.length;
  const favoriteLocations = safeLocations.filter((location) => location.isFavorite).length;
  const syncedLocations = safeLocations.filter(hasWeatherSnapshot).length;
  const staleLocations = safeLocations.filter((location) => {
    if (!location.lastUpdated) {
      return true;
    }
    const age = Date.now() - new Date(location.lastUpdated).getTime();
    return Number.isNaN(age) || age > THREE_HOURS_MS;
  }).length;

  const latestLocationSync = safeLocations
    .map((location) => location.lastUpdated)
    .filter(Boolean)
    .reduce((latest, current) => {
      if (!latest) {
        return current;
      }
      return new Date(current) > new Date(latest) ? current : latest;
    }, null);

  const effectiveLastSync = lastSyncAt || latestLocationSync;
  const systemHealth = hasError ? 'DEGRADED' : 'UP';

  const statCards = [
    {
      title: 'Total Locations',
      value: totalLocations,
      icon: FiMapPin,
      color: 'bg-blue-500',
      subtitle: 'Tracked in this session'
    },
    {
      title: 'Favorite Locations',
      value: favoriteLocations,
      icon: FiHeart,
      color: 'bg-pink-500',
      subtitle: 'Pinned by user'
    },
    {
      title: 'Synced Locations',
      value: syncedLocations,
      icon: FiDatabase,
      color: 'bg-green-500',
      subtitle: 'Loaded from DB/API'
    },
    {
      title: 'Stale Locations',
      value: staleLocations,
      icon: FiActivity,
      color: 'bg-cyan-600',
      subtitle: 'No update in 3+ hours'
    }
  ];

  const recentActivity = safeLocations
    .filter((location) => location.lastUpdated)
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 5)
    .map((location) => ({
      message: `Weather synced for "${location.displayName || location.locationName}"`,
      time: formatDistanceToNow(new Date(location.lastUpdated), { addSuffix: true })
    }));

  const syncCoverage = totalLocations === 0 ? '0%' : `${Math.round((syncedLocations / totalLocations) * 100)}%`;

  const systemMetrics = [
    {
      name: 'Sync Coverage',
      value: `${syncedLocations}/${totalLocations}`,
      status: syncedLocations === totalLocations ? 'good' : 'warning',
      threshold: '100%'
    },
    {
      name: 'Session Refreshes',
      value: String(sessionRefreshCount),
      status: 'good',
      threshold: 'Live'
    },
    {
      name: 'Stale Data',
      value: `${staleLocations}`,
      status: staleLocations === 0 ? 'good' : 'warning',
      threshold: '0'
    },
    {
      name: 'Coverage Percent',
      value: syncCoverage,
      status: syncedLocations === totalLocations ? 'good' : 'warning',
      threshold: '100%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const handleRefresh = async () => {
    if (onRefreshAll) {
      await onRefreshAll();
    }
  };

  if (loading && totalLocations === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-100">System status and performance metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || !onRefreshAll}
          className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
        >
          <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-slate-600">{stat.subtitle}</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Health and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiServer className="mr-2" /> System Health
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className={`mr-3 h-3 w-3 rounded-full ${systemHealth === 'UP' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="font-medium">System Status</span>
              </div>
              <span className={`font-medium ${systemHealth === 'UP' ? 'text-green-600' : 'text-yellow-700'}`}>{systemHealth}</span>
            </div>
            <div className="text-sm text-gray-800">
              <p>Last sync: {effectiveLastSync ? new Date(effectiveLastSync).toLocaleString() : 'Never'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiActivity className="mr-2" /> Performance Metrics
          </h2>
          <div className="space-y-3">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{metric.name}</p>
                  <p className="text-xs text-gray-700">Threshold: {metric.threshold}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metric.value}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiActivity className="mr-2" /> Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-700">
            No sync activity yet for this session.
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex-shrink-0">
                  <FiActivity className="h-5 w-5 text-gray-800" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.message}</p>
                  <p className="text-xs text-gray-700">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
