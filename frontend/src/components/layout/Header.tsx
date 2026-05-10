import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency, Currency } from '../../contexts/CurrencyContext';
import { UserRole } from '../../types';

const provinces = [
  'Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State',
  'KwaZulu-Natal', 'Gauteng', 'Mpumalanga', 'Limpopo', 'North West',
];

const currencies: { value: Currency; label: string }[] = [
  { value: 'ZAR', label: 'ZAR (R)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-sa-green">SA</span>
              <span className="text-lg font-semibold text-gray-700">Bookings</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/accommodations" className="text-sm font-medium text-gray-600 hover:text-sa-green transition-colors">
                Accommodations
              </Link>
              <div className="relative group">
                <button className="text-sm font-medium text-gray-600 hover:text-sa-green transition-colors flex items-center gap-1">
                  Provinces
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {provinces.map((p) => (
                    <Link key={p} to={`/accommodations?province=${encodeURIComponent(p)}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sa-green first:rounded-t-lg last:rounded-b-lg">
                      {p}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-sa-green"
              aria-label="Currency"
            >
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {isAuthenticated ? (
              <>
                <Link to="/messages" className="text-sm text-gray-600 hover:text-sa-green hidden md:flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Messages
                </Link>
                <div className="relative">
                  <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-sa-green transition-colors">
                    <div className="w-8 h-8 bg-sa-green rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="hidden md:inline">{user?.firstName}</span>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowDropdown(false)}>Dashboard</Link>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowDropdown(false)}>Profile</Link>
                      <Link to="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowDropdown(false)}>Messages</Link>
                      {user?.role === UserRole.HOST && (<>
                        <Link to="/host/listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowDropdown(false)}>My Listings</Link>
                        <Link to="/host/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowDropdown(false)}>Booking Requests</Link>
                      </>)}
                      {user?.role === UserRole.ADMIN && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowDropdown(false)}>Admin Dashboard</Link>
                      )}
                      <div className="border-t border-gray-100">
                        <button onClick={() => { setShowDropdown(false); logout(); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-sa-green">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
