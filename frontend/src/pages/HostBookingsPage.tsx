import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export const HostBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    api.getHostBookings(page)
      .then(({ data }) => {
        setBookings(data.data || []);
        setTotal(data.meta?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-500 mt-1">Bookings across all your properties</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {['pending','confirmed','completed','cancelled'].map((status) => (
          <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{bookings.filter((b) => b.status === status).length}</p>
            <p className="text-sm text-gray-500 mt-1 capitalize">{status}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No bookings yet for your properties</p>
          <Link to="/host/listings" className="btn-primary inline-block mt-4">View My Listings</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Guest</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Guests</th>
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
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{booking.user?.firstName} {booking.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{booking.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.accommodation?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.checkIn).toLocaleDateString('en-ZA')} → {new Date(booking.checkOut).toLocaleDateString('en-ZA')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.guests}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">R {Number(booking.totalAmount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>{booking.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">Showing {bookings.length} of {total} bookings</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Previous</button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
