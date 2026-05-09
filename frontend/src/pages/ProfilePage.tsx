import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.updateProfile(form);
      setMessage('Profile updated successfully');
    } catch { setMessage('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await api.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwError('Password changed successfully');
    } catch (err: any) { setPwError(err.response?.data?.error || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
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
              <input type="email" value={user?.email || ''} className="input-field bg-gray-50" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            {message && <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="input-field" required minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className="input-field" required />
            </div>
            {pwError && <p className={`text-sm ${pwError.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{pwError}</p>}
            <button type="submit" disabled={pwSaving} className="btn-primary">{pwSaving ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};
