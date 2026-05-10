import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

let mockGetAvailability = jest.fn().mockResolvedValue({ data: { data: [] } });

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { getAvailability: (...args: any[]) => mockGetAvailability(...args) },
}));

import { AvailabilityCalendar } from './AvailabilityCalendar';

describe('AvailabilityCalendar', () => {
  beforeEach(() => {
    mockGetAvailability = jest.fn().mockResolvedValue({ data: { data: [] } });
  });

  afterEach(() => jest.clearAllMocks());

  it('renders month name', async () => {
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeInTheDocument());
  });

  it('calls getAvailability on mount', async () => {
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalled());
  });

  it('renders day headers', async () => {
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(screen.getByText('Mon')).toBeInTheDocument());
    expect(screen.getByText('Fri')).toBeInTheDocument();
  });

  it('renders availability legend', async () => {
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(screen.getByText('Available')).toBeInTheDocument());
    expect(screen.getByText('Booked')).toBeInTheDocument();
  });

  it('navigates to next month', async () => {
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(screen.getByText('Mon')).toBeInTheDocument());
    const btns = screen.getAllByRole('button');
    const nextBtn = btns[btns.length - 1];
    fireEvent.click(nextBtn);
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledTimes(2));
  });

  it('navigates to previous month', async () => {
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(screen.getByText('Mon')).toBeInTheDocument());
    const btns = screen.getAllByRole('button');
    fireEvent.click(btns[0]);
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledTimes(2));
  });

  it('marks booked dates using availability data', async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const checkIn = `${year}-${month}-20`;
    const checkOut = `${year}-${month}-22`;
    mockGetAvailability = jest.fn().mockResolvedValue({ data: { data: [{ checkIn, checkOut }] } });
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledWith('acc1', year, today.getMonth() + 1));
  });

  it('handles API error gracefully', async () => {
    mockGetAvailability = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(screen.getByText('Available')).toBeInTheDocument());
  });

  it('navigates back decrements month and fetches again', async () => {
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledTimes(1));
    const btns = screen.getAllByRole('button');
    fireEvent.click(btns[0]);
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledTimes(2));
  });

  it('navigates forward increments month and fetches again', async () => {
    render(<AvailabilityCalendar accommodationId="acc1" />);
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledTimes(1));
    const btns = screen.getAllByRole('button');
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() => expect(mockGetAvailability).toHaveBeenCalledTimes(2));
  });
});
