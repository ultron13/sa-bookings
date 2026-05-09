import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '',
    role: searchParams.get('role') || UserRole.TOURIST,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: form.role,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2">Start exploring South Africa</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+27 XX XXX XXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I want to...</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm({ ...form, role: UserRole.TOURIST })}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${form.role === UserRole.TOURIST ? 'border-sa-green bg-green-50 text-sa-green' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                🏖️ Book Stays
              </button>
              <button type="button" onClick={() => setForm({ ...form, role: UserRole.HOST })}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${form.role === UserRole.HOST ? 'border-sa-green bg-green-50 text-sa-green' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                🏠 List Properties
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading ? 'Creating account...' : 'Create Account'}</button>
          <p className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-sa-green font-medium hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};
