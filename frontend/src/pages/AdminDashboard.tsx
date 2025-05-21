import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLogs } from '../services/monitoringService';
import { getMonitoredUsers, formatTimestamp } from '../services/monitoringService';

const AdminDashboard: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [monitoredUsers, setMonitoredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState({ logs: true, monitoredUsers: true });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent logs
        const logsResponse = await getLogs(10, 0);
        setLogs(logsResponse.logs);
        
        // Fetch active monitored users
        const monitoredUsersData = await getMonitoredUsers(true);
        setMonitoredUsers(monitoredUsersData);
        
        setLoading({ logs: false, monitoredUsers: false });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading({ logs: false, monitoredUsers: false });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Monitored Users</h2>
            <Link 
              to="/admin/monitored-users"
              className="text-blue-500 hover:text-blue-700"
            >
              View All
            </Link>
          </div>
          
          {loading.monitoredUsers ? (
            <p className="text-gray-500">Loading monitored users...</p>
          ) : monitoredUsers.length === 0 ? (
            <p className="text-gray-500">No users are currently being monitored</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detected</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoredUsers.slice(0, 5).map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.user?.username}</td>
                      <td className="px-4 py-2">{user.reason}</td>
                      <td className="px-4 py-2">{formatTimestamp(user.detectedAt)}</td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/logs/${user.userId}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          View Logs
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity Logs</h2>
            <Link 
              to="/admin/logs/all"
              className="text-blue-500 hover:text-blue-700"
            >
              View All
            </Link>
          </div>
          
          {loading.logs ? (
            <p className="text-gray-500">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500">No logs found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-4 py-2">{log.user?.username}</td>
                      <td className="px-4 py-2">
                        <span className={`capitalize ${log.action === 'create' ? 'text-green-600' : log.action === 'delete' ? 'text-red-600' : 'text-blue-600'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2">{log.entityType}</td>
                      <td className="px-4 py-2">{formatTimestamp(log.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 