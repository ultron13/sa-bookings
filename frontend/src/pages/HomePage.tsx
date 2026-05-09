import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Accommodation, Province } from '../types';

const provinces = [
  { name: 'Western Cape', color: 'from-blue-500 to-blue-700', icon: '🌊' },
  { name: 'Gauteng', color: 'from-yellow-500 to-yellow-700', icon: '🏙️' },
  { name: 'KwaZulu-Natal', color: 'from-green-500 to-green-700', icon: '🏖️' },
  { name: 'Mpumalanga', color: 'from-emerald-500 to-emerald-700', icon: '🦁' },
  { name: 'Eastern Cape', color: 'from-indigo-500 to-indigo-700', icon: '🏄' },
  { name: 'Limpopo', color: 'from-orange-500 to-orange-700', icon: '🌿' },
  { name: 'North West', color: 'from-purple-500 to-purple-700', icon: '🎰' },
  { name: 'Free State', color: 'from-rose-500 to-rose-700', icon: '🌾' },
  { name: 'Northern Cape', color: 'from-amber-500 to-amber-700', icon: '🌵' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Accommodation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  useEffect(() => {
    api.getFeatured().then(({ data }: any) => setFeatured(data.data)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedProvince) params.set('province', selectedProvince);
    if (searchTerm) params.set('q', searchTerm);
    navigate(`/accommodations?${params.toString()}`);
  };

  return (
    <div>
      <section className="relative bg-gradient-to-br from-sa-green via-green-700 to-green-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Discover South Africa<br />
              <span className="text-sa-gold">One Province at a Time</span>
            </h1>
            <p className="text-lg md:text-xl text-green-50 mb-10 max-w-2xl">
              From the vineyards of Stellenbosch to the savannahs of Kruger — find your perfect stay across all 9 provinces.
            </p>
            <form onSubmit={handleSearch} className="bg-white rounded-xl p-3 shadow-2xl flex flex-col md:flex-row gap-3">
              <input type="text" placeholder="Search by destination, property name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sa-green" />
              <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="px-4 py-3 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sa-green bg-white">
                <option value="">All Provinces</option>
                {provinces.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
              <button type="submit" className="btn-primary px-8 py-3 !rounded-lg whitespace-nowrap">Search</button>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Explore by Province</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {provinces.map((province) => (
            <Link key={province.name} to={`/accommodations?province=${encodeURIComponent(province.name)}`}
              className={`relative rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br ${province.color} p-6 min-h-[140px] flex flex-col justify-between`}>
              <span className="text-3xl">{province.icon}</span>
              <div>
                <h3 className="text-white font-bold text-lg">{province.name}</h3>
                <p className="text-white/80 text-sm">Explore stays →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Featured Accommodations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((acc) => (
                <Link key={acc.id} to={`/accommodations/${acc.id}`} className="card group">
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-500 text-4xl">
                      🏠
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="badge bg-sa-green text-white">{acc.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{acc.city}, {acc.province}</p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-sa-green transition-colors truncate">{acc.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{acc.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({acc.reviewCount} reviews)</span>
                    </div>
                    <p className="mt-2 font-bold text-gray-900">R {acc.pricePerNight.toLocaleString()} <span className="font-normal text-sm text-gray-500">/ night</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Become a Host</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">List your property and earn income by welcoming travelers from around the world to experience South Africa.</p>
        <Link to="/register?role=host" className="btn-primary text-lg px-10 py-3">Start Hosting</Link>
      </section>
    </div>
  );
};
