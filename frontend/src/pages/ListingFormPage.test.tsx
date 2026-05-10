import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockAccommodationData = {
  id: 'l1', name: 'Ocean Lodge', description: 'Beautiful lodge', type: 'lodge',
  province: 'Western Cape', city: 'Cape Town', address: '1 Beach Road',
  latitude: -33.9, longitude: 18.4, pricePerNight: 3500, cleaningFee: 500, serviceFee: 350,
  maxGuests: 4, bedrooms: 2, beds: 3, bathrooms: 2, amenities: ['wifi', 'pool'],
  checkInTime: '14:00', checkOutTime: '11:00', isAvailable: true,
};

const mockNavigate = jest.fn();

let mockGetAccommodation = jest.fn();
let mockCreateAccommodation = jest.fn();
let mockUpdateAccommodation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getAccommodation: (...args: any[]) => mockGetAccommodation(...args),
    createAccommodation: (...args: any[]) => mockCreateAccommodation(...args),
    updateAccommodation: (...args: any[]) => mockUpdateAccommodation(...args),
  },
}));

const renderCreatePage = () => {
  const { ListingFormPage } = require('./ListingFormPage');
  return render(
    <MemoryRouter initialEntries={['/host/listings/new']}>
      <Routes>
        <Route path="/host/listings/new" element={<ListingFormPage />} />
      </Routes>
    </MemoryRouter>
  );
};

const renderEditPage = () => {
  const { ListingFormPage } = require('./ListingFormPage');
  return render(
    <MemoryRouter initialEntries={['/host/listings/l1/edit']}>
      <Routes>
        <Route path="/host/listings/:id/edit" element={<ListingFormPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ListingFormPage - Create Mode', () => {
  beforeEach(() => {
    mockGetAccommodation = jest.fn();
    mockCreateAccommodation = jest.fn().mockResolvedValue({});
    mockUpdateAccommodation = jest.fn().mockResolvedValue({});
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render Create New Listing title', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Create New Listing')).toBeInTheDocument());
  });

  it('should render Basic Information section', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Basic Information')).toBeInTheDocument());
  });

  it('should render Pricing section', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Pricing')).toBeInTheDocument());
  });

  it('should render Capacity & Details section', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Capacity & Details')).toBeInTheDocument());
  });

  it('should render Amenities section', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Amenities')).toBeInTheDocument());
  });

  it('should show Create Listing submit button', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Create Listing')).toBeInTheDocument());
  });

  it('should show Cancel button', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument());
  });

  it('should navigate back when Cancel is clicked', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/host/listings');
  });

  it('should navigate back when back link is clicked', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('← Back to listings')).toBeInTheDocument());
    fireEvent.click(screen.getByText('← Back to listings'));
    expect(mockNavigate).toHaveBeenCalledWith('/host/listings');
  });

  it('should toggle amenity selection on and off', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Wifi')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Wifi'));
    fireEvent.click(screen.getByText('Pool'));
    fireEvent.click(screen.getByText('Wifi'));
  });

  it('should call createAccommodation and navigate on success', async () => {
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Create New Listing')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('e.g. Ocean View Villa'), { target: { value: 'Test Lodge' } });
    fireEvent.change(screen.getByPlaceholderText('Describe your property...'), { target: { value: 'A great place' } });
    fireEvent.change(screen.getByPlaceholderText('Cape Town'), { target: { value: 'Cape Town' } });
    fireEvent.change(screen.getByPlaceholderText('123 Main Street'), { target: { value: '1 Beach Rd' } });
    fireEvent.change(screen.getByPlaceholderText('-33.9249'), { target: { value: '-33.9' } });
    fireEvent.change(screen.getByPlaceholderText('18.4241'), { target: { value: '18.4' } });
    fireEvent.click(screen.getByText('Create Listing'));
    await waitFor(() => {
      expect(mockCreateAccommodation).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/host/listings');
    });
  });

  it('should show error message when create fails with error message', async () => {
    mockCreateAccommodation = jest.fn().mockRejectedValue({
      response: { data: { error: 'Validation failed' } },
    });
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Create Listing')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create Listing'));
    await waitFor(() => expect(screen.getByText('Validation failed')).toBeInTheDocument());
  });

  it('should show error message when create fails with errors array', async () => {
    mockCreateAccommodation = jest.fn().mockRejectedValue({
      response: { data: { errors: [{ msg: 'Name is required' }] } },
    });
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Create Listing')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create Listing'));
    await waitFor(() => expect(screen.getByText('Name is required')).toBeInTheDocument());
  });

  it('should show fallback error message on unknown failure', async () => {
    mockCreateAccommodation = jest.fn().mockRejectedValue(new Error('Unknown error'));
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Create Listing')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create Listing'));
    await waitFor(() => expect(screen.getByText('Failed to save listing')).toBeInTheDocument());
  });

  it('should show Saving... while submitting', async () => {
    mockCreateAccommodation = jest.fn(() => new Promise(() => {}));
    renderCreatePage();
    await waitFor(() => expect(screen.getByText('Create Listing')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create Listing'));
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});

describe('ListingFormPage - Edit Mode', () => {
  beforeEach(() => {
    mockGetAccommodation = jest.fn().mockResolvedValue({ data: { data: mockAccommodationData } });
    mockCreateAccommodation = jest.fn().mockResolvedValue({});
    mockUpdateAccommodation = jest.fn().mockResolvedValue({});
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner while fetching', () => {
    mockGetAccommodation = jest.fn(() => new Promise(() => {}));
    renderEditPage();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render Edit Listing title after load', async () => {
    renderEditPage();
    await waitFor(() => expect(screen.getByText('Edit Listing')).toBeInTheDocument());
  });

  it('should pre-fill form with existing accommodation data', async () => {
    renderEditPage();
    await waitFor(() => expect(screen.getByDisplayValue('Ocean Lodge')).toBeInTheDocument());
    expect(screen.getByDisplayValue('Beautiful lodge')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cape Town')).toBeInTheDocument();
  });

  it('should show Save Changes submit button', async () => {
    renderEditPage();
    await waitFor(() => expect(screen.getByText('Save Changes')).toBeInTheDocument());
  });

  it('should call updateAccommodation on submit and navigate', async () => {
    renderEditPage();
    await waitFor(() => expect(screen.getByText('Save Changes')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(mockUpdateAccommodation).toHaveBeenCalledWith('l1', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/host/listings');
    });
  });

  it('should navigate to host/listings on fetch error', async () => {
    mockGetAccommodation = jest.fn().mockRejectedValue(new Error('Not found'));
    renderEditPage();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/host/listings'));
  });

  it('should show pre-selected amenities from existing data', async () => {
    renderEditPage();
    await waitFor(() => expect(screen.getByText('Edit Listing')).toBeInTheDocument());
    expect(screen.getByText('Wifi')).toBeInTheDocument();
    expect(screen.getByText('Pool')).toBeInTheDocument();
  });
});
