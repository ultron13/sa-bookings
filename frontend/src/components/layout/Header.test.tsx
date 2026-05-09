import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockUseAuth: any = {
  user: null, isAuthenticated: false, isLoading: false,
  login: jest.fn(), register: jest.fn(), logout: jest.fn(),
};

jest.mock('../../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

import { Header } from './Header';

describe('Header', () => {
  beforeEach(() => {
    mockUseAuth = {
      user: null, isAuthenticated: false, isLoading: false,
      login: jest.fn(), register: jest.fn(), logout: jest.fn(),
    };
  });

  it('should render brand', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('SA')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
  });

  it('should render accommodations link', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('Accommodations')).toBeInTheDocument();
  });

  it('should render provinces button', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('Provinces')).toBeInTheDocument();
  });

  it('should render sign in and get started for unauthenticated', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('should render user initials for authenticated', () => {
    mockUseAuth = {
      user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '' },
      isAuthenticated: true, isLoading: false,
      login: jest.fn(), register: jest.fn(), logout: jest.fn(),
    };
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render user first name for authenticated', () => {
    mockUseAuth = {
      user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '' },
      isAuthenticated: true, isLoading: false,
      login: jest.fn(), register: jest.fn(), logout: jest.fn(),
    };
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('John')).toBeInTheDocument();
  });


});
