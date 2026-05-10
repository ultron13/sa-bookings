export {};

const mockAxiosInstance: any = jest.fn().mockResolvedValue({ data: {} });
mockAxiosInstance.post = jest.fn();
mockAxiosInstance.get = jest.fn();
mockAxiosInstance.put = jest.fn();
mockAxiosInstance.delete = jest.fn();
mockAxiosInstance.interceptors = {
  request: { use: jest.fn((fn: any) => fn) },
  response: { use: jest.fn((success: any, error: any) => ({ success, error })) },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  post: jest.fn(),
  get: jest.fn(),
}));

describe('ApiService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should create axios instance on import', () => {
    const axios = require('axios');
    require('./api');
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:4000/api/v1',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  });

  it('should export singleton api instance', () => {
    const { api } = require('./api');
    expect(api).toBeDefined();
    expect(typeof api.login).toBe('function');
    expect(typeof api.getProfile).toBe('function');
    expect(typeof api.searchAccommodations).toBe('function');
    expect(typeof api.createBooking).toBe('function');
    expect(typeof api.createReview).toBe('function');
  });

  it('should attach auth header when token exists', () => {
    localStorage.setItem('accessToken', 'my-token');
    require('./api');
    const interceptorFn = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    const config = interceptorFn({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer my-token');
  });

  it('should not attach auth header without token', () => {
    require('./api');
    const interceptorFn = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    const config = interceptorFn({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('login should call correct endpoint', () => {
    const { api } = require('./api');
    api.login('a@b.com', 'pass');
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
  });

  it('register should call correct endpoint', () => {
    const { api } = require('./api');
    const data = { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pass' };
    api.register(data);
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', data);
  });

  it('getProfile should call correct endpoint', () => {
    const { api } = require('./api');
    api.getProfile();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/profile');
  });

  it('searchAccommodations should call correct endpoint', () => {
    const { api } = require('./api');
    api.searchAccommodations({ province: 'Cape' });
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/accommodations/search', { params: { province: 'Cape' } });
  });

  it('createBooking should call correct endpoint', () => {
    const { api } = require('./api');
    api.createBooking({ accommodationId: 'a1', checkIn: '2026-07-01', checkOut: '2026-07-04', guests: 2 });
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/bookings', { accommodationId: 'a1', checkIn: '2026-07-01', checkOut: '2026-07-04', guests: 2 });
  });

  it('getAccommodationReviews should call correct endpoint', () => {
    const { api } = require('./api');
    api.getAccommodationReviews('a1', 1);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/reviews/accommodation/a1', { params: { page: 1 } });
  });

  it('logout should call correct endpoint', () => {
    const { api } = require('./api');
    api.logout();
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('getMyBookings should call correct endpoint', () => {
    const { api } = require('./api');
    api.getMyBookings(2);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings', { params: { page: 2 } });
  });

  it('cancelBooking should call correct endpoint', () => {
    const { api } = require('./api');
    api.cancelBooking('b1', 'reason');
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/bookings/b1/cancel', { reason: 'reason' });
  });

  it('response success interceptor should return response', () => {
    require('./api');
    const successFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
    const response = { data: { success: true } };
    expect(successFn(response)).toBe(response);
  });

  it('response error interceptor should reject non-401 errors', async () => {
    require('./api');
    const errorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const error = { response: { status: 400 } };
    await expect(errorFn(error)).rejects.toBe(error);
  });

  it('should reject 401 without refresh token', async () => {
    require('./api');
    const errorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const error = { response: { status: 401 }, config: { url: '/bookings', headers: {} } };
    await expect(errorFn(error)).rejects.toBe(error);
  });

  it('should reject 401 on auth endpoints without refresh attempt', async () => {
    localStorage.setItem('refreshToken', 'rt');
    require('./api');
    const errorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const error = { response: { status: 401 }, config: { url: '/auth/login', headers: {} } };
    await expect(errorFn(error)).rejects.toBe(error);
  });

  it('should refresh token on 401 and retry request', async () => {
    localStorage.setItem('refreshToken', 'valid-rt');
    localStorage.setItem('accessToken', 'old-token');
    require('./api');
    const errorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { data: { accessToken: 'new-token', refreshToken: 'new-rt' } } });
    const config = { url: '/bookings', headers: { Authorization: 'Bearer old-token' } };
    const error = { response: { status: 401 }, config };
    await errorFn(error);
    expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/api/v1/auth/refresh-token', { refreshToken: 'valid-rt' });
    expect(localStorage.getItem('accessToken')).toBe('new-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-rt');
    expect(config.headers.Authorization).toBe('Bearer new-token');
    expect(mockAxiosInstance).toHaveBeenCalledWith(config);
  });

  it('should clear tokens and redirect on refresh failure', async () => {
    localStorage.setItem('refreshToken', 'bad-rt');
    localStorage.setItem('accessToken', 'old-token');
    require('./api');
    const errorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const axios = require('axios');
    axios.post.mockRejectedValue(new Error('invalid token'));
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });

    const config = { url: '/bookings', headers: {} };
    const error = { response: { status: 401 }, config };
    await expect(errorFn(error)).rejects.toBe(error);
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('refreshToken should call correct endpoint', () => {
    const { api } = require('./api');
    api.refreshToken('rt');
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/refresh-token', { refreshToken: 'rt' });
  });

  it('updateProfile should call correct endpoint', () => {
    const { api } = require('./api');
    api.updateProfile({ firstName: 'A' });
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/auth/profile', { firstName: 'A' });
  });

  it('changePassword should call correct endpoint', () => {
    const { api } = require('./api');
    api.changePassword('old', 'new');
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/auth/change-password', { currentPassword: 'old', newPassword: 'new' });
  });

  it('getAccommodation should call correct endpoint', () => {
    const { api } = require('./api');
    api.getAccommodation('a1');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/accommodations/a1');
  });

  it('getFeatured should call correct endpoint', () => {
    const { api } = require('./api');
    api.getFeatured();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/accommodations/featured');
  });

  it('getProvinceCounts should call correct endpoint', () => {
    const { api } = require('./api');
    api.getProvinceCounts();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/accommodations/province-counts');
  });

  it('createAccommodation should call correct endpoint', () => {
    const { api } = require('./api');
    api.createAccommodation({ name: 'Test' });
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/accommodations', { name: 'Test' });
  });

  it('updateAccommodation should call correct endpoint', () => {
    const { api } = require('./api');
    api.updateAccommodation('a1', { name: 'Updated' });
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/accommodations/a1', { name: 'Updated' });
  });

  it('deleteAccommodation should call correct endpoint', () => {
    const { api } = require('./api');
    api.deleteAccommodation('a1');
    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/accommodations/a1');
  });

  it('getMyListings should call correct endpoint', () => {
    const { api } = require('./api');
    api.getMyListings();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/accommodations');
  });

  it('getBooking should call correct endpoint', () => {
    const { api } = require('./api');
    api.getBooking('b1');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings/b1');
  });

  it('getBookingByReference should call correct endpoint', () => {
    const { api } = require('./api');
    api.getBookingByReference('REF');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings/reference/REF');
  });

  it('createPaymentIntent should call correct endpoint', () => {
    const { api } = require('./api');
    api.createPaymentIntent({ bookingId: 'b1', amount: 1000 });
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments/create-payment-intent', { bookingId: 'b1', amount: 1000 });
  });

  it('updateReview should call correct endpoint', () => {
    const { api } = require('./api');
    api.updateReview('r1', { rating: 4 });
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/reviews/r1', { rating: 4 });
  });

  it('deleteReview should call correct endpoint', () => {
    const { api } = require('./api');
    api.deleteReview('r1');
    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/reviews/r1');
  });

  it('respondToReview should call correct endpoint', () => {
    const { api } = require('./api');
    api.respondToReview('r1', 'Thank you');
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/reviews/r1/respond', { response: 'Thank you' });
  });

  it('createReview should call correct endpoint', () => {
    const { api } = require('./api');
    api.createReview({ accommodationId: 'a1', rating: 5, comment: 'Great!' });
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/reviews', { accommodationId: 'a1', rating: 5, comment: 'Great!' });
  });

  it('getHostBookings should call correct endpoint with page', () => {
    const { api } = require('./api');
    api.getHostBookings(2);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings/host', { params: { page: 2 } });
  });

  it('getHostBookings should default to page 1', () => {
    const { api } = require('./api');
    api.getHostBookings();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings/host', { params: { page: 1 } });
  });

  it('getAdminDashboard should call correct endpoint', () => {
    const { api } = require('./api');
    api.getAdminDashboard();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('getAdminUsers should call correct endpoint with page', () => {
    const { api } = require('./api');
    api.getAdminUsers(3);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/users', { params: { page: 3 } });
  });

  it('getAdminUsers should default to page 1', () => {
    const { api } = require('./api');
    api.getAdminUsers();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/users', { params: { page: 1 } });
  });

  it('toggleUserStatus should call correct endpoint', () => {
    const { api } = require('./api');
    api.toggleUserStatus('u1');
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/admin/users/u1/toggle-status');
  });

  it('getAdminBookings should call correct endpoint with page', () => {
    const { api } = require('./api');
    api.getAdminBookings(2);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/bookings', { params: { page: 2 } });
  });

  it('getAdminBookings should default to page 1', () => {
    const { api } = require('./api');
    api.getAdminBookings();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/bookings', { params: { page: 1 } });
  });

  it('getAccommodationReviews should default to page 1', () => {
    const { api } = require('./api');
    api.getAccommodationReviews('a1');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/reviews/accommodation/a1', { params: { page: 1 } });
  });

  it('getMyBookings should default to page 1', () => {
    const { api } = require('./api');
    api.getMyBookings();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings', { params: { page: 1 } });
  });

  it('cancelBooking should call with undefined reason when omitted', () => {
    const { api } = require('./api');
    api.cancelBooking('b1');
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/bookings/b1/cancel', { reason: undefined });
  });

  it('should handle 401 when error.config is null after token refresh', async () => {
    localStorage.setItem('refreshToken', 'valid-rt');
    require('./api');
    const errorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { data: { accessToken: 'new-token', refreshToken: 'new-rt' } } });
    const error = { response: { status: 401 }, config: null };
    await expect(errorFn(error)).rejects.toBe(error);
    expect(axios.post).toHaveBeenCalled();
  });
});
