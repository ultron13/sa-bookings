import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';

jest.mock('../services/api', () => {
  const mockApi = {
    getProfile: () => Promise.reject(new Error('No token')),
    login: () => Promise.resolve({ data: { data: { accessToken: 't1', refreshToken: 't2', user: { id: '1', email: 'a@b.com', role: 'tourist', firstName: 'A', lastName: 'B' } } } }),
    register: () => Promise.resolve({ data: { data: { accessToken: 't1', refreshToken: 't2', user: { id: '1', email: 'a@b.com', role: 'tourist' } } } }),
    logout: () => Promise.resolve({}),
  };
  return { __esModule: true, default: mockApi, api: mockApi };
});

const TestComp: React.FC<{ fn?: (auth: any) => void }> = ({ fn }) => {
  const { useAuth } = require('./AuthContext');
  const auth = useAuth();
  React.useEffect(() => { fn?.(auth); }, [auth, fn]);
  return <div>{auth.isAuthenticated ? `logged in as ${auth.user?.firstName}` : 'logged out'}</div>;
};

const spy = (method: string) => {
  const apiMod = require('../services/api').default;
  return jest.spyOn(apiMod, method as any);
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render children', async () => {
    const { AuthProvider } = require('./AuthContext');
    await act(async () => {
      render(<AuthProvider><div>Child Content</div></AuthProvider>);
    });
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should provide unauthenticated state when no token', async () => {
    const { AuthProvider } = require('./AuthContext');
    await act(async () => {
      render(<AuthProvider><TestComp /></AuthProvider>);
    });
    expect(screen.getByText('logged out')).toBeInTheDocument();
  });

  it('should try fetching profile when token exists', async () => {
    localStorage.setItem('accessToken', 'existing-token');
    const getProfileSpy = spy('getProfile');
    const { AuthProvider } = require('./AuthContext');
    await act(async () => {
      render(<AuthProvider><TestComp /></AuthProvider>);
    });
    expect(getProfileSpy).toHaveBeenCalled();
  });

  it('should login and set user', async () => {
    let authRef: any;
    const loginSpy = spy('login');
    const { AuthProvider } = require('./AuthContext');
    await act(async () => {
      render(<AuthProvider><TestComp fn={(a) => { authRef = a; }} /></AuthProvider>);
    });
    await act(async () => {
      await authRef.login('a@b.com', 'pass');
    });
    expect(loginSpy).toHaveBeenCalledWith('a@b.com', 'pass');
    expect(localStorage.getItem('accessToken')).toBe('t1');
    expect(localStorage.getItem('refreshToken')).toBe('t2');
  });

  it('should register and set user', async () => {
    let authRef: any;
    const regData = { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pass' };
    const registerSpy = spy('register');
    const { AuthProvider } = require('./AuthContext');
    await act(async () => {
      render(<AuthProvider><TestComp fn={(a) => { authRef = a; }} /></AuthProvider>);
    });
    await act(async () => {
      await authRef.register(regData);
    });
    expect(registerSpy).toHaveBeenCalledWith(regData);
    expect(localStorage.getItem('accessToken')).toBe('t1');
  });

  it('should logout and clear user', async () => {
    let authRef: any;
    localStorage.setItem('accessToken', 't1');
    localStorage.setItem('refreshToken', 't2');
    const getProfileSpy = spy('getProfile');
    getProfileSpy.mockResolvedValue({ data: { data: { id: '1', email: 'a@b.com', role: 'tourist', firstName: 'A', lastName: 'B' } } });
    const logoutSpy = spy('logout');
    const { AuthProvider } = require('./AuthContext');
    await act(async () => {
      render(<AuthProvider><TestComp fn={(a) => { authRef = a; }} /></AuthProvider>);
    });
    await waitFor(() => expect(getProfileSpy).toHaveBeenCalled());
    await act(async () => {
      authRef.logout();
    });
    expect(logoutSpy).toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
