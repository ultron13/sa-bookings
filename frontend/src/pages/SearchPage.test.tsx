import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    searchAccommodations: () => Promise.resolve({ data: { data: [{ id: '1', name: 'Test Acc', type: 'hotel', province: 'Western Cape', city: 'Cape Town', pricePerNight: 1000, bedrooms: 2, bathrooms: 1, maxGuests: 4, amenities: ['wifi'], averageRating: 4.5, reviewCount: 10, images: [] }], meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } } }),
  },
  api: {
    searchAccommodations: () => Promise.resolve({ data: { data: [{ id: '1', name: 'Test Acc', type: 'hotel', province: 'Western Cape', city: 'Cape Town', pricePerNight: 1000, bedrooms: 2, bathrooms: 1, maxGuests: 4, amenities: ['wifi'], averageRating: 4.5, reviewCount: 10, images: [] }], meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } } }),
  },
}));

describe('SearchPage', () => {
  it('should render heading', async () => {
    const { SearchPage } = require('./SearchPage');
    render(<MemoryRouter><SearchPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('All Accommodations')).toBeInTheDocument());
  });

  it('should render filters', async () => {
    const { SearchPage } = require('./SearchPage');
    render(<MemoryRouter><SearchPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Filters')).toBeInTheDocument());
  });

  it('should render search results', async () => {
    const { SearchPage } = require('./SearchPage');
    render(<MemoryRouter><SearchPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Test Acc')).toBeInTheDocument());
  });
});
