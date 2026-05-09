import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

const mockNavigate = jest.fn();
let mockLogin = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    register: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin = jest.fn().mockResolvedValue(undefined);
    mockNavigate.mockReset();
    jest.clearAllMocks();
  });

  it('should render sign in heading', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should render password input', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should render sign in button', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render register link', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('should update email on change', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    expect(emailInput).toHaveValue('user@test.com');
  });

  it('should update password on change', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    const pwInput = screen.getByPlaceholderText(/••••••••/);
    fireEvent.change(pwInput, { target: { value: 'mypassword' } });
    expect(pwInput).toHaveValue('mypassword');
  });

  it('should call login and navigate on successful submission', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), { target: { value: 'mypassword' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'mypassword');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should display error message on failed login', async () => {
    const errorObj = { response: { data: { error: 'Invalid credentials' } } };
    mockLogin.mockRejectedValueOnce(errorObj);

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), { target: { value: 'wrongpass' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should display fallback error message when no response data', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'));

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), { target: { value: 'pass' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);
    });

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    let resolveLogin: () => void;
    mockLogin.mockReturnValueOnce(new Promise<void>((res) => { resolveLogin = res; }));

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), { target: { value: 'pass' } });

    act(() => {
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);
    });

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    await act(async () => { resolveLogin!(); });
  });
});
