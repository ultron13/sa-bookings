import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyProvider, useCurrency } from './CurrencyContext';

const TestComponent: React.FC = () => {
  const { currency, setCurrency, format, symbol } = useCurrency();
  return (
    <div>
      <span data-testid="currency">{currency}</span>
      <span data-testid="symbol">{symbol}</span>
      <span data-testid="price">{format(1000)}</span>
      <button onClick={() => setCurrency('USD')}>USD</button>
      <button onClick={() => setCurrency('EUR')}>EUR</button>
      <button onClick={() => setCurrency('GBP')}>GBP</button>
    </div>
  );
};

describe('CurrencyContext', () => {
  it('defaults to ZAR', () => {
    render(<CurrencyProvider><TestComponent /></CurrencyProvider>);
    expect(screen.getByTestId('currency').textContent).toBe('ZAR');
    expect(screen.getByTestId('symbol').textContent).toBe('R');
  });

  it('formats ZAR prices with R symbol', () => {
    render(<CurrencyProvider><TestComponent /></CurrencyProvider>);
    expect(screen.getByTestId('price').textContent).toContain('R');
    expect(screen.getByTestId('price').textContent).toContain('1');
  });

  it('switches to USD and formats price', () => {
    render(<CurrencyProvider><TestComponent /></CurrencyProvider>);
    fireEvent.click(screen.getByText('USD'));
    expect(screen.getByTestId('currency').textContent).toBe('USD');
    expect(screen.getByTestId('symbol').textContent).toBe('$');
    expect(screen.getByTestId('price').textContent).toContain('$');
  });

  it('switches to EUR and formats price', () => {
    render(<CurrencyProvider><TestComponent /></CurrencyProvider>);
    fireEvent.click(screen.getByText('EUR'));
    expect(screen.getByTestId('currency').textContent).toBe('EUR');
    expect(screen.getByTestId('symbol').textContent).toBe('€');
  });

  it('switches to GBP and formats price', () => {
    render(<CurrencyProvider><TestComponent /></CurrencyProvider>);
    fireEvent.click(screen.getByText('GBP'));
    expect(screen.getByTestId('currency').textContent).toBe('GBP');
    expect(screen.getByTestId('symbol').textContent).toBe('£');
    expect(screen.getByTestId('price').textContent).toContain('£');
  });
});
