import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import api from '../services/api';
import { Accommodation, Review, UserRole } from '../types';

const PropertyMap = lazy(() => import('../components/PropertyMap').then((m) => ({ default: m.PropertyMap })));

export const AccommodationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { format } = useCurrency();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({ checkIn: '', checkOut: '', guests: 1, specialRequests: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getAccommodation(id),
      api.getAccommodationReviews(id),
    ])
      .then(([accRes, revRes]) => {
        setAccommodation(accRes.data.data);
        setReviews(revRes.data.data);
      })
      .catch(() => navigate('/accommodations'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const calculateNights = useCallback(() => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return 0;
    const diff = new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [bookingForm.checkIn, bookingForm.checkOut]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!accommodation) return;
    setBookingLoading(true);
    try {
      const { data } = await api.createBooking({
        accommodationId: accommodation.id,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: bookingForm.guests,
        specialRequests: bookingForm.specialRequests,
      });
      navigate(`/bookings/${data.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleMessageHost = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!accommodation) return;
    setMessagingLoading(true);
    try {
      const hostId = accommodation.hostId || accommodation.host?.id;
      if (!hostId) { alert('Host information unavailable'); return; }
      const { data } = await api.getOrCreateConversation(hostId, accommodation.id);
      navigate(`/messages/${data.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not start conversation');
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accommodation) return;
    setSubmitReviewLoading(true);
    try {
      const { data } = await api.createReview({ accommodationId: accommodation.id, ...reviewForm });
      setReviews([data.data, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>;
  if (!accommodation) return <div className="text-center py-20 text-gray-500">Accommodation not found</div>;

  const nights = calculateNights();
  const subtotal = Number(accommodation.pricePerNight) * nights;
  const total = subtotal + Number(accommodation.cleaningFee) + Number(accommodation.serviceFee);
  const lat = parseFloat(String(accommodation.latitude));
  const lng = parseFloat(String(accommodation.longitude));
  const hasCoords = !isNaN(lat) && !isNaN(lng);
  const placeholders = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Photo grid */}
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-8">
            {placeholders.map((i) => (
              <div key={i} className={`aspect-[16/10] bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-6xl text-gray-500 ${i === 0 ? 'row-span-2' : ''}`}>
                🏠
              </div>
            ))}
          </div>

          {/* Title & meta */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge bg-sa-green text-white">{(accommodation.type || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                <span className="badge bg-blue-100 text-blue-700">{accommodation.province}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{accommodation.name}</h1>
              <p className="text-gray-500 mt-1">{accommodation.city}, {accommodation.address}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">★ {Number(accommodation.averageRating).toFixed(1)} ({accommodation.reviewCount} reviews)</span>
                <span>·</span>
                <span>{accommodation.bedrooms} bedroom{accommodation.bedrooms > 1 ? 's' : ''}</span>
                <span>·</span>
                <span>{accommodation.bathrooms} bathroom{accommodation.bathrooms > 1 ? 's' : ''}</span>
                <span>·</span>
                <span>Up to {accommodation.maxGuests} guests</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 text-right">
              {format(Number(accommodation.pricePerNight))}<br />
              <span className="text-sm font-normal text-gray-500">/ night</span>
            </p>
          </div>

          {/* Description */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About this place</h2>
            <p className="text-gray-600 leading-relaxed">{accommodation.description}</p>
          </div>

          {/* Amenities */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(accommodation.amenities || []).map((amenity: string) => (
                <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-sa-green rounded-full" />
                  {amenity.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </div>
              ))}
            </div>
          </div>

          {/* Availability Calendar */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
            <AvailabilityCalendar accommodationId={accommodation.id} />
          </div>

          {/* Map */}
          {hasCoords && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <Suspense fallback={<div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Loading map...</div>}>
                <PropertyMap lat={lat} lng={lng} name={accommodation.name} city={accommodation.city} />
              </Suspense>
              <p className="text-sm text-gray-500 mt-2">{accommodation.city}, {accommodation.province}</p>
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancellation Policy</h2>
            <p className="text-gray-600">{accommodation.cancellationPolicy?.description}</p>
          </div>

          {/* Reviews */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {review.user?.firstName?.[0] || 'U'}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{review.user?.firstName} {review.user?.lastName}</span>
                      </div>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    {review.responseFromHost && (
                      <div className="mt-2 pl-4 border-l-2 border-sa-green">
                        <p className="text-xs text-sa-green font-medium">Host response:</p>
                        <p className="text-sm text-gray-600">{review.responseFromHost}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isAuthenticated && user?.role === UserRole.TOURIST && (
              <form onSubmit={handleReviewSubmit} className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl transition-colors ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input-field mb-4" rows={3} placeholder="Share your experience..." required />
                <button type="submit" disabled={submitReviewLoading} className="btn-primary">{submitReviewLoading ? 'Submitting...' : 'Submit Review'}</button>
              </form>
            )}
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <p className="text-2xl font-bold text-gray-900 mb-1">{format(Number(accommodation.pricePerNight))} <span className="text-sm font-normal text-gray-500">/ night</span></p>
            <form onSubmit={handleBooking} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Check-in</label>
                  <input type="date" value={bookingForm.checkIn} onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                    className="input-field" required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Check-out</label>
                  <input type="date" value={bookingForm.checkOut} onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                    className="input-field" required min={bookingForm.checkIn || new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Guests</label>
                <input type="number" min="1" max={accommodation.maxGuests} value={bookingForm.guests}
                  onChange={(e) => setBookingForm({ ...bookingForm, guests: parseInt(e.target.value) || 1 })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea value={bookingForm.specialRequests} onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                  className="input-field" rows={2} placeholder="Optional..." />
              </div>

              {nights > 0 && (
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">{format(Number(accommodation.pricePerNight))} x {nights} nights</span><span>{format(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Cleaning fee</span><span>{format(Number(accommodation.cleaningFee))}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Service fee</span><span>{format(Number(accommodation.serviceFee))}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{format(total)}</span></div>
                </div>
              )}

              <button type="submit" disabled={!bookingForm.checkIn || !bookingForm.checkOut || bookingLoading || !accommodation.isAvailable}
                className="btn-primary w-full !py-3">
                {bookingLoading ? 'Processing...' : isAuthenticated ? 'Book Now' : 'Sign In to Book'}
              </button>
              {!accommodation.isAvailable && <p className="text-red-500 text-xs text-center">This accommodation is currently unavailable</p>}
            </form>

            {/* Message Host button */}
            {isAuthenticated && user?.role === UserRole.TOURIST && (
              <button
                onClick={handleMessageHost}
                disabled={messagingLoading}
                className="btn-secondary w-full mt-3 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {messagingLoading ? 'Opening...' : 'Message Host'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
