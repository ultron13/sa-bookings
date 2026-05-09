import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const TYPES = ['hotel','lodge','guesthouse','bed_and_breakfast','apartment','villa','cottage','backpacker','camping','game_lodge'];
const PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'];
const AMENITIES = ['wifi','pool','parking','air_conditioning','breakfast','restaurant','bar','gym','spa','pet_friendly','airport_shuttle','laundry','room_service','sea_view','mountain_view','fireplace','kitchen','tv','safari','wine_tasting'];

const empty = {
  name: '', description: '', type: 'lodge', province: 'Western Cape', city: '', address: '',
  latitude: '', longitude: '', pricePerNight: '', cleaningFee: '', serviceFee: '',
  maxGuests: '4', bedrooms: '2', beds: '2', bathrooms: '1', amenities: [] as string[],
  checkInTime: '14:00', checkOutTime: '11:00', isAvailable: true,
};

export const ListingFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getAccommodation(id)
      .then(({ data }) => {
        const a = data.data;
        setForm({
          name: a.name || '', description: a.description || '', type: a.type || 'lodge',
          province: a.province || 'Western Cape', city: a.city || '', address: a.address || '',
          latitude: a.latitude || '', longitude: a.longitude || '',
          pricePerNight: a.pricePerNight || '', cleaningFee: a.cleaningFee || '',
          serviceFee: a.serviceFee || '', maxGuests: String(a.maxGuests || 4),
          bedrooms: String(a.bedrooms || 2), beds: String(a.beds || 2),
          bathrooms: String(a.bathrooms || 1), amenities: a.amenities || [],
          checkInTime: a.checkInTime || '14:00', checkOutTime: a.checkOutTime || '11:00',
          isAvailable: a.isAvailable ?? true,
        });
      })
      .catch(() => navigate('/host/listings'))
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const toggleAmenity = (amenity: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      cleaningFee: Number(form.cleaningFee),
      serviceFee: Number(form.serviceFee),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      beds: Number(form.beds),
      bathrooms: Number(form.bathrooms),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };
    try {
      if (isEdit) {
        await api.updateAccommodation(id!, payload);
      } else {
        await api.createAccommodation(payload);
      }
      navigate('/host/listings');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/host/listings')} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">← Back to listings</button>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{isEdit ? 'Edit Listing' : 'Create New Listing'}</h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
            <input className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} required maxLength={200} placeholder="e.g. Ocean View Villa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea className="input-field" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} required placeholder="Describe your property..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select className="input-field" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
              <select className="input-field" value={form.province} onChange={(e) => set('province', e.target.value)}>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input className="input-field" value={form.city} onChange={(e) => set('city', e.target.value)} required placeholder="Cape Town" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input className="input-field" value={form.address} onChange={(e) => set('address', e.target.value)} required placeholder="123 Main Street" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
              <input className="input-field" type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} required placeholder="-33.9249" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
              <input className="input-field" type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} required placeholder="18.4241" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (R) *</label>
              <input className="input-field" type="number" min="0" step="0.01" value={form.pricePerNight} onChange={(e) => set('pricePerNight', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Fee (R)</label>
              <input className="input-field" type="number" min="0" step="0.01" value={form.cleaningFee} onChange={(e) => set('cleaningFee', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Fee (R)</label>
              <input className="input-field" type="number" min="0" step="0.01" value={form.serviceFee} onChange={(e) => set('serviceFee', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Capacity & Details</h2>
          <div className="grid grid-cols-4 gap-4">
            {[['maxGuests','Max Guests','1'],['bedrooms','Bedrooms','0'],['beds','Beds','1'],['bathrooms','Bathrooms','1']].map(([field, label, min]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                <input className="input-field" type="number" min={min} value={(form as any)[field]} onChange={(e) => set(field, e.target.value)} required />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
              <input className="input-field" type="time" value={form.checkInTime} onChange={(e) => set('checkInTime', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
              <input className="input-field" type="time" value={form.checkOutTime} onChange={(e) => set('checkOutTime', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isAvailable" checked={form.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} className="w-4 h-4 text-sa-green" />
            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available for booking</label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AMENITIES.map((amenity) => (
              <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${form.amenities.includes(amenity) ? 'bg-sa-green text-white border-sa-green' : 'bg-white text-gray-600 border-gray-200 hover:border-sa-green'}`}>
                {amenity.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1 !py-3">
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Listing'}
          </button>
          <button type="button" onClick={() => navigate('/host/listings')} className="btn-secondary flex-1 !py-3">Cancel</button>
        </div>
      </form>
    </div>
  );
};
