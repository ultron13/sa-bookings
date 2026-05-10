import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { NotificationProvider } from './contexts/NotificationContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <CurrencyProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </CurrencyProvider>
  </React.StrictMode>
);
