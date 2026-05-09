import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your SA Bookings account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading ? 'Signing in...' : 'Sign In'}</button>
          <p className="text-center text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-sa-green font-medium hover:underline">Sign up</Link></p>
        </form>
      </div>
    </div>
  );
};
