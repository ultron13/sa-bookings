import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockFeatured: any[] = [];
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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
    mockNavigate.mockReset();
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

  it('should not render featured section when no featured accommodations', async () => {
    mockFeatured = [];
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.queryByText('Featured Accommodations')).not.toBeInTheDocument();
    });
  });

  it('should navigate to accommodations on search without params', async () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const searchBtn = screen.getByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/accommodations?');
  });

  it('should navigate with search term', async () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const searchInput = screen.getByPlaceholderText(/Search by destination/i);
    fireEvent.change(searchInput, { target: { value: 'Cape Town' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /search/i }).closest('form')!);
    });
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('q=Cape+Town'));
  });

  it('should navigate with selected province', async () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Gauteng' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /search/i }).closest('form')!);
    });
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('province=Gauteng'));
  });

  it('should navigate with both province and search term', async () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const searchInput = screen.getByPlaceholderText(/Search by destination/i);
    const select = screen.getByRole('combobox');
    fireEvent.change(searchInput, { target: { value: 'Safari' } });
    fireEvent.change(select, { target: { value: 'Limpopo' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /search/i }).closest('form')!);
    });
    const navCall = mockNavigate.mock.calls[0][0];
    expect(navCall).toContain('province=Limpopo');
    expect(navCall).toContain('q=Safari');
  });

  it('should show Start Hosting link', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const startHosting = screen.getByText('Start Hosting');
    expect(startHosting).toBeInTheDocument();
    expect(startHosting.closest('a')).toHaveAttribute('href', '/register?role=host');
  });

  it('should render all 9 province cards', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getAllByText('Explore stays →').length).toBe(9);
  });

  it('should render featured accommodation type badge', async () => {
    mockFeatured = [{
      id: '1', name: 'Safari Lodge', city: 'Hoedspruit', province: 'Limpopo',
      type: 'game_lodge', averageRating: 4.8, reviewCount: 20, pricePerNight: 5000,
    }];
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    await screen.findByText('Safari Lodge');
    expect(screen.getByText('game lodge')).toBeInTheDocument();
  });
});
