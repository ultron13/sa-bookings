import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';

let mockGetNotifications = jest.fn();
let mockGetUnreadCount = jest.fn();
let mockMarkNotificationRead = jest.fn();
let mockMarkAllNotificationsRead = jest.fn();

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getNotifications: (...args: any[]) => mockGetNotifications(...args),
    getUnreadCount: (...args: any[]) => mockGetUnreadCount(...args),
    markNotificationRead: (...args: any[]) => mockMarkNotificationRead(...args),
    markAllNotificationsRead: (...args: any[]) => mockMarkAllNotificationsRead(...args),
  },
}));

let mockIsAuthenticated = false;

jest.mock('./AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

import { NotificationProvider, useNotifications } from './NotificationContext';

const TestConsumer: React.FC = () => {
  const { unreadCount, notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  return (
    <div>
      <span data-testid="count">{unreadCount}</span>
      <span data-testid="notif-count">{notifications.length}</span>
      <button onClick={fetchNotifications}>fetch</button>
      <button onClick={() => markAsRead('n1')}>read-one</button>
      <button onClick={markAllAsRead}>read-all</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(<NotificationProvider><TestConsumer /></NotificationProvider>);

describe('NotificationContext', () => {
  beforeEach(() => {
    mockIsAuthenticated = true;
    mockGetUnreadCount = jest.fn().mockResolvedValue({ data: { data: { count: 3 } } });
    mockGetNotifications = jest.fn().mockResolvedValue({
      data: {
        data: [
          { id: 'n1', title: 'Booking', message: 'Confirmed', type: 'booking_confirmed', isRead: false, createdAt: new Date().toISOString() },
          { id: 'n2', title: 'Message', message: 'New msg', type: 'new_message', isRead: true, createdAt: new Date().toISOString() },
        ],
        meta: { total: 2, unreadCount: 1 },
      },
    });
    mockMarkNotificationRead = jest.fn().mockResolvedValue({});
    mockMarkAllNotificationsRead = jest.fn().mockResolvedValue({});
  });

  afterEach(() => jest.clearAllMocks());

  it('defaults to 0 unread count', () => {
    mockIsAuthenticated = false;
    renderWithProvider();
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('fetches unread count when authenticated', async () => {
    renderWithProvider();
    await waitFor(() => expect(mockGetUnreadCount).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('3'));
  });

  it('does not fetch when not authenticated', () => {
    mockIsAuthenticated = false;
    renderWithProvider();
    expect(mockGetUnreadCount).not.toHaveBeenCalled();
  });

  it('fetches notifications on fetchNotifications call', async () => {
    renderWithProvider();
    await act(async () => { fireEvent.click(screen.getByText('fetch')); });
    await waitFor(() => expect(mockGetNotifications).toHaveBeenCalled());
    expect(screen.getByTestId('notif-count').textContent).toBe('2');
  });

  it('marks single notification as read', async () => {
    renderWithProvider();
    await act(async () => { fireEvent.click(screen.getByText('fetch')); });
    await waitFor(() => expect(screen.getByTestId('notif-count').textContent).toBe('2'));
    await act(async () => { fireEvent.click(screen.getByText('read-one')); });
    await waitFor(() => expect(mockMarkNotificationRead).toHaveBeenCalledWith('n1'));
  });

  it('marks all notifications as read', async () => {
    renderWithProvider();
    await act(async () => { fireEvent.click(screen.getByText('fetch')); });
    await act(async () => { fireEvent.click(screen.getByText('read-all')); });
    await waitFor(() => expect(mockMarkAllNotificationsRead).toHaveBeenCalled());
  });

  it('handles getUnreadCount API error gracefully', async () => {
    mockGetUnreadCount = jest.fn().mockRejectedValue(new Error('Network error'));
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'));
  });

  it('handles getNotifications API error gracefully', async () => {
    mockGetNotifications = jest.fn().mockRejectedValue(new Error('Network error'));
    renderWithProvider();
    await act(async () => { fireEvent.click(screen.getByText('fetch')); });
    expect(screen.getByTestId('notif-count').textContent).toBe('0');
  });
});
