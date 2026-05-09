import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockUseAuth: any = {
  user: null, isAuthenticated: false, isLoading: false,
  login: jest.fn(), register: jest.fn(), logout: jest.fn(),
};

jest.mock('./contexts/AuthContext', () => ({
  __esModule: true,
  AuthProvider: ({ children }: any) => <>{children}</>,
  useAuth: () => mockUseAuth,
}));

jest.mock('./services/api', () => ({
  __esModule: true,
  default: {
    getFeatured: () => Promise.resolve({ data: { data: [] } }),
    getProfile: () => Promise.reject(new Error('no token')),
  },
  api: {
    getFeatured: () => Promise.resolve({ data: { data: [] } }),
    getProfile: () => Promise.reject(new Error('no token')),
  },
}));

import { AppRoutes } from './App';

describe('App', () => {
  beforeEach(() => {
    mockUseAuth = {
      user: null, isAuthenticated: false, isLoading: false,
      login: jest.fn(), register: jest.fn(), logout: jest.fn(),
    };
  });

  it('should render home page at /', () => {
    render(<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>);
    expect(screen.getByText(/Discover South Africa/i)).toBeInTheDocument();
  });

  it('should render header with brand', () => {
    render(<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>);
    expect(screen.getAllByText('SA').length).toBeGreaterThanOrEqual(1);
  });

  it('should show accommodations link', () => {
    render(<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>);
    expect(screen.getByText(/Accommodations/i)).toBeInTheDocument();
  });

  it('should redirect to login when accessing protected route unauthenticated', () => {
    render(<MemoryRouter initialEntries={['/dashboard']}><AppRoutes /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});

describe('App - loading state', () => {
  beforeEach(() => {
    mockUseAuth = {
      user: null, isAuthenticated: false, isLoading: true,
      login: jest.fn(), register: jest.fn(), logout: jest.fn(),
    };
  });

  it('should show spinner on protected route when isLoading', () => {
    render(<MemoryRouter initialEntries={['/profile']}><AppRoutes /></MemoryRouter>);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

describe('App - authenticated state', () => {
  beforeEach(() => {
    mockUseAuth = {
      user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '2024-01-01' },
      isAuthenticated: true, isLoading: false,
      login: jest.fn(), register: jest.fn(), logout: jest.fn(),
    };
  });

  it('should render profile page on protected route', () => {
    render(<MemoryRouter initialEntries={['/profile']}><AppRoutes /></MemoryRouter>);
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
  });
});
