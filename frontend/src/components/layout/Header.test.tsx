import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
const mockLogout = jest.fn();
let mockUseAuth: any = {
  user: null, isAuthenticated: false, isLoading: false,
  login: jest.fn(), register: jest.fn(), logout: mockLogout,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

import { Header } from './Header';

const touristUser = { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '' };
const hostUser = { id: '2', firstName: 'Host', lastName: 'User', email: 'host@test.com', role: 'host', isActive: true, createdAt: '' };
const adminUser = { id: '3', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin', isActive: true, createdAt: '' };

describe('Header', () => {
  beforeEach(() => {
    mockUseAuth = {
      user: null, isAuthenticated: false, isLoading: false,
      login: jest.fn(), register: jest.fn(), logout: mockLogout,
    };
    mockNavigate.mockReset();
    mockLogout.mockReset();
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

  it('should render user initials for authenticated tourist', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render user first name for authenticated', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('should toggle dropdown when avatar is clicked', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('JD').closest('button')!);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('should close dropdown on dashboard link click', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByText('JD').closest('button')!);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dashboard'));
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('should close dropdown on profile link click', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByText('JD').closest('button')!);
    fireEvent.click(screen.getByText('Profile'));
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('should show My Listings link for host user', () => {
    mockUseAuth = { user: hostUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByText('HU').closest('button')!);
    expect(screen.getByText('My Listings')).toBeInTheDocument();
  });

  it('should not show My Listings for tourist user', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByText('JD').closest('button')!);
    expect(screen.queryByText('My Listings')).not.toBeInTheDocument();
  });

  it('should show Admin Panel link for admin user', () => {
    mockUseAuth = { user: adminUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByText('AU').closest('button')!);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('should not show Admin Panel for tourist user', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByText('JD').closest('button')!);
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('should call logout and navigate on sign out', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByText('JD').closest('button')!);
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should display full user name in dropdown', () => {
    mockUseAuth = { user: touristUser, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: mockLogout };
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByText('JD').closest('button')!);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
  });

  it('should display province links in provinces dropdown', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText('Western Cape')).toBeInTheDocument();
    expect(screen.getByText('Gauteng')).toBeInTheDocument();
    expect(screen.getByText('KwaZulu-Natal')).toBeInTheDocument();
  });
});
