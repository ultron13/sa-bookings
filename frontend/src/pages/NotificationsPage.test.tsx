import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNotification1 = { id: 'n1', title: 'Booking Confirmed', message: 'Your stay at Ocean Lodge is confirmed', type: 'booking_confirmed', isRead: false, createdAt: new Date().toISOString() };
const mockNotification2 = { id: 'n2', title: 'New Message', message: 'Hello!', type: 'new_message', isRead: true, createdAt: new Date().toISOString() };

const mockFetchNotifications = jest.fn();
const mockMarkAsRead = jest.fn();
const mockMarkAllAsRead = jest.fn();
let mockNotifications: any[] = [];
let mockUnreadCount = 0;

jest.mock('../contexts/NotificationContext', () => ({
  __esModule: true,
  useNotifications: () => ({
    notifications: mockNotifications,
    unreadCount: mockUnreadCount,
    loading: false,
    fetchNotifications: mockFetchNotifications,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
  }),
}));

import { NotificationsPage } from './NotificationsPage';

const renderPage = () =>
  render(<MemoryRouter><NotificationsPage /></MemoryRouter>);

describe('NotificationsPage', () => {
  beforeEach(() => {
    mockNotifications = [];
    mockUnreadCount = 0;
    mockFetchNotifications.mockReset();
    mockMarkAsRead.mockReset();
    mockMarkAllAsRead.mockReset();
  });

  it('should show page heading', () => {
    renderPage();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should call fetchNotifications on mount', () => {
    renderPage();
    expect(mockFetchNotifications).toHaveBeenCalled();
  });

  it('should show empty state when no notifications', () => {
    renderPage();
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('should render notifications list', () => {
    mockNotifications = [mockNotification1, mockNotification2];
    renderPage();
    expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Your stay at Ocean Lodge is confirmed')).toBeInTheDocument();
    expect(screen.getByText('New Message')).toBeInTheDocument();
  });

  it('should show mark all read button when there are unread', () => {
    mockNotifications = [mockNotification1];
    mockUnreadCount = 1;
    renderPage();
    expect(screen.getByText('Mark all as read')).toBeInTheDocument();
  });

  it('should not show mark all read button when count is 0', () => {
    mockNotifications = [mockNotification2];
    mockUnreadCount = 0;
    renderPage();
    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
  });

  it('should call markAllAsRead when button clicked', () => {
    mockNotifications = [mockNotification1];
    mockUnreadCount = 1;
    renderPage();
    fireEvent.click(screen.getByText('Mark all as read'));
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('should call markAsRead when unread notification is clicked', () => {
    mockNotifications = [mockNotification1];
    renderPage();
    fireEvent.click(screen.getByText('Booking Confirmed').closest('div[class*="cursor"]') || screen.getByText('Booking Confirmed'));
    expect(mockMarkAsRead).toHaveBeenCalledWith('n1');
  });

  it('should not call markAsRead for already-read notification', () => {
    mockNotifications = [mockNotification2];
    renderPage();
    fireEvent.click(screen.getByText('New Message'));
    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it('should show correct icon for booking_confirmed type', () => {
    mockNotifications = [mockNotification1];
    renderPage();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should show correct icon for new_message type', () => {
    mockNotifications = [mockNotification2];
    renderPage();
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  it('should show unread indicator dot for unread notifications', () => {
    mockNotifications = [mockNotification1];
    mockUnreadCount = 1;
    renderPage();
    expect(document.querySelector('.bg-blue-500.rounded-full')).toBeInTheDocument();
  });
});
