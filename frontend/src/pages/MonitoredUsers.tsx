import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  getMonitoredUsers, 
  resolveMonitoredUser, 
  formatTimestamp,
  MonitoredUser
} from '../services/monitoringService';

const MonitoredUsers: React.FC = () => {
  const [monitoredUsers, setMonitoredUsers] = useState<MonitoredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchMonitoredUsers();
    
    // Set up polling every 10 seconds
    pollingInterval.current = setInterval(() => {
      fetchMonitoredUsers(false); // Don't show loading state for automatic refreshes
    }, 10000);
    
    // Clean up interval on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const fetchMonitoredUsers = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const data = await getMonitoredUsers(false); // Always get all users
      setMonitoredUsers(data);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monitored users');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await resolveMonitoredUser(id);
      // Refresh the list
      fetchMonitoredUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve monitored user');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Monitored Users</h1>
        <div className="flex items-center">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading monitored users...</p>
        </div>
      ) : monitoredUsers.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500">No monitored users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detected At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monitoredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.user?.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.reason}</div>
                    <div className="text-sm text-gray-500">
                      {user.actionsCount} actions in {user.timeWindow} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(user.detectedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Resolved'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        to={`/admin/logs/${user.userId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Logs
                      </Link>
                      {user.isActive && (
                        <button
                          onClick={() => handleResolve(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonitoredUsers; 