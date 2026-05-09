import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getBooking: () => Promise.resolve({ data: { data: { id: 'b1', reference: 'REF123', status: 'confirmed', checkIn: '2026-07-01', checkOut: '2026-07-04', guests: 2, pricePerNight: 1000, cleaningFee: 200, serviceFee: 100, subtotal: 3000, totalAmount: 3300, isPaid: true, userId: 'u1', accommodation: { name: 'Test Place', city: 'Cape Town', province: 'Western Cape' }, payment: { currency: 'zar' }, specialRequests: 'Extra towels' } } }),
    cancelBooking: () => Promise.resolve({}),
  },
  api: {
    getBooking: () => Promise.resolve({ data: { data: { id: 'b1', reference: 'REF123', status: 'confirmed', checkIn: '2026-07-01', checkOut: '2026-07-04', guests: 2, pricePerNight: 1000, cleaningFee: 200, serviceFee: 100, subtotal: 3000, totalAmount: 3300, isPaid: true, userId: 'u1', accommodation: { name: 'Test Place', city: 'Cape Town', province: 'Western Cape' }, payment: { currency: 'zar' }, specialRequests: 'Extra towels' } } }),
    cancelBooking: () => Promise.resolve({}),
  },
}));

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: { id: 'u1', firstName: 'John', lastName: 'Doe', role: 'tourist' }, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('BookingDetailPage', () => {
  const renderPage = () => {
    const { BookingDetailPage } = require('./BookingDetailPage');
    return render(
      <MemoryRouter initialEntries={['/bookings/b1']}>
        <Routes>
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render booking reference', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('REF123')).toBeInTheDocument());
  });

  it('should render accommodation name', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Place')).toBeInTheDocument());
  });

  it('should render special requests', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Extra towels')).toBeInTheDocument());
  });

  it('should show cancel button for active bookings', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Cancel Booking')).toBeInTheDocument());
  });
});
