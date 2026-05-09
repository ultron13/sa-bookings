import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Booking, UserRole } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyBookings()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}</h1>
        <p className="text-gray-500 mt-1">Manage your bookings and profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Bookings</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-3xl font-bold text-sa-green">{bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length}</p>
          <p className="text-sm text-gray-500 mt-1">Active Stays</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-3xl font-bold text-orange-500">{bookings.filter((b) => b.status === 'pending').length}</p>
          <p className="text-sm text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
            <Link to="/accommodations" className="btn-primary inline-block">Browse Accommodations</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <Link key={booking.id} to={`/bookings/${booking.id}`} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center text-2xl">🏠</div>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.accommodation?.name || 'Accommodation'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">Reference: {booking.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>{booking.status}</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">R {Number(booking.totalAmount).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {user?.role === UserRole.HOST && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Host Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/host/listings" className="p-4 border border-gray-200 rounded-lg hover:border-sa-green transition-colors">
              <p className="font-semibold text-gray-900">My Listings</p>
              <p className="text-sm text-gray-500">Manage your properties</p>
            </Link>
            <Link to="/host/bookings" className="p-4 border border-gray-200 rounded-lg hover:border-sa-green transition-colors">
              <p className="font-semibold text-gray-900">Booking Requests</p>
              <p className="text-sm text-gray-500">View incoming bookings</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
