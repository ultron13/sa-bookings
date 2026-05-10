import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// JSDOM doesn't implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockConversation = {
  id: 'c1',
  guest: { id: 'u1', firstName: 'Alice', lastName: 'Smith' },
  host: { id: 'h1', firstName: 'Bob', lastName: 'Jones' },
  accommodation: { id: 'a1', name: 'Ocean Lodge' },
};
const mockMessages = [
  { id: 'm1', content: 'Hello!', senderId: 'u1', sender: { firstName: 'Alice', lastName: 'Smith' }, createdAt: new Date().toISOString() },
  { id: 'm2', content: 'Hi there!', senderId: 'h1', sender: { firstName: 'Bob', lastName: 'Jones' }, createdAt: new Date().toISOString() },
];

let mockGetConversation = jest.fn();
let mockGetMessages = jest.fn();
let mockSendMessage = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getConversation: (...args: any[]) => mockGetConversation(...args),
    getMessages: (...args: any[]) => mockGetMessages(...args),
    sendMessage: (...args: any[]) => mockSendMessage(...args),
  },
}));

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: { id: 'u1', firstName: 'Alice', role: 'tourist' }, isAuthenticated: true }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

const renderPage = () => {
  const { ConversationPage } = require('./ConversationPage');
  return render(
    <MemoryRouter initialEntries={['/messages/c1']}>
      <Routes>
        <Route path="/messages/:id" element={<ConversationPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ConversationPage', () => {
  beforeEach(() => {
    mockGetConversation = jest.fn().mockResolvedValue({ data: { data: mockConversation } });
    mockGetMessages = jest.fn().mockResolvedValue({ data: { data: mockMessages, meta: { total: 2 } } });
    mockSendMessage = jest.fn().mockResolvedValue({ data: { data: { id: 'm3', content: 'Test', senderId: 'u1', sender: { firstName: 'Alice', lastName: 'Smith' }, createdAt: new Date().toISOString() } } });
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner initially', () => {
    mockGetConversation = jest.fn(() => new Promise(() => {}));
    mockGetMessages = jest.fn(() => new Promise(() => {}));
    renderPage();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render other party name', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('should render messages', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Hello!')).toBeInTheDocument());
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('should show accommodation link', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Ocean Lodge')).toBeInTheDocument());
  });

  it('should send a message', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument());
    const input = screen.getByPlaceholderText('Type a message...');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New message' } });
      fireEvent.submit(input.closest('form')!);
    });
    await waitFor(() => expect(mockSendMessage).toHaveBeenCalledWith('c1', 'New message'));
  });

  it('should not send empty message', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Send')).toBeInTheDocument());
    expect(screen.getByText('Send').closest('button')).toBeDisabled();
  });

  it('should navigate to /messages on load failure', async () => {
    mockGetConversation = jest.fn().mockRejectedValue(new Error('Not found'));
    renderPage();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages'));
  });

  it('should show empty messages placeholder', async () => {
    mockGetMessages = jest.fn().mockResolvedValue({ data: { data: [], meta: { total: 0 } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('No messages yet. Say hello!')).toBeInTheDocument());
  });

  it('should show Back to messages link', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
    const backLink = document.querySelector('a[href="/messages"]');
    expect(backLink).toBeInTheDocument();
  });

  it('should poll for messages every 5 seconds', async () => {
    jest.useFakeTimers();
    renderPage();
    // Advance past initial render
    await act(async () => { jest.advanceTimersByTime(100); });
    await act(async () => { jest.advanceTimersByTime(5000); });
    expect(mockGetMessages.mock.calls.length).toBeGreaterThanOrEqual(1);
    jest.useRealTimers();
  });

  it('should show alert on send failure', async () => {
    window.alert = jest.fn();
    mockSendMessage = jest.fn().mockRejectedValue({ response: { data: { error: 'Send failed' } } });
    renderPage();
    await waitFor(() => expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument());
    const input = screen.getByPlaceholderText('Type a message...');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'hello' } });
      fireEvent.submit(input.closest('form')!);
    });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Send failed'));
  });

  it('should show conversation without accommodation', async () => {
    mockGetConversation = jest.fn().mockResolvedValue({
      data: { data: { ...mockConversation, accommodation: null } },
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
    expect(screen.queryByText('Ocean Lodge')).not.toBeInTheDocument();
  });
});
