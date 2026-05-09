import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('should render the brand', () => {
    render(<Footer />);
    expect(screen.getByText('SA')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(<Footer />);
    expect(screen.getByText(/South Africa/)).toBeInTheDocument();
  });

  it('should render province links', () => {
    render(<Footer />);
    expect(screen.getByText('Western Cape')).toBeInTheDocument();
    expect(screen.getByText('Gauteng')).toBeInTheDocument();
  });

  it('should render legal links', () => {
    render(<Footer />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('should render current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(year.toString(), { exact: false })).toBeInTheDocument();
  });
});
