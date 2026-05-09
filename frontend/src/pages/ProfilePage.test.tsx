import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockUpdateProfile = () => Promise.resolve();
let mockChangePassword = () => Promise.resolve();

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { updateProfile: (...args: any[]) => mockUpdateProfile(...args), changePassword: (...args: any[]) => mockChangePassword(...args) },
  api: { updateProfile: (...args: any[]) => mockUpdateProfile(...args), changePassword: (...args: any[]) => mockChangePassword(...args) },
}));

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '2024-01-01' }, isAuthenticated: true, isLoading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    mockUpdateProfile = jest.fn(() => Promise.resolve());
    mockChangePassword = jest.fn(() => Promise.resolve());
  });

  it('should render heading', () => {
    const { ProfilePage } = require('./ProfilePage');
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
  });

  it('should render personal information section', () => {
    const { ProfilePage } = require('./ProfilePage');
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('should render change password section heading', () => {
    const { ProfilePage } = require('./ProfilePage');
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getAllByText('Change Password').length).toBeGreaterThanOrEqual(1);
  });

  it('should render user email', () => {
    const { ProfilePage } = require('./ProfilePage');
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    const emailInput = screen.getByDisplayValue('john@test.com');
    expect(emailInput).toBeInTheDocument();
  });

  it('should render save and change password buttons', () => {
    const { ProfilePage } = require('./ProfilePage');
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('should call api.updateProfile on profile form submission', async () => {
    const { ProfilePage } = require('./ProfilePage');
    const { container } = render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    const forms = container.querySelectorAll('form');
    fireEvent.submit(forms[0]);
    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
  });

  it('should call api.changePassword on password form submission', async () => {
    const { ProfilePage } = require('./ProfilePage');
    const { container } = render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    const forms = container.querySelectorAll('form');
    const pwInputs = forms[1].querySelectorAll('input[type="password"]');
    fireEvent.change(pwInputs[0], { target: { value: 'oldPass123' } });
    fireEvent.change(pwInputs[1], { target: { value: 'newPass456' } });
    fireEvent.change(pwInputs[2], { target: { value: 'newPass456' } });
    fireEvent.submit(forms[1]);
    expect(mockChangePassword).toHaveBeenCalledWith('oldPass123', 'newPass456');
  });
});
