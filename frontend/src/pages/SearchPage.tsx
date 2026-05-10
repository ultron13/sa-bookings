import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaHeart as FaHeartIcon, FaRegHeart as FaRegHeartIcon } from 'react-icons/fa';
const FaHeart = FaHeartIcon as React.ElementType;
const FaRegHeart = FaRegHeartIcon as React.ElementType;
import api from '../services/api';
import { Accommodation, PaginationMeta } from '../types';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];
const TYPES = ['hotel', 'lodge', 'guesthouse', 'bed_and_breakfast', 'apartment', 'villa', 'cottage', 'game_lodge'];
const SORT_OPTIONS = [
  { value: 'pricePerNight_ASC', label: 'Price: Low to High' },
  { value: 'pricePerNight_DESC', label: 'Price: High to Low' },
  { value: 'averageRating_DESC', label: 'Highest Rated' },
  { value: 'createdAt_DESC', label: 'Newest First' },
];

function getReviewLabel(rating: number, reviewCount: number): { label: string; color: string } | null {
  if (!rating || reviewCount === 0) return null;
  if (rating >= 9) return { label: 'Exceptional', color: 'bg-emerald-600' };
  if (rating >= 8) return { label: 'Fabulous', color: 'bg-green-600' };
  if (rating >= 7) return { label: 'Very Good', color: 'bg-teal-600' };
  if (rating >= 6) return { label: 'Good', color: 'bg-blue-600' };
  return { label: 'Pleasant', color: 'bg-sky-600' };
}

function loadWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem('sa_wishlist') || '[]'); } catch { return []; }
}

function saveWishlist(ids: string[]) {
  localStorage.setItem('sa_wishlist', JSON.stringify(ids));
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);

  const province = searchParams.get('province') || '';
  const type = searchParams.get('type') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const guests = searchParams.get('guests') || '';
  const sort = searchParams.get('sort') || 'createdAt_DESC';
  const page = parseInt(searchParams.get('page') || '1');
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setLoading(true);
    const [sortBy, sortOrder] = sort.split('_');
    api.searchAccommodations({
      province: province || undefined,
      type: type || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      guests: guests || undefined,
      sortBy,
      sortOrder,
      page,
      pageSize: 20,
      query: query || undefined,
    } as any)
      .then(({ data }: any) => {
        setAccommodations(data.data);
        setMeta(data.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [province, type, minPrice, maxPrice, guests, sort, page, query]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id];
    setWishlist(updated);
    saveWishlist(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
              <select value={province} onChange={(e) => updateFilter('province', e.target.value)} className="input-field">
                <option value="">All Provinces</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select value={type} onChange={(e) => updateFilter('type', e.target.value)} className="input-field">
                <option value="">All Types</option>
                {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-checkin" className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
              <input id="filter-checkin" type="date" value={checkIn} onChange={(e) => updateFilter('checkIn', e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label htmlFor="filter-checkout" className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
              <input id="filter-checkout" type="date" value={checkOut} onChange={(e) => updateFilter('checkOut', e.target.value)} className="input-field" min={checkIn || new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (R)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} className="input-field" />
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
              <input type="number" min="1" value={guests} onChange={(e) => updateFilter('guests', e.target.value)} className="input-field" placeholder="Number of guests" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-field">
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <button onClick={() => setSearchParams({})} className="btn-secondary w-full text-sm">Clear Filters</button>
          </div>
        </aside>

        <div className="flex-1">
          <form
            onSubmit={(e) => { e.preventDefault(); updateFilter('q', searchInput); }}
            className="flex gap-2 mb-6"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, description, city..."
              className="input-field flex-1"
              aria-label="Search accommodations"
            />
            <button type="submit" className="btn-primary px-5">Search</button>
          </form>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {query ? `Results for "${query}"` : province ? `${province} Accommodations` : 'All Accommodations'}
            </h1>
            {meta && <p className="text-sm text-gray-500">{meta.totalCount} properties found</p>}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Loading accommodations...</p>
            </div>
          ) : accommodations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-2">No accommodations found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search in a different province.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {accommodations.map((acc: Accommodation) => {
                const reviewInfo = getReviewLabel(Number(acc.averageRating), acc.reviewCount);
                const isWishlisted = wishlist.includes(acc.id);
                return (
                  <Link key={acc.id} to={`/accommodations/${acc.id}`} className="card group">
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-300 to-gray-400 relative flex items-center justify-center text-5xl text-gray-500">
                      🏠
                      <div className="absolute top-3 left-3">
                        <span className="badge bg-sa-green text-white">{(acc.type || '').replace('_', ' ')}</span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className="badge bg-white text-gray-900 shadow">★ {Number(acc.averageRating).toFixed(1)}</span>
                        <button
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          onClick={(e) => toggleWishlist(e, acc.id)}
                          className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          {isWishlisted
                            ? <FaHeart className="text-red-500 text-sm" />
                            : <FaRegHeart className="text-gray-400 text-sm" />}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{acc.city}, {acc.province}</p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-sa-green transition-colors truncate">{acc.name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span>{acc.bedrooms} bed{acc.bedrooms > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{acc.bathrooms} bath{acc.bathrooms > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>Up to {acc.maxGuests} guests</span>
                      </div>
                      {reviewInfo && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${reviewInfo.color}`}>
                            {reviewInfo.label}
                          </span>
                          <span className="text-xs text-gray-400">{acc.reviewCount} review{acc.reviewCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        {(acc.amenities || []).slice(0, 4).map((a: string) => (
                          <span key={a} className="badge bg-gray-100 text-gray-600 text-[10px]">{a.replace(/_/g, ' ')}</span>
                        ))}
                        {(acc.amenities || []).length > 4 && <span className="text-xs text-gray-400">+{(acc.amenities || []).length - 4}</span>}
                      </div>
                      <p className="mt-3 font-bold text-gray-900">R {Number(acc.pricePerNight).toLocaleString()} <span className="font-normal text-sm text-gray-500">/ night</span></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button disabled={!meta.hasPreviousPage} onClick={() => updateFilter('page', String(page - 1))}
                className="btn-secondary text-sm !py-2 disabled:opacity-50">Previous</button>
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (meta.totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= meta.totalPages - 2) pageNum = meta.totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <button key={pageNum} onClick={() => updateFilter('page', String(pageNum))}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${pageNum === page ? 'bg-sa-green text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button disabled={!meta.hasNextPage} onClick={() => updateFilter('page', String(page + 1))}
                className="btn-secondary text-sm !py-2 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
