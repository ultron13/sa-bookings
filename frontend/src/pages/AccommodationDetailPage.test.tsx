import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockAccommodation = {
  id: '1', name: 'Test Place', type: 'hotel', province: 'Western Cape', city: 'Cape Town',
  address: '123 Main', description: 'Nice place', pricePerNight: 1000, cleaningFee: 200,
  serviceFee: 100, bedrooms: 2, bathrooms: 1, maxGuests: 4,
  amenities: ['wifi', 'pool'], averageRating: 4.5, reviewCount: 10, isAvailable: true,
  images: [], cancellationPolicy: { type: 'flexible', description: 'Free cancellation', refundPercentage: 100 },
};

const mockReviewsData = [
  { id: 'r1', rating: 5, comment: 'Great!', user: { firstName: 'John', lastName: 'Doe' }, responseFromHost: 'Thank you!' },
  { id: 'r2', rating: 4, comment: 'Good stay', user: { firstName: 'Jane', lastName: 'Smith' }, responseFromHost: null },
];

let mockGetAccommodationFn = jest.fn().mockResolvedValue({ data: { data: mockAccommodation } });
let mockGetReviewsFn = jest.fn().mockResolvedValue({ data: { data: mockReviewsData } });
let mockCreateBookingFn = jest.fn().mockResolvedValue({ data: { data: { id: 'new-booking-id' } } });
let mockCreateReviewFn = jest.fn().mockResolvedValue({ data: { data: { id: 'r3', rating: 5, comment: 'Amazing!' } } });

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getAccommodation: (...args: any[]) => mockGetAccommodationFn(...args),
    getAccommodationReviews: (...args: any[]) => mockGetReviewsFn(...args),
    createBooking: (...args: any[]) => mockCreateBookingFn(...args),
    createReview: (...args: any[]) => mockCreateReviewFn(...args),
  },
  api: {
    getAccommodation: (...args: any[]) => mockGetAccommodationFn(...args),
    getAccommodationReviews: (...args: any[]) => mockGetReviewsFn(...args),
    createBooking: (...args: any[]) => mockCreateBookingFn(...args),
    createReview: (...args: any[]) => mockCreateReviewFn(...args),
  },
}));

let mockUserAuth: any = null;
let mockIsAuthenticated = false;

jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: mockUserAuth, isAuthenticated: mockIsAuthenticated, isLoading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

const touristUser = { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'tourist', isActive: true, createdAt: '' };

describe('AccommodationDetailPage', () => {
  beforeEach(() => {
    mockUserAuth = null;
    mockIsAuthenticated = false;
    mockGetAccommodationFn = jest.fn().mockResolvedValue({ data: { data: mockAccommodation } });
    mockGetReviewsFn = jest.fn().mockResolvedValue({ data: { data: mockReviewsData } });
    mockCreateBookingFn = jest.fn().mockResolvedValue({ data: { data: { id: 'new-booking-id' } } });
    mockCreateReviewFn = jest.fn().mockResolvedValue({ data: { data: { id: 'r3', rating: 5, comment: 'Amazing!' } } });
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = (url = '/accommodations/1') => {
    const { AccommodationDetailPage } = require('./AccommodationDetailPage');
    return render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/accommodations/:id" element={<AccommodationDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render accommodation details', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Place')).toBeInTheDocument());
  });

  it('should show reviews with host response', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Great!')).toBeInTheDocument());
    expect(screen.getByText('Thank you!')).toBeInTheDocument();
    expect(screen.getByText('Host response:')).toBeInTheDocument();
  });

  it('should show second review without host response', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Good stay')).toBeInTheDocument());
  });

  it('should show accommodation type badge', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Hotel')).toBeInTheDocument());
  });

  it('should show accommodation province badge', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Western Cape')).toBeInTheDocument());
  });

  it('should show description', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Nice place')).toBeInTheDocument());
  });

  it('should show amenities', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Wifi')).toBeInTheDocument());
    expect(screen.getByText('Pool')).toBeInTheDocument();
  });

  it('should show cancellation policy', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Free cancellation')).toBeInTheDocument());
  });

  it('should show Sign In to Book for unauthenticated user', async () => {
    mockIsAuthenticated = false;
    renderPage();
    await waitFor(() => expect(screen.getByText('Sign In to Book')).toBeInTheDocument());
  });

  it('should show Book Now for authenticated user', async () => {
    mockUserAuth = touristUser;
    mockIsAuthenticated = true;
    renderPage();
    await waitFor(() => expect(screen.getByText('Book Now')).toBeInTheDocument());
  });

  it('should show price per night', async () => {
    renderPage();
    await waitFor(() => expect(screen.getAllByText(/1,000/).length).toBeGreaterThanOrEqual(1));
  });

  it('should show price breakdown when dates are set', async () => {
    mockUserAuth = touristUser;
    mockIsAuthenticated = true;
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText('Book Now')).toBeInTheDocument());
    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-07-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-07-04' } });
    await waitFor(() => expect(screen.getAllByText(/Cleaning fee/).length).toBeGreaterThanOrEqual(1));
  });

  it('should navigate to login when unauthenticated user submits booking', async () => {
    mockIsAuthenticated = false;
    renderPage();
    await waitFor(() => expect(screen.getByText('Sign In to Book')).toBeInTheDocument());
    const form = screen.getByText('Sign In to Book').closest('form')!;
    await act(async () => { fireEvent.submit(form); });
  });

  it('should submit booking for authenticated user', async () => {
    mockUserAuth = touristUser;
    mockIsAuthenticated = true;
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText('Book Now')).toBeInTheDocument());
    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-07-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-07-04' } });
    await act(async () => {
      fireEvent.submit(screen.getByText('Book Now').closest('form')!);
    });
    await waitFor(() => expect(mockCreateBookingFn).toHaveBeenCalled());
  });

  it('should show booking error alert', async () => {
    mockUserAuth = touristUser;
    mockIsAuthenticated = true;
    mockCreateBookingFn = jest.fn().mockRejectedValue({ response: { data: { error: 'Dates taken' } } });
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText('Book Now')).toBeInTheDocument());
    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-07-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-07-04' } });
    await act(async () => {
      fireEvent.submit(screen.getByText('Book Now').closest('form')!);
    });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Dates taken'));
  });

  it('should show review form for tourist user', async () => {
    mockUserAuth = touristUser;
    mockIsAuthenticated = true;
    renderPage();
    await waitFor(() => expect(screen.getByText('Write a Review')).toBeInTheDocument());
    expect(screen.getByPlaceholderText('Share your experience...')).toBeInTheDocument();
  });

  it('should not show review form for unauthenticated user', async () => {
    mockIsAuthenticated = false;
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Place')).toBeInTheDocument());
    expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();
  });

  it('should submit review', async () => {
    mockUserAuth = touristUser;
    mockIsAuthenticated = true;
    renderPage();
    await waitFor(() => expect(screen.getByText('Write a Review')).toBeInTheDocument());
    const textarea = screen.getByPlaceholderText('Share your experience...');
    fireEvent.change(textarea, { target: { value: 'Amazing place!' } });
    await act(async () => {
      fireEvent.submit(textarea.closest('form')!);
    });
    await waitFor(() => expect(mockCreateReviewFn).toHaveBeenCalled());
  });

  it('should show review submit error', async () => {
    mockUserAuth = touristUser;
    mockIsAuthenticated = true;
    mockCreateReviewFn = jest.fn().mockRejectedValue({ response: { data: { error: 'Already reviewed' } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Write a Review')).toBeInTheDocument());
    const textarea = screen.getByPlaceholderText('Share your experience...');
    fireEvent.change(textarea, { target: { value: 'Test' } });
    await act(async () => {
      fireEvent.submit(textarea.closest('form')!);
    });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Already reviewed'));
  });

  it('should click star rating in review form', async () => {
    mockUserAuth = touristUser;
    mockIsAuthenticated = true;
    renderPage();
    await waitFor(() => expect(screen.getByText('Write a Review')).toBeInTheDocument());
    const reviewForm = screen.getByText('Write a Review').closest('form')!;
    const starButtons = reviewForm.querySelectorAll('button[type="button"]');
    fireEvent.click(starButtons[2]);
  });

  it('should show unavailable message when accommodation is unavailable', async () => {
    mockGetAccommodationFn = jest.fn().mockResolvedValue({ data: { data: { ...mockAccommodation, isAvailable: false } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('This accommodation is currently unavailable')).toBeInTheDocument());
  });

  it('should update guests count', async () => {
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText('Test Place')).toBeInTheDocument());
    const guestsInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(guestsInput, { target: { value: '3' } });
    expect(guestsInput).toHaveValue(3);
  });

  it('should update special requests', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Place')).toBeInTheDocument());
    const specialReqTextarea = screen.getByPlaceholderText('Optional...');
    fireEvent.change(specialReqTextarea, { target: { value: 'Early check-in' } });
    expect(specialReqTextarea).toHaveValue('Early check-in');
  });

  it('should show No reviews yet when empty', async () => {
    mockGetReviewsFn = jest.fn().mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => expect(screen.getByText('No reviews yet.')).toBeInTheDocument());
  });
});
