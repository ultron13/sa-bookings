import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockBookings: any[] = [];
let mockUser: any = { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '2024-01-01' };

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { getMyBookings: () => Promise.resolve({ data: { data: mockBookings } }) },
  api: { getMyBookings: () => Promise.resolve({ data: { data: mockBookings } }) },
}));

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: mockUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    mockBookings = [];
    mockUser = { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '2024-01-01' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => {
    const { DashboardPage } = require('./DashboardPage');
    return render(<MemoryRouter><DashboardPage /></MemoryRouter>);
  };

  it('should render welcome message', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/Welcome,/)).toBeInTheDocument());
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });

  it('should render stat cards', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Total Bookings')).toBeInTheDocument());
    expect(screen.getByText('Active Stays')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should show empty state for no bookings', async () => {
    mockBookings = [];
    renderPage();
    await waitFor(() => expect(screen.getByText('No bookings yet')).toBeInTheDocument());
    expect(screen.getByText('Browse Accommodations')).toBeInTheDocument();
  });

  it('should render bookings list when bookings exist', async () => {
    mockBookings = [
      {
        id: 'b1', reference: 'SA123', status: 'confirmed', checkIn: '2026-07-01', checkOut: '2026-07-04',
        guests: 2, pricePerNight: 1000, cleaningFee: 200, serviceFee: 100, subtotal: 3000, totalAmount: 3300,
        isPaid: true, userId: '1', accommodation: { name: 'Test Place', city: 'Cape Town', province: 'Western Cape' },
        createdAt: '2026-01-01',
      },
      {
        id: 'b2', reference: 'SA456', status: 'pending', checkIn: '2026-08-01', checkOut: '2026-08-03',
        guests: 1, pricePerNight: 1500, cleaningFee: 200, serviceFee: 150, subtotal: 3000, totalAmount: 3350,
        isPaid: false, userId: '1', accommodation: { name: 'Another Place', city: 'Durban', province: 'KwaZulu-Natal' },
        createdAt: '2026-01-02',
      },
    ];
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Place')).toBeInTheDocument());
    expect(screen.getByText(/SA123/)).toBeInTheDocument();
    expect(screen.getByText('Another Place')).toBeInTheDocument();
    expect(screen.getByText(/SA456/)).toBeInTheDocument();
  });

  it('should show confirmed and completed bookings as active stays', async () => {
    mockBookings = [
      { id: 'b1', reference: 'SA1', status: 'confirmed', checkIn: '2026-07-01', checkOut: '2026-07-04', guests: 2, pricePerNight: 1000, cleaningFee: 100, serviceFee: 100, subtotal: 3000, totalAmount: 3200, isPaid: true, userId: '1', accommodation: { name: 'P1', city: 'CT', province: 'WC' }, createdAt: '2026-01-01' },
      { id: 'b2', reference: 'SA2', status: 'completed', checkIn: '2026-06-01', checkOut: '2026-06-03', guests: 1, pricePerNight: 1500, cleaningFee: 100, serviceFee: 100, subtotal: 3000, totalAmount: 3200, isPaid: true, userId: '1', accommodation: { name: 'P2', city: 'JHB', province: 'GT' }, createdAt: '2026-01-02' },
      { id: 'b3', reference: 'SA3', status: 'pending', checkIn: '2026-08-01', checkOut: '2026-08-03', guests: 1, pricePerNight: 1200, cleaningFee: 100, serviceFee: 100, subtotal: 2400, totalAmount: 2600, isPaid: false, userId: '1', accommodation: { name: 'P3', city: 'DBN', province: 'KZN' }, createdAt: '2026-01-03' },
    ];
    renderPage();
    await waitFor(() => expect(screen.getByText('P1')).toBeInTheDocument());
    expect(screen.getByText('P2')).toBeInTheDocument();
    expect(screen.getByText('P3')).toBeInTheDocument();
  });

  it('should show host tools for host user', async () => {
    mockUser = { id: '2', firstName: 'Host', lastName: 'User', email: 'host@test.com', role: 'host', isActive: true, createdAt: '2024-01-01' };
    renderPage();
    await waitFor(() => expect(screen.getByText('Host Tools')).toBeInTheDocument());
    expect(screen.getByText('My Listings')).toBeInTheDocument();
    expect(screen.getByText('Booking Requests')).toBeInTheDocument();
  });

  it('should not show host tools for tourist user', async () => {
    mockUser = { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '2024-01-01' };
    renderPage();
    await waitFor(() => expect(screen.getByText('Total Bookings')).toBeInTheDocument());
    expect(screen.queryByText('Host Tools')).not.toBeInTheDocument();
  });

  it('should show cancelled booking with correct status badge', async () => {
    mockBookings = [
      { id: 'b1', reference: 'SA1', status: 'cancelled', checkIn: '2026-07-01', checkOut: '2026-07-04', guests: 2, pricePerNight: 1000, cleaningFee: 100, serviceFee: 100, subtotal: 3000, totalAmount: 3200, isPaid: false, userId: '1', accommodation: { name: 'Cancelled Place', city: 'CT', province: 'WC' }, createdAt: '2026-01-01' },
    ];
    renderPage();
    await waitFor(() => expect(screen.getByText('cancelled')).toBeInTheDocument());
  });

  it('should show accommodation fallback name when accommodation is null', async () => {
    mockBookings = [
      { id: 'b1', reference: 'SA1', status: 'confirmed', checkIn: '2026-07-01', checkOut: '2026-07-04', guests: 2, pricePerNight: 1000, cleaningFee: 100, serviceFee: 100, subtotal: 3000, totalAmount: 3200, isPaid: true, userId: '1', accommodation: null, createdAt: '2026-01-01' },
    ];
    renderPage();
    await waitFor(() => expect(screen.getByText('Accommodation')).toBeInTheDocument());
  });

  it('should show refunded booking with correct status badge', async () => {
    mockBookings = [
      { id: 'b1', reference: 'SA1', status: 'refunded', checkIn: '2026-07-01', checkOut: '2026-07-04', guests: 1, pricePerNight: 1000, cleaningFee: 100, serviceFee: 100, subtotal: 2000, totalAmount: 2200, isPaid: false, userId: '1', accommodation: { name: 'Refunded Place', city: 'CT', province: 'WC' }, createdAt: '2026-01-01' },
    ];
    renderPage();
    await waitFor(() => expect(screen.getByText('refunded')).toBeInTheDocument());
  });
});
