import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Booking } from '../types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getBooking(id)
      .then(({ data }) => setBooking(data.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      const { data } = await api.cancelBooking(id!);
      setBooking(data.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>;
  if (!booking) return <div className="text-center py-20 text-gray-500">Booking not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-sa-green to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Booking Reference</p>
              <h1 className="text-2xl font-bold">{booking.reference}</h1>
            </div>
            <span className={`badge text-base !px-4 !py-1.5 ${statusColors[booking.status] || 'bg-white text-gray-800'}`}>{booking.status}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Check-in</p>
              <p className="font-semibold text-gray-900">{new Date(booking.checkIn).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-out</p>
              <p className="font-semibold text-gray-900">{new Date(booking.checkOut).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Accommodation</h3>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center text-2xl">🏠</div>
              <div>
                <p className="font-medium text-gray-900">{booking.accommodation?.name}</p>
                <p className="text-sm text-gray-500">{booking.accommodation?.city}, {booking.accommodation?.province}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">R {Number(booking.pricePerNight).toLocaleString()} x {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights</span><span>R {Number(booking.subtotal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Cleaning fee</span><span>R {Number(booking.cleaningFee).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Service fee</span><span>R {Number(booking.serviceFee).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>R {Number(booking.totalAmount).toLocaleString()}</span></div>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-1">Special Requests</p>
              <p className="text-gray-900">{booking.specialRequests}</p>
            </div>
          )}

          {booking.payment && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
              <div className="flex items-center gap-2">
                <span className={`badge ${booking.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {booking.isPaid ? 'Paid' : 'Unpaid'}
                </span>
                <span className="text-sm text-gray-500">{booking.payment.currency.toUpperCase()}</span>
              </div>
            </div>
          )}

          {['pending', 'confirmed'].includes(booking.status) && booking.userId === user?.id && (
            <div className="border-t pt-4">
              <button onClick={handleCancel} disabled={cancelling} className="btn-danger">
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
              <p className="text-xs text-gray-500 mt-2">Cancellation policy applies</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
