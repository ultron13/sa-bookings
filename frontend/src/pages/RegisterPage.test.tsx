import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

let mockRegister: (...args: any) => Promise<any>;
let mockNavigate: (path: string) => void;

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: () => {},
    register: (a: any) => mockRegister(a),
    logout: () => {},
  }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister = () => Promise.resolve();
    mockNavigate = jest.fn();
  });

  it('should render heading', () => {
    const { RegisterPage } = require('./RegisterPage');
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('should render form fields', () => {
    const { RegisterPage } = require('./RegisterPage');
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render role buttons', () => {
    const { RegisterPage } = require('./RegisterPage');
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    expect(screen.getByText(/Book Stays/)).toBeInTheDocument();
    expect(screen.getByText(/List Properties/)).toBeInTheDocument();
  });

  it('should render create account button', () => {
    const { RegisterPage } = require('./RegisterPage');
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('should call register with form data on successful submission', async () => {
    const registerSpy = jest.fn(() => Promise.resolve());
    mockRegister = registerSpy;

    const { RegisterPage } = require('./RegisterPage');
    const { container } = render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    const inputs = container.querySelectorAll('input');

    await userEvent.type(inputs[0], 'John');
    await userEvent.type(inputs[1], 'Doe');
    await userEvent.type(inputs[2], 'john@example.com');
    await userEvent.type(inputs[4], 'password123');
    await userEvent.type(inputs[5], 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(registerSpy).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: undefined,
      role: 'tourist',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should show error when passwords do not match', async () => {
    mockRegister = jest.fn(() => Promise.resolve());

    const { RegisterPage } = require('./RegisterPage');
    const { container } = render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    const inputs = container.querySelectorAll('input');

    await userEvent.type(inputs[4], 'password123');
    await userEvent.type(inputs[5], 'different');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show error when password is too short', async () => {
    mockRegister = jest.fn(() => Promise.resolve());

    const { RegisterPage } = require('./RegisterPage');
    const { container } = render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    const inputs = container.querySelectorAll('input');

    await userEvent.type(inputs[4], '1234567');
    await userEvent.type(inputs[5], '1234567');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });
});
