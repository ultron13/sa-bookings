import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken && !error.config?.url?.includes('/auth/')) {
            try {
              const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
              localStorage.setItem('accessToken', data.data.accessToken);
              localStorage.setItem('refreshToken', data.data.refreshToken);
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return this.client(error.config);
              }
            } catch {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  register(data: { firstName: string; lastName: string; email: string; password: string; phone?: string; role?: string }) {
    return this.client.post('/auth/register', data);
  }

  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  refreshToken(refreshToken: string) {
    return this.client.post('/auth/refresh-token', { refreshToken });
  }

  logout() {
    return this.client.post('/auth/logout');
  }

  getProfile() {
    return this.client.get('/auth/profile');
  }

  updateProfile(data: Partial<any>) {
    return this.client.put('/auth/profile', data);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.client.put('/auth/change-password', { currentPassword, newPassword });
  }

  // Accommodations
  searchAccommodations(params: Record<string, any>) {
    return this.client.get('/accommodations/search', { params });
  }

  getAccommodation(id: string) {
    return this.client.get(`/accommodations/${id}`);
  }

  getFeatured() {
    return this.client.get('/accommodations/featured');
  }

  getProvinceCounts() {
    return this.client.get('/accommodations/province-counts');
  }

  createAccommodation(data: Partial<any>) {
    return this.client.post('/accommodations', data);
  }

  updateAccommodation(id: string, data: Partial<any>) {
    return this.client.put(`/accommodations/${id}`, data);
  }

  deleteAccommodation(id: string) {
    return this.client.delete(`/accommodations/${id}`);
  }

  getMyListings() {
    return this.client.get('/accommodations');
  }

  // Bookings
  createBooking(data: { accommodationId: string; checkIn: string; checkOut: string; guests: number; specialRequests?: string }) {
    return this.client.post('/bookings', data);
  }

  getMyBookings(page: number = 1) {
    return this.client.get('/bookings', { params: { page } });
  }

  getBooking(id: string) {
    return this.client.get(`/bookings/${id}`);
  }

  getBookingByReference(reference: string) {
    return this.client.get(`/bookings/reference/${reference}`);
  }

  cancelBooking(id: string, reason?: string) {
    return this.client.put(`/bookings/${id}/cancel`, { reason });
  }

  getHostBookings(page: number = 1) {
    return this.client.get('/bookings/host', { params: { page } });
  }

  getAvailability(accommodationId: string, year: number, month: number) {
    return this.client.get(`/bookings/availability/${accommodationId}`, { params: { year, month } });
  }

  // Admin
  getAdminDashboard() {
    return this.client.get('/admin/dashboard');
  }

  getAdminUsers(page: number = 1) {
    return this.client.get('/admin/users', { params: { page } });
  }

  toggleUserStatus(userId: string) {
    return this.client.put(`/admin/users/${userId}/toggle-status`);
  }

  getAdminBookings(page: number = 1) {
    return this.client.get('/admin/bookings', { params: { page } });
  }

  // Payments
  createPaymentIntent(data: { bookingId: string; amount: number; currency?: string }) {
    return this.client.post('/payments/create-payment-intent', data);
  }

  // Reviews
  getAccommodationReviews(accommodationId: string, page: number = 1) {
    return this.client.get(`/reviews/accommodation/${accommodationId}`, { params: { page } });
  }

  createReview(data: { accommodationId: string; rating: number; comment: string }) {
    return this.client.post('/reviews', data);
  }

  updateReview(id: string, data: Partial<{ rating: number; comment: string }>) {
    return this.client.put(`/reviews/${id}`, data);
  }

  deleteReview(id: string) {
    return this.client.delete(`/reviews/${id}`);
  }

  respondToReview(id: string, response: string) {
    return this.client.put(`/reviews/${id}/respond`, { response });
  }

  // Messages
  getConversations() {
    return this.client.get('/messages/conversations');
  }

  getOrCreateConversation(hostId: string, accommodationId?: string) {
    return this.client.post('/messages/conversations', { hostId, accommodationId });
  }

  getConversation(id: string) {
    return this.client.get(`/messages/conversations/${id}`);
  }

  getMessages(conversationId: string, page: number = 1) {
    return this.client.get(`/messages/conversations/${conversationId}/messages`, { params: { page } });
  }

  sendMessage(conversationId: string, content: string) {
    return this.client.post(`/messages/conversations/${conversationId}/messages`, { content });
  }

  // Notifications
  getNotifications(page: number = 1) {
    return this.client.get('/notifications', { params: { page } });
  }

  getUnreadCount() {
    return this.client.get('/notifications/unread-count');
  }

  markNotificationRead(id: string) {
    return this.client.put(`/notifications/${id}/read`);
  }

  markAllNotificationsRead() {
    return this.client.put('/notifications/read-all');
  }

  // Recommendations
  getPopularAccommodations(limit: number = 8) {
    return this.client.get('/accommodations/popular', { params: { limit } });
  }

  getSimilarAccommodations(id: string, limit: number = 6) {
    return this.client.get(`/accommodations/${id}/similar`, { params: { limit } });
  }
}

export const api = new ApiService();
export default api;
