import React from 'react';
import { render } from '@testing-library/react-native';
import { OfflineIndicator } from '../offline-indicator';
import { useOfflineStore } from '../../stores/offline';

// Mock the offline store
jest.mock('../../stores/offline');

describe('OfflineIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when online', () => {
    // Mock store returning online status
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({
      isOnline: true,
    });

    const { queryByText } = render(<OfflineIndicator />);
    
    // Should not show offline message when online
    expect(queryByText(/Offline Mode/i)).toBeNull();
  });

  it('should render when offline', () => {
    // Mock store returning offline status
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({
      isOnline: false,
    });

    const { getByText } = render(<OfflineIndicator />);
    
    // Should show offline message when offline
    expect(getByText(/Offline Mode/i)).toBeTruthy();
  });

  it('should show offline icon when offline', () => {
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({
      isOnline: false,
    });

    const { getByText } = render(<OfflineIndicator />);
    
    // Should include offline emoji/icon
    expect(getByText(/📵/)).toBeTruthy();
  });

  it('should display offline text when offline', () => {
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({
      isOnline: false,
    });

    const { getByText } = render(<OfflineIndicator />);
    
    // Should display "Offline Mode" text (with emoji)
    expect(getByText(/📵 Offline Mode/)).toBeTruthy();
  });

  it('should render null when online (performance)', () => {
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({
      isOnline: true,
    });

    const { toJSON } = render(<OfflineIndicator />);
    
    // Should render null (nothing) when online
    expect(toJSON()).toBeNull();
  });

  it('should update when network status changes', () => {
    const mockStore = { isOnline: true };
    (useOfflineStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { queryByText, rerender } = render(<OfflineIndicator />);
    
    // Initially online - no indicator
    expect(queryByText(/Offline Mode/i)).toBeNull();

    // Simulate going offline
    mockStore.isOnline = false;
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({ isOnline: false });
    
    rerender(<OfflineIndicator />);
    
    // Should now show offline indicator
    expect(queryByText(/Offline Mode/i)).toBeTruthy();
  });
});

