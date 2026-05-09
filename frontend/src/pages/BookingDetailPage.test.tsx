import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const baseBooking = {
  id: 'b1', reference: 'REF123', status: 'confirmed', checkIn: '2026-07-01', checkOut: '2026-07-04',
  guests: 2, pricePerNight: 1000, cleaningFee: 200, serviceFee: 100, subtotal: 3000, totalAmount: 3300,
  isPaid: true, userId: 'u1', accommodation: { name: 'Test Place', city: 'Cape Town', province: 'Western Cape' },
  payment: { currency: 'zar', id: 'pay1', stripePaymentIntentId: 'pi_123', amount: 3300, amountRefunded: 0, status: 'succeeded' },
  specialRequests: 'Extra towels', createdAt: '2026-01-01',
};

let mockGetBookingFn = jest.fn().mockResolvedValue({ data: { data: baseBooking } });
let mockCancelBookingFn = jest.fn().mockResolvedValue({ data: { data: { ...baseBooking, status: 'cancelled' } } });

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getBooking: (...args: any[]) => mockGetBookingFn(...args),
    cancelBooking: (...args: any[]) => mockCancelBookingFn(...args),
  },
  api: {
    getBooking: (...args: any[]) => mockGetBookingFn(...args),
    cancelBooking: (...args: any[]) => mockCancelBookingFn(...args),
  },
}));

let mockAuthUser: any = { id: 'u1', firstName: 'John', lastName: 'Doe', role: 'tourist' };

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: mockAuthUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('BookingDetailPage', () => {
  beforeEach(() => {
    mockGetBookingFn = jest.fn().mockResolvedValue({ data: { data: baseBooking } });
    mockCancelBookingFn = jest.fn().mockResolvedValue({ data: { data: { ...baseBooking, status: 'cancelled' } } });
    mockAuthUser = { id: 'u1', firstName: 'John', lastName: 'Doe', role: 'tourist' };
    window.confirm = jest.fn().mockReturnValue(true);
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = (bookingId = 'b1') => {
    const { BookingDetailPage } = require('./BookingDetailPage');
    return render(
      <MemoryRouter initialEntries={[`/bookings/${bookingId}`]}>
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

  it('should show cancel button for active booking owned by user', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Cancel Booking')).toBeInTheDocument());
  });

  it('should show booking status badge', async () => {
    renderPage();
    await waitFor(() => expect(screen.getAllByText('confirmed').length).toBeGreaterThanOrEqual(1));
  });

  it('should show Paid badge when isPaid is true', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Paid')).toBeInTheDocument());
    expect(screen.getByText('ZAR')).toBeInTheDocument();
  });

  it('should show Unpaid badge when isPaid is false', async () => {
    mockGetBookingFn = jest.fn().mockResolvedValue({ data: { data: { ...baseBooking, isPaid: false } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Unpaid')).toBeInTheDocument());
  });

  it('should show price breakdown', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cleaning fee')).toBeInTheDocument();
      expect(screen.getByText('Service fee')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  it('should cancel booking when user confirms', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    renderPage();
    await waitFor(() => expect(screen.getByText('Cancel Booking')).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText('Cancel Booking')); });
    await waitFor(() => expect(mockCancelBookingFn).toHaveBeenCalledWith('b1'));
  });

  it('should not cancel booking when user declines confirm', async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    renderPage();
    await waitFor(() => expect(screen.getByText('Cancel Booking')).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText('Cancel Booking')); });
    expect(mockCancelBookingFn).not.toHaveBeenCalled();
  });

  it('should show alert on cancellation error with response message', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    mockCancelBookingFn = jest.fn().mockRejectedValue({ response: { data: { error: 'Cannot cancel' } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Cancel Booking')).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText('Cancel Booking')); });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Cannot cancel'));
  });

  it('should show fallback alert message on cancellation error without response', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    mockCancelBookingFn = jest.fn().mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Cancel Booking')).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText('Cancel Booking')); });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Cancellation failed'));
  });

  it('should not show cancel button for cancelled booking', async () => {
    mockGetBookingFn = jest.fn().mockResolvedValue({ data: { data: { ...baseBooking, status: 'cancelled' } } });
    renderPage();
    await waitFor(() => expect(screen.getAllByText('cancelled').length).toBeGreaterThanOrEqual(1));
    expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument();
  });

  it('should not show cancel button for completed booking', async () => {
    mockGetBookingFn = jest.fn().mockResolvedValue({ data: { data: { ...baseBooking, status: 'completed' } } });
    renderPage();
    await waitFor(() => expect(screen.getAllByText('completed').length).toBeGreaterThanOrEqual(1));
    expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument();
  });

  it('should not show cancel button for another users booking', async () => {
    mockAuthUser = { id: 'other-user', firstName: 'Other', lastName: 'User', role: 'tourist' };
    renderPage();
    await waitFor(() => expect(screen.getByText('REF123')).toBeInTheDocument());
    expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument();
  });

  it('should render Back button and navigate back', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('← Back')).toBeInTheDocument());
    fireEvent.click(screen.getByText('← Back'));
  });

  it('should not show special requests section when absent', async () => {
    mockGetBookingFn = jest.fn().mockResolvedValue({ data: { data: { ...baseBooking, specialRequests: undefined } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('REF123')).toBeInTheDocument());
    expect(screen.queryByText('Special Requests')).not.toBeInTheDocument();
  });

  it('should not show payment section when payment is absent', async () => {
    mockGetBookingFn = jest.fn().mockResolvedValue({ data: { data: { ...baseBooking, payment: undefined } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('REF123')).toBeInTheDocument());
    expect(screen.queryByText('Paid')).not.toBeInTheDocument();
    expect(screen.queryByText('Unpaid')).not.toBeInTheDocument();
  });

  it('should show pending booking cancel button', async () => {
    mockGetBookingFn = jest.fn().mockResolvedValue({ data: { data: { ...baseBooking, status: 'pending' } } });
    renderPage();
    await waitFor(() => expect(screen.getAllByText('pending').length).toBeGreaterThanOrEqual(1));
    expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
  });
});
