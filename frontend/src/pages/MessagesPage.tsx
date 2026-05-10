import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Conversation {
  id: string;
  guest: { id: string; firstName: string; lastName: string };
  host: { id: string; firstName: string; lastName: string };
  accommodation?: { id: string; name: string };
  lastMessage: string;
  updatedAt: string;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConversations()
      .then(({ data }: any) => setConversations(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getOtherParty = (conv: Conversation) => {
    if (!user) return { firstName: '?', lastName: '' };
    return conv.guest.id === user.id ? conv.host : conv.guest;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm mt-1">Message a host from an accommodation page</p>
          <Link to="/accommodations" className="btn-primary mt-4 inline-block">Browse Accommodations</Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
          {conversations.map((conv) => {
            const other = getOtherParty(conv);
            return (
              <Link key={conv.id} to={`/messages/${conv.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-11 h-11 rounded-full bg-sa-green flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {other.firstName[0]}{other.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold text-gray-900 text-sm">{other.firstName} {other.lastName}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{formatTime(conv.updatedAt)}</span>
                  </div>
                  {conv.accommodation && (
                    <p className="text-xs text-sa-green mb-0.5">{conv.accommodation.name}</p>
                  )}
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
