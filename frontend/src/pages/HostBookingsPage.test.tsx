import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockBookingData = [
  {
    id: 'b1', reference: 'SA001', status: 'confirmed', checkIn: '2026-07-01', checkOut: '2026-07-04',
    guests: 2, totalAmount: 9000,
    user: { firstName: 'Alice', lastName: 'Doe', email: 'alice@test.com' },
    accommodation: { name: 'Sunset Villa' },
  },
  {
    id: 'b2', reference: 'SA002', status: 'pending', checkIn: '2026-08-01', checkOut: '2026-08-03',
    guests: 3, totalAmount: 6000,
    user: { firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' },
    accommodation: { name: 'Mountain Lodge' },
  },
];

let mockGetHostBookings = jest.fn();

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getHostBookings: (...args: any[]) => mockGetHostBookings(...args),
  },
}));

describe('HostBookingsPage', () => {
  beforeEach(() => {
    mockGetHostBookings = jest.fn().mockResolvedValue({ data: { data: mockBookingData, meta: { total: 2 } } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => {
    const { HostBookingsPage } = require('./HostBookingsPage');
    return render(<MemoryRouter><HostBookingsPage /></MemoryRouter>);
  };

  it('should show loading spinner initially', () => {
    mockGetHostBookings = jest.fn(() => new Promise(() => {}));
    renderPage();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render page title after load', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Booking Requests')).toBeInTheDocument());
  });

  it('should render bookings table with references', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('SA001')).toBeInTheDocument());
    expect(screen.getByText('SA002')).toBeInTheDocument();
  });

  it('should display guest names', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Alice Doe')).toBeInTheDocument());
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('should display accommodation names', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Sunset Villa')).toBeInTheDocument());
    expect(screen.getByText('Mountain Lodge')).toBeInTheDocument();
  });

  it('should display status badges', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('confirmed')).toBeInTheDocument());
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('should display stat summary cards', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Booking Requests')).toBeInTheDocument());
    expect(screen.getAllByText('pending').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('confirmed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('completed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('cancelled').length).toBeGreaterThanOrEqual(1);
  });

  it('should show empty state when no bookings', async () => {
    mockGetHostBookings = jest.fn().mockResolvedValue({ data: { data: [], meta: { total: 0 } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('No bookings yet for your properties')).toBeInTheDocument());
    expect(screen.getByText('View My Listings')).toBeInTheDocument();
  });

  it('should not show pagination when total fits on one page', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('SA001')).toBeInTheDocument());
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('should show pagination when total exceeds page size', async () => {
    mockGetHostBookings = jest.fn().mockResolvedValue({ data: { data: mockBookingData, meta: { total: 25 } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Previous')).toBeInTheDocument());
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should call API again when Next page is clicked', async () => {
    mockGetHostBookings = jest.fn().mockResolvedValue({ data: { data: mockBookingData, meta: { total: 25 } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(mockGetHostBookings).toHaveBeenCalledTimes(2));
  });

  it('should display total amount', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('R 9,000')).toBeInTheDocument());
  });

  it('should handle API error gracefully', async () => {
    mockGetHostBookings = jest.fn().mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Booking Requests')).toBeInTheDocument());
  });

  it('should display guest emails', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('alice@test.com')).toBeInTheDocument());
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('should show guest count in table', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
