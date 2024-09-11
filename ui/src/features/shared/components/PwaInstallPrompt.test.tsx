// PwaInstallPrompt.test.tsx
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PwaInstallPrompt from './PwaInstallPrompt';
import '@testing-library/jest-dom/extend-expect';

describe('PwaInstallPrompt', () => {
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;

  beforeEach(() => {
    // Save the original methods
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    // Mock the methods
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    // Restore the original methods
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it('should display Snackbar when beforeinstallprompt event is fired', () => {
    // Mock the event
    const mockEvent = {
      preventDefault: jest.fn(),
    };

    // Mock addEventListener to call handler immediately
    (window.addEventListener as jest.Mock).mockImplementation((event, handler) => {
      if (event === 'beforeinstallprompt') {
        handler(mockEvent);
      }
    });

    render(<PwaInstallPrompt />);

    // Trigger the beforeinstallprompt event
    window.dispatchEvent(new Event('beforeinstallprompt'));

    // Check if Snackbar is displayed
    expect(screen.getByText('Install this app on your device for a better experience!')).toBeInTheDocument();
  });

  it('should close Snackbar when the close button is clicked', async () => {
    // Mock the event
    const mockEvent = {
      preventDefault: jest.fn(),
    };

    // Mock addEventListener to call handler immediately
    (window.addEventListener as jest.Mock).mockImplementation((event, handler) => {
      if (event === 'beforeinstallprompt') {
        handler(mockEvent);
      }
    });

    render(<PwaInstallPrompt />);

    // Trigger the beforeinstallprompt event
    window.dispatchEvent(new Event('beforeinstallprompt'));

    // Click the install button
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /install/i }));
    });

    // Wait for Snackbar to be closed
    await waitFor(() => {
      expect(screen.queryByText('Install this app on your device for a better experience!')).not.toBeInTheDocument();
    });
  });

  it('should call deferredPrompt.prompt and handle userChoice correctly', async () => {
    const mockPrompt = jest.fn();
    const mockUserChoice = Promise.resolve({ outcome: 'accepted' });

    // Create a mock event with prompt and userChoice
    const mockEvent = {
      preventDefault: jest.fn(),
      prompt: mockPrompt,
      userChoice: mockUserChoice,
    };

    // Mock addEventListener to call handler immediately
    (window.addEventListener as jest.Mock).mockImplementation((event, handler) => {
      if (event === 'beforeinstallprompt') {
        handler(mockEvent);
      }
    });

    render(<PwaInstallPrompt />);

    // Trigger the beforeinstallprompt event
    window.dispatchEvent(new Event('beforeinstallprompt'));

    // Click the install button
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /install/i }));
    });

    // Wait for prompt to be called
    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalled();
    });
  });
});
