import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const HostListingsPage: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.getMyListings()
      .then(({ data }) => setListings(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.deleteAccommodation(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert('Failed to delete listing.');
    } finally {
      setDeleting(null);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await api.updateAccommodation(id, { isAvailable: !current });
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, isAvailable: !current } : l));
    } catch {
      alert('Failed to update availability.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 mt-1">Manage your properties</p>
        </div>
        <Link to="/host/listings/new" className="btn-primary">+ New Listing</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Listings</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-3xl font-bold text-sa-green">{listings.filter((l) => l.isAvailable).length}</p>
          <p className="text-sm text-gray-500 mt-1">Available</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-3xl font-bold text-orange-500">{listings.filter((l) => !l.isAvailable).length}</p>
          <p className="text-sm text-gray-500 mt-1">Unavailable</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">No listings yet</p>
          <Link to="/host/listings/new" className="btn-primary inline-block mt-2">Create your first listing</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price/night</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center text-xl">🏠</div>
                      <div>
                        <p className="font-medium text-gray-900">{listing.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{(listing.type || '').replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{listing.city}, {listing.province}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">R {Number(listing.pricePerNight).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">★ {Number(listing.averageRating).toFixed(1)} ({listing.reviewCount})</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleAvailability(listing.id, listing.isAvailable)}
                      className={`badge cursor-pointer ${listing.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {listing.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/accommodations/${listing.id}`} className="text-sm text-sa-green hover:underline">View</Link>
                      <Link to={`/host/listings/${listing.id}/edit`} className="text-sm text-blue-600 hover:underline">Edit</Link>
                      <button onClick={() => handleDelete(listing.id, listing.name)} disabled={deleting === listing.id}
                        className="text-sm text-red-500 hover:underline disabled:opacity-50">
                        {deleting === listing.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
