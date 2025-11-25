'use client';
import { useQuery, gql } from '@apollo/client';

const SUPER_ADMIN_STATS = gql`
  query SuperAdminStats {
    stats {
      totalUsers
      totalProjects
      totalInvestments
      totalVolume
      pendingApprovals
      activeUsers
    }
  }
`;

export default function SuperAdminDashboard() {
  const { data, loading } = useQuery(SUPER_ADMIN_STATS);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-3xl font-bold">{data?.stats.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Projects</h3>
          <p className="text-3xl font-bold">{data?.stats.totalProjects || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Approvals</h3>
          <p className="text-3xl font-bold text-orange-500">{data?.stats.pendingApprovals || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border rounded hover:bg-gray-50">Approve Projects</button>
          <button className="p-4 border rounded hover:bg-gray-50">Manage Users</button>
          <button className="p-4 border rounded hover:bg-gray-50">View Reports</button>
          <button className="p-4 border rounded hover:bg-gray-50">System Settings</button>
        </div>
      </div>
    </div>
  );
}
