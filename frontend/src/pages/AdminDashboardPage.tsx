import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getAdminDashboard(),
      api.getAdminUsers(),
      api.getAdminBookings(),
    ])
      .then(([dashRes, usersRes, bookingsRes]) => {
        setStats(dashRes.data.data);
        setUsers(usersRes.data.data || []);
        setBookings(bookingsRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleUser = async (userId: string) => {
    setTogglingUser(userId);
    try {
      await api.toggleUserStatus(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch {
      alert('Failed to update user status.');
    } finally {
      setTogglingUser(null);
    }
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
        {(['overview','users','bookings','analytics'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: stats.totalBookings, color: 'text-gray-900' },
              { label: 'Total Revenue', value: `R ${Number(stats.totalRevenue || 0).toLocaleString()}`, color: 'text-sa-green' },
              { label: 'Active Listings', value: stats.activeListings, color: 'text-blue-600' },
              { label: 'Avg Rating', value: Number(stats.averageRating || 0).toFixed(1) + ' ★', color: 'text-yellow-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Bookings by Status</h2>
              <div className="space-y-3">
                {(stats.bookingsByStatus || []).map((s: any) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className={`badge capitalize ${statusColors[s.status] || 'bg-gray-100 text-gray-800'}`}>{s.status}</span>
                    <span className="font-semibold text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Top Provinces</h2>
              <div className="space-y-3">
                {(stats.topProvinces || []).map((p: any) => (
                  <div key={p.province} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{p.province}</span>
                    <span className="font-semibold text-gray-900">{p.bookings} bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Monthly Revenue ({new Date().getFullYear()})</h2>
            {(stats.revenueByMonth || []).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No revenue data yet</p>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {(stats.revenueByMonth || []).map((m: any) => {
                  const maxRev = Math.max(...(stats.revenueByMonth || []).map((x: any) => Number(x.revenue || 0)), 1);
                  const pct = (Number(m.revenue || 0) / maxRev) * 100;
                  const monthLabel = m.month ? m.month.slice(5) : '';
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        R {Number(m.revenue || 0).toLocaleString()}
                      </span>
                      <div className="w-full bg-gray-100 rounded-t-sm relative" style={{ height: '160px' }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-sa-green rounded-t-sm transition-all duration-500"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{monthLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Conversion Rate</h3>
              <p className="text-3xl font-bold text-sa-green">
                {stats.totalBookings > 0 ? ((stats.bookingsByStatus?.find((s: any) => s.status === 'confirmed')?.count || 0) / stats.totalBookings * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">confirmed / total bookings</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Avg Booking Value</h3>
              <p className="text-3xl font-bold text-blue-600">
                R {stats.totalBookings > 0 ? (stats.totalRevenue / stats.totalBookings).toFixed(0) : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">revenue per booking</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Occupancy Rate</h3>
              <p className="text-3xl font-bold text-amber-600">{stats.occupancyRate}%</p>
              <p className="text-xs text-gray-500 mt-1">estimated occupancy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue by Province</h3>
              <div className="space-y-3">
                {(stats.topProvinces || []).map((p: any, i: number) => {
                  const max = Math.max(...(stats.topProvinces || []).map((x: any) => Number(x.bookings || 0)), 1);
                  const pct = (Number(p.bookings || 0) / max) * 100;
                  return (
                    <div key={p.province} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{p.province}</span>
                        <span className="font-medium text-gray-900">{p.bookings} bookings</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-sa-green" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
              <div className="space-y-3">
                {(stats.bookingsByStatus || []).map((s: any) => {
                  const total = stats.totalBookings || 1;
                  const pct = (Number(s.count || 0) / total) * 100;
                  const colors: Record<string, string> = {
                    confirmed: 'bg-blue-500',
                    completed: 'bg-green-500',
                    pending: 'bg-yellow-500',
                    cancelled: 'bg-red-400',
                  };
                  return (
                    <div key={s.status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-gray-700">{s.status}</span>
                        <span className="font-medium text-gray-900">{pct.toFixed(1)}% ({s.count})</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${colors[s.status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'host' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString('en-ZA')}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.isActive ? 'Active' : 'Suspended'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggleUser(user.id)} disabled={togglingUser === user.id}
                      className={`text-sm hover:underline disabled:opacity-50 ${user.isActive ? 'text-red-500' : 'text-green-600'}`}>
                      {togglingUser === user.id ? '...' : user.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Guest</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/bookings/${booking.id}`} className="text-sm font-mono text-sa-green hover:underline">{booking.reference}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{booking.user?.firstName} {booking.user?.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.accommodation?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.checkIn).toLocaleDateString('en-ZA')} → {new Date(booking.checkOut).toLocaleDateString('en-ZA')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">R {Number(booking.totalAmount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>{booking.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <p className="text-center text-gray-500 py-12">No bookings found</p>
          )}
        </div>
      )}
    </div>
  );
};
