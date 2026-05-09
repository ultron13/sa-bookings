import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MainLayout } from './MainLayout';

jest.mock('../../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.doMock('../../services/api', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn().mockRejectedValue(new Error('no token')),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getFeatured: jest.fn().mockResolvedValue({ data: { data: [] } }),
    getProvinceCounts: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
  api: {
    getProfile: jest.fn().mockRejectedValue(new Error('no token')),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getFeatured: jest.fn().mockResolvedValue({ data: { data: [] } }),
    getProvinceCounts: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

describe('MainLayout', () => {
  it('should render header and footer', () => {
    render(<MemoryRouter><MainLayout /></MemoryRouter>);
    expect(screen.getAllByText('SA').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/South Africa/)).toBeInTheDocument();
  });
});
