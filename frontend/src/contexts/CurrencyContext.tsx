import React, { createContext, useContext, useState } from 'react';

export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

const RATES: Record<Currency, number> = {
  ZAR: 1,
  USD: 0.055,
  EUR: 0.051,
  GBP: 0.043,
};

const SYMBOLS: Record<Currency, string> = {
  ZAR: 'R',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (zarAmount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'ZAR',
  setCurrency: () => {},
  format: (n) => `R ${n.toLocaleString()}`,
  symbol: 'R',
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('ZAR');

  const format = (zarAmount: number): string => {
    const converted = zarAmount * RATES[currency];
    const symbol = SYMBOLS[currency];
    if (currency === 'ZAR') return `${symbol} ${Math.round(converted).toLocaleString()}`;
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, symbol: SYMBOLS[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
