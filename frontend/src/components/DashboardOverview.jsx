import React, { useState, useEffect } from 'react';
import { FiServer, FiDatabase, FiActivity, FiCloud, FiUsers, FiMapPin, FiRefreshCw, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalLocations: 0,
    favoriteLocations: 0,
    totalWeatherSnapshots: 0,
    apiCallsToday: 0,
    systemHealth: 'UP',
    lastSync: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Simulate API calls - in real implementation, these would be actual API calls
      const mockStats = {
        totalLocations: 12,
        favoriteLocations: 5,
        totalWeatherSnapshots: 1248,
        apiCallsToday: 342,
        systemHealth: 'UP',
        lastSync: new Date().toISOString()
      };
      setStats(mockStats);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const statCards = [
    {
      title: 'Total Locations',
      value: stats.totalLocations,
      icon: FiMapPin,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'increase'
    },
    {
      title: 'Favorite Locations',
      value: stats.favoriteLocations,
      icon: FiHeart,
      color: 'bg-pink-500',
      change: '+1',
      changeType: 'increase'
    },
    {
      title: 'Weather Snapshots',
      value: stats.totalWeatherSnapshots,
      icon: FiDatabase,
      color: 'bg-green-500',
      change: '+124',
      changeType: 'increase'
    },
    {
      title: 'API Calls Today',
      value: stats.apiCallsToday,
      icon: FiActivity,
      color: 'bg-purple-500',
      change: '+45',
      changeType: 'increase'
    }
  ];

  const recentActivity = [
    { type: 'location_added', message: 'New location "Tokyo, JP" added', time: '2 minutes ago' },
    { type: 'weather_refreshed', message: 'Weather data refreshed for 8 locations', time: '15 minutes ago' },
    { type: 'forecast_updated', message: '5-day forecast updated for London', time: '1 hour ago' },
    { type: 'user_preferences', message: 'User preferences updated to metric units', time: '2 hours ago' },
    { type: 'location_deleted', message: 'Location "Berlin, DE" removed', time: '3 hours ago' }
  ];

  const systemMetrics = [
    { name: 'API Response Time', value: '245ms', status: 'good', threshold: '500ms' },
    { name: 'Database Connections', value: '3/10', status: 'good', threshold: '8/10' },
    { name: 'Cache Hit Rate', value: '87%', status: 'good', threshold: '80%' },
    { name: 'Memory Usage', value: '512MB', status: 'warning', threshold: '1GB' },
    { name: 'Disk Space', value: '2.3GB', status: 'good', threshold: '5GB' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'location_added': return FiMapPin;
      case 'weather_refreshed': return FiRefreshCw;
      case 'forecast_updated': return FiCloud;
      case 'user_preferences': return FiUsers;
      case 'location_deleted': return FiTrash2;
      default: return FiActivity;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">System status and performance metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.change} today</span>
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
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium">System Status</span>
              </div>
              <span className="text-green-600 font-medium">{stats.systemHealth}</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Last sync: {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}</p>
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
                  <p className="text-xs text-gray-500">Threshold: {metric.threshold}</p>
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
        <div className="space-y-3">
          {recentActivity.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <FiRefreshCw className="mr-2" /> Refresh All Weather
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">
            <FiDatabase className="mr-2" /> Clear Cache
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            <FiActivity className="mr-2" /> View Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
