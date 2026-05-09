import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockAccommodation = { id: '1', name: 'Test Place', type: 'hotel', province: 'Western Cape', city: 'Cape Town', address: '123 Main', description: 'Nice place', pricePerNight: 1000, cleaningFee: 200, serviceFee: 100, bedrooms: 2, bathrooms: 1, maxGuests: 4, amenities: ['wifi', 'pool'], averageRating: 4.5, reviewCount: 10, isAvailable: true, images: [], cancellationPolicy: { type: 'flexible', description: 'Free cancellation', refundPercentage: 100 } };
const mockReviews = [{ id: 'r1', rating: 5, comment: 'Great!', user: { firstName: 'John', lastName: 'Doe' } }];

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getAccommodation: () => Promise.resolve({ data: { data: mockAccommodation } }),
    getAccommodationReviews: () => Promise.resolve({ data: { data: mockReviews } }),
    createBooking: () => Promise.resolve({}),
    createReview: () => Promise.resolve({}),
  },
  api: {
    getAccommodation: () => Promise.resolve({ data: { data: mockAccommodation } }),
    getAccommodationReviews: () => Promise.resolve({ data: { data: mockReviews } }),
    createBooking: () => Promise.resolve({}),
    createReview: () => Promise.resolve({}),
  },
}));

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('AccommodationDetailPage', () => {
  const renderPage = () => {
    const { AccommodationDetailPage } = require('./AccommodationDetailPage');
    return render(
      <MemoryRouter initialEntries={['/accommodations/1']}>
        <Routes>
          <Route path="/accommodations/:id" element={<AccommodationDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render accommodation details', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Place')).toBeInTheDocument());
  });

  it('should show reviews', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Great!')).toBeInTheDocument());
  });
});
