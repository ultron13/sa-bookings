import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { firstName: string; lastName: string };
  createdAt: string;
}

interface Conversation {
  id: string;
  guest: { id: string; firstName: string; lastName: string };
  host: { id: string; firstName: string; lastName: string };
  accommodation?: { id: string; name: string };
}

export const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    if (!id) return;
    api.getMessages(id)
      .then(({ data }: any) => setMessages(data.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getConversation(id), api.getMessages(id)])
      .then(([convRes, msgRes]) => {
        setConversation(convRes.data.data);
        setMessages(msgRes.data.data);
      })
      .catch(() => navigate('/messages'))
      .finally(() => setLoading(false));

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id) return;
    setSending(true);
    try {
      const { data } = await api.sendMessage(id, input.trim());
      setMessages((prev) => [...prev, data.data]);
      setInput('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParty = () => {
    if (!conversation || !user) return null;
    return conversation.guest.id === user.id ? conversation.host : conversation.guest;
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>;
  if (!conversation) return null;

  const other = getOtherParty();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
        <Link to="/messages" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="w-10 h-10 rounded-full bg-sa-green flex items-center justify-center text-white font-semibold text-sm">
          {other?.firstName[0]}{other?.lastName[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{other?.firstName} {other?.lastName}</p>
          {conversation.accommodation && (
            <Link to={`/accommodations/${conversation.accommodation.id}`} className="text-xs text-sa-green hover:underline">
              {conversation.accommodation.name}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-sa-green text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 border-t border-gray-200 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 input-field"
          disabled={sending}
        />
        <button type="submit" disabled={!input.trim() || sending} className="btn-primary !px-5 !py-2.5 disabled:opacity-50">
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
