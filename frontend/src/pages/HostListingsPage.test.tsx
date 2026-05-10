import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockListingData = [
  {
    id: 'l1', name: 'Ocean Lodge', type: 'lodge', city: 'Cape Town', province: 'Western Cape',
    pricePerNight: 3500, averageRating: 4.8, reviewCount: 22, isAvailable: true,
  },
  {
    id: 'l2', name: 'Bush Retreat', type: 'game_lodge', city: 'Nelspruit', province: 'Mpumalanga',
    pricePerNight: 8000, averageRating: 4.5, reviewCount: 10, isAvailable: false,
  },
];

let mockGetMyListings = jest.fn();
let mockDeleteAccommodation = jest.fn();
let mockUpdateAccommodation = jest.fn();

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getMyListings: (...args: any[]) => mockGetMyListings(...args),
    deleteAccommodation: (...args: any[]) => mockDeleteAccommodation(...args),
    updateAccommodation: (...args: any[]) => mockUpdateAccommodation(...args),
  },
}));

describe('HostListingsPage', () => {
  beforeEach(() => {
    mockGetMyListings = jest.fn().mockResolvedValue({ data: { data: mockListingData } });
    mockDeleteAccommodation = jest.fn().mockResolvedValue({});
    mockUpdateAccommodation = jest.fn().mockResolvedValue({});
    window.confirm = jest.fn().mockReturnValue(true);
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => {
    const { HostListingsPage } = require('./HostListingsPage');
    return render(<MemoryRouter><HostListingsPage /></MemoryRouter>);
  };

  it('should show loading spinner initially', () => {
    mockGetMyListings = jest.fn(() => new Promise(() => {}));
    renderPage();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render page title', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('My Listings')).toBeInTheDocument());
  });

  it('should render listings table with property names', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Ocean Lodge')).toBeInTheDocument());
    expect(screen.getByText('Bush Retreat')).toBeInTheDocument();
  });

  it('should display Total Listings stat card', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Total Listings')).toBeInTheDocument());
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('should display total count of 2', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });

  it('should display New Listing link', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('+ New Listing')).toBeInTheDocument());
  });

  it('should show empty state when no listings', async () => {
    mockGetMyListings = jest.fn().mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => expect(screen.getByText('No listings yet')).toBeInTheDocument());
    expect(screen.getByText('Create your first listing')).toBeInTheDocument();
  });

  it('should show availability and unavailability badges', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Available')).toBeInTheDocument());
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('should toggle availability when badge is clicked', async () => {
    renderPage();
    const availableBtn = await waitFor(() => screen.getAllByRole('button').find(b => b.textContent === 'Available'));
    fireEvent.click(availableBtn!);
    await waitFor(() => expect(mockUpdateAccommodation).toHaveBeenCalledWith('l1', { isAvailable: false }));
  });

  it('should delete listing after confirmation and remove from list', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Ocean Lodge')).toBeInTheDocument());
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(mockDeleteAccommodation).toHaveBeenCalledWith('l1');
      expect(screen.queryByText('Ocean Lodge')).not.toBeInTheDocument();
    });
  });

  it('should not delete listing when confirm is declined', async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    renderPage();
    await waitFor(() => expect(screen.getByText('Ocean Lodge')).toBeInTheDocument());
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteAccommodation).not.toHaveBeenCalled();
  });

  it('should display View and Edit action links', async () => {
    renderPage();
    await waitFor(() => expect(screen.getAllByText('View').length).toBe(2));
    expect(screen.getAllByText('Edit').length).toBe(2);
  });

  it('should handle API load error gracefully', async () => {
    mockGetMyListings = jest.fn().mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('My Listings')).toBeInTheDocument());
  });

  it('should show alert when delete fails', async () => {
    mockDeleteAccommodation = jest.fn().mockRejectedValue(new Error('Server error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Ocean Lodge')).toBeInTheDocument());
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Failed to delete listing.'));
  });

  it('should show alert when toggle availability fails', async () => {
    mockUpdateAccommodation = jest.fn().mockRejectedValue(new Error('Server error'));
    renderPage();
    const availableBtn = await waitFor(() => screen.getAllByRole('button').find(b => b.textContent === 'Available'));
    fireEvent.click(availableBtn!);
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Failed to update availability.'));
  });

  it('should show location for each listing', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Cape Town, Western Cape')).toBeInTheDocument());
    expect(screen.getByText('Nelspruit, Mpumalanga')).toBeInTheDocument();
  });
});
