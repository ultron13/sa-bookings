import React from 'react';

export const MapContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div data-testid="map-container">{children}</div>;
export const TileLayer: React.FC = () => <div data-testid="tile-layer" />;
export const Marker: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div data-testid="marker">{children}</div>;
export const Popup: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div data-testid="popup">{children}</div>;
