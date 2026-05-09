import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockFeatured: any[] = [];

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getFeatured: () => Promise.resolve({ data: { data: mockFeatured } }),
  },
  api: {
    getFeatured: () => Promise.resolve({ data: { data: mockFeatured } }),
  },
}));

import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    mockFeatured = [];
  });

  it('should render hero section', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText(/Discover South Africa/i)).toBeInTheDocument();
  });

  it('should render search placeholder', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search by destination/i)).toBeInTheDocument();
  });

  it('should render all province cards', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getAllByText('Western Cape').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Gauteng').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('KwaZulu-Natal').length).toBeGreaterThanOrEqual(1);
  });

  it('should render Become a Host section', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText('Become a Host')).toBeInTheDocument();
  });

  it('should render province select options', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should render featured section when featured exist', async () => {
    mockFeatured = [{
      id: '1', name: 'Test Stay', city: 'Cape Town', province: 'Western Cape',
      type: 'hotel', averageRating: 4.5, reviewCount: 10, pricePerNight: 1500,
    }];
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(await screen.findByText('Featured Accommodations')).toBeInTheDocument();
    expect(screen.getByText('Test Stay')).toBeInTheDocument();
  });
});
