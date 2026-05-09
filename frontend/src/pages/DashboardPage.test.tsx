import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { getMyBookings: () => Promise.resolve({ data: { data: [] } }) },
  api: { getMyBookings: () => Promise.resolve({ data: { data: [] } }) },
}));

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '2024-01-01' }, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('DashboardPage', () => {
  it('should render welcome message', async () => {
    const { DashboardPage } = require('./DashboardPage');
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Welcome,/)).toBeInTheDocument());
  });

  it('should render stat cards', async () => {
    const { DashboardPage } = require('./DashboardPage');
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Bookings')).toBeInTheDocument());
  });

  it('should show empty state for no bookings', async () => {
    const { DashboardPage } = require('./DashboardPage');
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('No bookings yet')).toBeInTheDocument());
  });
});
