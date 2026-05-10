import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const typeIcons: Record<string, string> = {
  booking_confirmed: '✅',
  booking_cancelled: '❌',
  booking_pending: '⏳',
  new_message: '💬',
  review_posted: '⭐',
  payment_received: '💰',
  listing_approved: '🏠',
};

export const NotificationsPage: React.FC = () => {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-sa-green hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">🔔</span>
          <p className="mt-4 text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100 hover:bg-blue-100/50'
              }`}
            >
              <span className="text-2xl shrink-0">{typeIcons[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-ZA')}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
