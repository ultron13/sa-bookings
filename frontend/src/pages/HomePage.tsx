import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineFreeBreakfast, MdVerified, MdPublic, MdSupportAgent } from 'react-icons/md';
import api from '../services/api';
import { Accommodation } from '../types';

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

const propertyTypes = [
  { type: 'hotel', label: 'Hotels', icon: '🏨', color: 'from-blue-400 to-blue-600' },
  { type: 'apartment', label: 'Apartments', icon: '🏢', color: 'from-violet-400 to-violet-600' },
  { type: 'villa', label: 'Villas', icon: '🏡', color: 'from-pink-400 to-pink-600' },
  { type: 'game_lodge', label: 'Game Lodges', icon: '🦁', color: 'from-amber-400 to-amber-600' },
  { type: 'cottage', label: 'Cottages', icon: '🛖', color: 'from-lime-400 to-lime-600' },
  { type: 'guesthouse', label: 'Guesthouses', icon: '🏘️', color: 'from-teal-400 to-teal-600' },
];

const trustSignals = [
  { icon: MdOutlineFreeBreakfast, title: 'Free Cancellation', desc: 'Many stays offer free cancellation on select dates' },
  { icon: MdVerified, title: 'Verified Reviews', desc: 'All reviews come from real confirmed guests' },
  { icon: MdPublic, title: 'All 9 Provinces', desc: 'Thousands of properties across South Africa' },
  { icon: MdSupportAgent, title: '24/7 Support', desc: 'Our team is here for you any time, any day' },
];

function getReviewLabel(rating: number, reviewCount: number): { label: string; color: string } | null {
  if (!rating || reviewCount === 0) return null;
  if (rating >= 9) return { label: 'Exceptional', color: 'bg-emerald-600' };
  if (rating >= 8) return { label: 'Fabulous', color: 'bg-green-600' };
  if (rating >= 7) return { label: 'Very Good', color: 'bg-teal-600' };
  if (rating >= 6) return { label: 'Good', color: 'bg-blue-600' };
  return { label: 'Pleasant', color: 'bg-sky-600' };
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Accommodation[]>([]);
  const [popular, setPopular] = useState<Accommodation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    api.getFeatured().then(({ data }: any) => setFeatured(data.data)).catch(() => {});
    api.getPopularAccommodations(8).then(({ data }: any) => setPopular(data.data)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedProvince) params.set('province', selectedProvince);
    if (searchTerm) params.set('q', searchTerm);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    navigate(`/accommodations?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sa-green via-green-700 to-green-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Discover South Africa<br />
              <span className="text-sa-gold">One Province at a Time</span>
            </h1>
            <p className="text-lg md:text-xl text-green-50 mb-10 max-w-2xl">
              From the vineyards of Stellenbosch to the savannahs of Kruger — find your perfect stay across all 9 provinces.
            </p>
            <form onSubmit={handleSearch} className="bg-white rounded-xl p-3 shadow-2xl flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" placeholder="Search by destination, property name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sa-green" />
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="px-4 py-3 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sa-green bg-white">
                  <option value="">All Provinces</option>
                  {provinces.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label htmlFor="hero-checkin" className="block text-xs text-gray-500 mb-1 ml-1">Check-in</label>
                  <input id="hero-checkin" type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sa-green" />
                </div>
                <div className="flex-1">
                  <label htmlFor="hero-checkout" className="block text-xs text-gray-500 mb-1 ml-1">Check-out</label>
                  <input id="hero-checkout" type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sa-green" />
                </div>
                <button type="submit" className="btn-primary px-10 py-3 !rounded-lg whitespace-nowrap">Search</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustSignals.map(({ icon: IconComp, title, desc }) => {
              const Icon = IconComp as React.ElementType;
              return (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-sa-green/10 flex items-center justify-center shrink-0">
                    <Icon className="text-sa-green text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore by Province */}
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

      {/* Featured Accommodations */}
      {featured.length > 0 && (
        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Featured Accommodations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((acc) => {
                const reviewInfo = getReviewLabel(Number(acc.averageRating), acc.reviewCount);
                return (
                  <Link key={acc.id} to={`/accommodations/${acc.id}`} className="card group">
                    <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-500 text-4xl">
                        🏠
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="badge bg-sa-green text-white">{(acc.type || '').replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{acc.city}, {acc.province}</p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-sa-green transition-colors truncate">{acc.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{Number(acc.averageRating).toFixed(1)}</span>
                        {reviewInfo && (
                          <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${reviewInfo.color}`}>
                            {reviewInfo.label}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">({acc.reviewCount} reviews)</span>
                      </div>
                      <p className="mt-2 font-bold text-gray-900">R {Number(acc.pricePerNight).toLocaleString()} <span className="font-normal text-sm text-gray-500">/ night</span></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Popular Stays */}
      {popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popular Stays</h2>
              <p className="text-gray-500 mt-1">Top-rated properties loved by travellers</p>
            </div>
            <Link to="/accommodations?sortBy=reviewCount&sortOrder=DESC" className="text-sm text-sa-green font-medium hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map((acc) => {
              const reviewInfo = getReviewLabel(Number(acc.averageRating), acc.reviewCount);
              return (
                <Link key={acc.id} to={`/accommodations/${acc.id}`} className="card group">
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-5xl">
                      {acc.type === 'game_lodge' ? '🦁' : acc.type === 'villa' ? '🏡' : acc.type === 'cottage' ? '🛖' : '🏨'}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="badge bg-sa-gold text-white">{(acc.type || '').replace('_', ' ')}</span>
                    </div>
                    {acc.reviewCount > 0 && (
                      <div className="absolute top-3 right-3 bg-white rounded-md px-2 py-0.5 text-xs font-bold text-gray-900 shadow">
                        ★ {Number(acc.averageRating).toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{acc.city}, {acc.province}</p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-sa-green transition-colors truncate">{acc.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {reviewInfo && (
                        <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${reviewInfo.color}`}>
                          {reviewInfo.label}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{acc.reviewCount} reviews</span>
                    </div>
                    <p className="mt-2 font-bold text-gray-900">R {Number(acc.pricePerNight).toLocaleString()} <span className="font-normal text-sm text-gray-500">/ night</span></p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Browse by Property Type */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Browse by Property Type</h2>
        <p className="text-gray-500 mb-8">Find the perfect style of stay for your trip</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {propertyTypes.map(({ type, label, icon, color }) => (
            <Link key={type} to={`/accommodations?type=${type}`}
              className={`rounded-xl bg-gradient-to-br ${color} p-5 flex flex-col items-center justify-center text-white hover:opacity-90 transition-opacity cursor-pointer min-h-[100px] gap-2`}>
              <span className="text-3xl">{icon}</span>
              <span className="font-semibold text-sm text-center">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Become a Host */}
      <section className="bg-sa-green/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Become a Host</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">List your property and earn income by welcoming travelers from around the world to experience South Africa.</p>
          <Link to="/register?role=host" className="btn-primary text-lg px-10 py-3">Start Hosting</Link>
        </div>
      </section>
    </div>
  );
};
