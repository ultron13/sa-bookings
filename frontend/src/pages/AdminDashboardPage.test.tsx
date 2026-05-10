import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockDashboard = {
  totalBookings: 42,
  totalRevenue: 125000,
  activeListings: 18,
  occupancyRate: 65,
  averageRating: 4.3,
  bookingsByStatus: [
    { status: 'confirmed', count: 20 },
    { status: 'pending', count: 10 },
    { status: 'completed', count: 8 },
    { status: 'cancelled', count: 4 },
  ],
  topProvinces: [
    { province: 'Western Cape', bookings: 15 },
    { province: 'Gauteng', bookings: 12 },
  ],
  revenueByMonth: [
    { month: '2026-01', revenue: 30000 },
    { month: '2026-02', revenue: 45000 },
  ],
  recentBookings: [],
};

const mockUsersList = [
  { id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'tourist', isActive: true, createdAt: '2026-01-01' },
  { id: 'u2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com', role: 'host', isActive: false, createdAt: '2026-01-02' },
];

const mockBookingsList = [
  {
    id: 'b1', reference: 'SA123', status: 'confirmed', checkIn: '2026-06-01', checkOut: '2026-06-03',
    totalAmount: 5000,
    user: { firstName: 'Alice', lastName: 'Smith' },
    accommodation: { name: 'Ocean Lodge' },
  },
];

let mockGetAdminDashboard = jest.fn();
let mockGetAdminUsers = jest.fn();
let mockGetAdminBookings = jest.fn();
let mockToggleUserStatus = jest.fn();

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getAdminDashboard: (...args: any[]) => mockGetAdminDashboard(...args),
    getAdminUsers: (...args: any[]) => mockGetAdminUsers(...args),
    getAdminBookings: (...args: any[]) => mockGetAdminBookings(...args),
    toggleUserStatus: (...args: any[]) => mockToggleUserStatus(...args),
  },
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    mockGetAdminDashboard = jest.fn().mockResolvedValue({ data: { data: mockDashboard } });
    mockGetAdminUsers = jest.fn().mockResolvedValue({ data: { data: mockUsersList } });
    mockGetAdminBookings = jest.fn().mockResolvedValue({ data: { data: mockBookingsList } });
    mockToggleUserStatus = jest.fn().mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => {
    const { AdminDashboardPage } = require('./AdminDashboardPage');
    return render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
  };

  it('should show loading spinner initially', () => {
    mockGetAdminDashboard = jest.fn(() => new Promise(() => {}));
    mockGetAdminUsers = jest.fn(() => new Promise(() => {}));
    mockGetAdminBookings = jest.fn(() => new Promise(() => {}));
    renderPage();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render Admin Dashboard title after load', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
  });

  it('should display overview stat labels', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Total Bookings')).toBeInTheDocument());
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Listings')).toBeInTheDocument();
    expect(screen.getByText('Avg Rating')).toBeInTheDocument();
  });

  it('should display total bookings value', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument());
  });

  it('should display bookings by status section', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Bookings by Status')).toBeInTheDocument());
    expect(screen.getByText('confirmed')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('should display top provinces section', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Top Provinces')).toBeInTheDocument());
    expect(screen.getByText('Western Cape')).toBeInTheDocument();
    expect(screen.getByText('15 bookings')).toBeInTheDocument();
  });

  it('should display monthly revenue section', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/Monthly Revenue/)).toBeInTheDocument());
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('should switch to users tab and show users', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('users'));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
  });

  it('should show active and suspended user status badges', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('users'));
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });

  it('should switch to bookings tab and show bookings', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('bookings'));
    expect(screen.getByText('SA123')).toBeInTheDocument();
    expect(screen.getByText('Ocean Lodge')).toBeInTheDocument();
  });

  it('should show no bookings message when list is empty', async () => {
    mockGetAdminBookings = jest.fn().mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('bookings'));
    expect(screen.getByText('No bookings found')).toBeInTheDocument();
  });

  it('should toggle user status when button is clicked', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('users'));
    fireEvent.click(screen.getByText('Suspend'));
    await waitFor(() => expect(mockToggleUserStatus).toHaveBeenCalledWith('u1'));
  });

  it('should handle API errors gracefully and still render page', async () => {
    mockGetAdminDashboard = jest.fn().mockRejectedValue(new Error('Network error'));
    mockGetAdminUsers = jest.fn().mockRejectedValue(new Error('Network error'));
    mockGetAdminBookings = jest.fn().mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
  });

  it('should display tab navigation buttons', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    expect(screen.getByText('overview')).toBeInTheDocument();
    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.getByText('bookings')).toBeInTheDocument();
    expect(screen.getByText('analytics')).toBeInTheDocument();
  });

  it('should switch to analytics tab and show stats', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('analytics'));
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Booking Value')).toBeInTheDocument();
    expect(screen.getByText('Occupancy Rate')).toBeInTheDocument();
  });

  it('should show revenue by province in analytics tab', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('analytics'));
    expect(screen.getByText('Revenue by Province')).toBeInTheDocument();
    expect(screen.getByText('Western Cape')).toBeInTheDocument();
  });

  it('should show booking status distribution in analytics tab', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('analytics'));
    expect(screen.getByText('Booking Status Distribution')).toBeInTheDocument();
  });

  it('should show role badges in users tab', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('users'));
    expect(screen.getByText('tourist')).toBeInTheDocument();
    expect(screen.getByText('host')).toBeInTheDocument();
  });

  it('should show booking guest name and accommodation in bookings tab', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('bookings'));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Ocean Lodge')).toBeInTheDocument();
  });
});
