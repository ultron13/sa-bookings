import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockAcc = {
  id: '1', name: 'Test Acc', type: 'hotel', province: 'Western Cape', city: 'Cape Town',
  pricePerNight: 1000, bedrooms: 2, bathrooms: 1, maxGuests: 4,
  amenities: ['wifi', 'pool', 'parking', 'gym', 'spa'],
  averageRating: 4.5, reviewCount: 10, images: [],
};

let mockSearchResultData = {
  data: [mockAcc],
  meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
};

const mockSearchFn = jest.fn().mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { searchAccommodations: (...args: any[]) => mockSearchFn(...args) },
  api: { searchAccommodations: (...args: any[]) => mockSearchFn(...args) },
}));

describe('SearchPage', () => {
  beforeEach(() => {
    mockSearchResultData = {
      data: [mockAcc],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    mockSearchFn.mockClear();
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = (url = '/accommodations') => {
    const { SearchPage } = require('./SearchPage');
    return render(
      <MemoryRouter initialEntries={[url]}>
        <SearchPage />
      </MemoryRouter>
    );
  };

  it('should render heading', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('All Accommodations')).toBeInTheDocument());
  });

  it('should render filters', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Filters')).toBeInTheDocument());
  });

  it('should render search results', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Acc')).toBeInTheDocument());
  });

  it('should show total count from meta', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('1 properties found')).toBeInTheDocument());
  });

  it('should render province filter with all provinces', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('All Provinces')).toBeInTheDocument());
    expect(screen.getByText('Western Cape')).toBeInTheDocument();
    expect(screen.getByText('Gauteng')).toBeInTheDocument();
    expect(screen.getByText('KwaZulu-Natal')).toBeInTheDocument();
  });

  it('should render type filter options', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('All Types')).toBeInTheDocument());
  });

  it('should render sort options', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
      expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
      expect(screen.getByText('Highest Rated')).toBeInTheDocument();
      expect(screen.getByText('Newest First')).toBeInTheDocument();
    });
  });

  it('should show empty state when no results', async () => {
    mockSearchResultData = {
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('No accommodations found')).toBeInTheDocument());
  });

  it('should show province-specific heading when province param provided', async () => {
    renderPage('/accommodations?province=Gauteng');
    await waitFor(() => expect(screen.getByText('Gauteng Accommodations')).toBeInTheDocument());
  });

  it('should update province filter on select change', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('All Provinces')).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: 'Gauteng' } });
    });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should update type filter on change', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('All Types')).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await act(async () => {
      fireEvent.change(selects[1], { target: { value: 'lodge' } });
    });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should update min price filter', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByPlaceholderText('Min')).toBeInTheDocument());
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Min'), { target: { value: '500' } });
    });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should update max price filter', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByPlaceholderText('Max')).toBeInTheDocument());
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Max'), { target: { value: '5000' } });
    });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should update guests filter', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByPlaceholderText('Number of guests')).toBeInTheDocument());
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Number of guests'), { target: { value: '3' } });
    });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should clear all filters on clear button click', async () => {
    renderPage('/accommodations?province=Gauteng&type=hotel');
    await waitFor(() => expect(screen.getByText('Clear Filters')).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByText('Clear Filters'));
    });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should update sort filter', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Newest First')).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await act(async () => {
      fireEvent.change(selects[2], { target: { value: 'pricePerNight_ASC' } });
    });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should render pagination when multiple pages exist', async () => {
    mockSearchResultData = {
      data: [mockAcc],
      meta: { page: 1, pageSize: 20, totalCount: 50, totalPages: 3, hasNextPage: true, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument());
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('should show disabled Previous button on first page', async () => {
    mockSearchResultData = {
      data: [mockAcc],
      meta: { page: 1, pageSize: 20, totalCount: 50, totalPages: 3, hasNextPage: true, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Previous')).toBeDisabled());
  });

  it('should navigate to next page when Next is clicked', async () => {
    mockSearchResultData = {
      data: [mockAcc],
      meta: { page: 1, pageSize: 20, totalCount: 50, totalPages: 3, hasNextPage: true, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText('Next')); });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should navigate to page number when clicked', async () => {
    mockSearchResultData = {
      data: [mockAcc],
      meta: { page: 1, pageSize: 20, totalCount: 60, totalPages: 4, hasNextPage: true, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText('2')); });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should render amenities badges with overflow indicator', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Acc')).toBeInTheDocument());
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('should handle api error gracefully', async () => {
    mockSearchFn.mockImplementation(() => Promise.reject(new Error('Network error')));
    renderPage();
    await waitFor(() => expect(screen.getByText('No accommodations found')).toBeInTheDocument());
  });

  it('should remove filter value when empty string passed', async () => {
    renderPage('/accommodations?province=Gauteng');
    await waitFor(() => expect(screen.getByText('Gauteng Accommodations')).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: '' } });
    });
    await waitFor(() => expect(mockSearchFn).toHaveBeenCalledTimes(2));
  });

  it('should handle many pages with page > 3 boundary', async () => {
    mockSearchResultData = {
      data: [mockAcc],
      meta: { page: 4, pageSize: 20, totalCount: 200, totalPages: 10, hasNextPage: true, hasPreviousPage: true },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage('/accommodations?page=4');
    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument());
    expect(screen.getByText('Previous')).not.toBeDisabled();
  });

  it('should render check-in and check-out date filter inputs', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByLabelText('Check-in')).toBeInTheDocument());
    expect(screen.getByLabelText('Check-out')).toBeInTheDocument();
  });

  it('should update checkIn date input value', async () => {
    renderPage();
    const checkInInput = await waitFor(() => screen.getByLabelText('Check-in'));
    await act(async () => {
      fireEvent.change(checkInInput, { target: { value: '2026-09-01' } });
    });
    expect((checkInInput as HTMLInputElement).value).toBe('2026-09-01');
  });

  it('should update checkOut date input value', async () => {
    renderPage();
    const checkOutInput = await waitFor(() => screen.getByLabelText('Check-out'));
    await act(async () => {
      fireEvent.change(checkOutInput, { target: { value: '2026-09-05' } });
    });
    expect((checkOutInput as HTMLInputElement).value).toBe('2026-09-05');
  });

  it('should render Exceptional review label for rating >= 9', async () => {
    mockSearchResultData = {
      data: [{ ...mockAcc, averageRating: 9.2, reviewCount: 50 }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Exceptional')).toBeInTheDocument());
  });

  it('should render Fabulous review label for rating >= 8', async () => {
    mockSearchResultData = {
      data: [{ ...mockAcc, averageRating: 8.3, reviewCount: 20 }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Fabulous')).toBeInTheDocument());
  });

  it('should render Very Good review label for rating >= 7', async () => {
    mockSearchResultData = {
      data: [{ ...mockAcc, averageRating: 7.1, reviewCount: 10 }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Very Good')).toBeInTheDocument());
  });

  it('should render Good review label for rating >= 6', async () => {
    mockSearchResultData = {
      data: [{ ...mockAcc, averageRating: 6.5, reviewCount: 8 }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Good')).toBeInTheDocument());
  });

  it('should render Pleasant review label for rating < 6', async () => {
    mockSearchResultData = {
      data: [{ ...mockAcc, averageRating: 5.0, reviewCount: 5 }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Pleasant')).toBeInTheDocument());
  });

  it('should not show review label when reviewCount is 0', async () => {
    mockSearchResultData = {
      data: [{ ...mockAcc, averageRating: 0, reviewCount: 0 }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Acc')).toBeInTheDocument());
    expect(screen.queryByText('Exceptional')).not.toBeInTheDocument();
    expect(screen.queryByText('Pleasant')).not.toBeInTheDocument();
  });

  it('should add accommodation to wishlist on heart click', async () => {
    localStorage.clear();
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Acc')).toBeInTheDocument());
    const addBtn = screen.getByRole('button', { name: /Add to wishlist/i });
    await act(async () => { fireEvent.click(addBtn); });
    expect(localStorage.getItem('sa_wishlist')).toContain('1');
  });

  it('should remove accommodation from wishlist on second heart click', async () => {
    localStorage.setItem('sa_wishlist', JSON.stringify(['1']));
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Acc')).toBeInTheDocument());
    const removeBtn = screen.getByRole('button', { name: /Remove from wishlist/i });
    await act(async () => { fireEvent.click(removeBtn); });
    const stored = JSON.parse(localStorage.getItem('sa_wishlist') || '[]');
    expect(stored).not.toContain('1');
  });

  it('should handle near-last-page boundary in pagination', async () => {
    mockSearchResultData = {
      data: [mockAcc],
      meta: { page: 9, pageSize: 20, totalCount: 200, totalPages: 10, hasNextPage: true, hasPreviousPage: true },
    };
    mockSearchFn.mockImplementation(() => Promise.resolve({ data: mockSearchResultData }));
    renderPage('/accommodations?page=9');
    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument());
    expect(screen.getByText('Previous')).not.toBeDisabled();
  });
});
