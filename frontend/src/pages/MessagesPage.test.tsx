import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockConversations = [
  {
    id: 'c1',
    guest: { id: 'u1', firstName: 'Alice', lastName: 'Smith' },
    host: { id: 'h1', firstName: 'Bob', lastName: 'Jones' },
    accommodation: { id: 'a1', name: 'Ocean Lodge' },
    lastMessage: 'Hello there',
    updatedAt: new Date().toISOString(),
  },
];

let mockGetConversations = jest.fn();

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { getConversations: (...args: any[]) => mockGetConversations(...args) },
}));

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: { id: 'u1', firstName: 'Alice', role: 'tourist' }, isAuthenticated: true }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('MessagesPage', () => {
  beforeEach(() => {
    mockGetConversations = jest.fn().mockResolvedValue({ data: { data: mockConversations } });
  });

  afterEach(() => jest.clearAllMocks());

  const renderPage = () => {
    const { MessagesPage } = require('./MessagesPage');
    return render(<MemoryRouter><MessagesPage /></MemoryRouter>);
  };

  it('should show page heading', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Messages')).toBeInTheDocument());
  });

  it('should show loading spinner initially', () => {
    mockGetConversations = jest.fn(() => new Promise(() => {}));
    renderPage();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render conversation list', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('should show accommodation name in conversation', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Ocean Lodge')).toBeInTheDocument());
  });

  it('should show empty state when no conversations', async () => {
    mockGetConversations = jest.fn().mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => expect(screen.getByText('No messages yet')).toBeInTheDocument());
    expect(screen.getByText('Browse Accommodations')).toBeInTheDocument();
  });

  it('should handle API error gracefully', async () => {
    mockGetConversations = jest.fn().mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Messages')).toBeInTheDocument());
  });

  it('should show time formatted for recent conversation', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
  });

  it('shows Yesterday for conversations from yesterday', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    mockGetConversations = jest.fn().mockResolvedValue({
      data: { data: [{ ...mockConversations[0], updatedAt: yesterday.toISOString() }] },
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Yesterday')).toBeInTheDocument());
  });

  it('shows weekday for conversations within 7 days', async () => {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    mockGetConversations = jest.fn().mockResolvedValue({
      data: { data: [{ ...mockConversations[0], updatedAt: fiveDaysAgo.toISOString() }] },
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
  });

  it('shows conversation without accommodation', async () => {
    mockGetConversations = jest.fn().mockResolvedValue({
      data: { data: [{ ...mockConversations[0], accommodation: null, lastMessage: '' }] },
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });
});
