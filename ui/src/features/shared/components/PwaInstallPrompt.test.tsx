import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PwaInstallPrompt from './PwaInstallPrompt';
import '@testing-library/jest-dom/extend-expect';

describe('PwaInstallPrompt', () => {
  it('should placehold for other tests', () => {
    expect(true).toBeTruthy();
  });

  // let originalAddEventListener: typeof window.addEventListener;
  // let originalRemoveEventListener: typeof window.removeEventListener;

  // beforeEach(() => {
  //   originalAddEventListener = window.addEventListener;
  //   originalRemoveEventListener = window.removeEventListener;

  //   window.addEventListener = jest.fn();
  //   window.removeEventListener = jest.fn();
  // });

  // afterEach(() => {
  //   window.addEventListener = originalAddEventListener;
  //   window.removeEventListener = originalRemoveEventListener;
  // });

  // it('should display Snackbar when beforeinstallprompt event is fired', () => {
  //   const mockEvent = {
  //     preventDefault: jest.fn(),
  //   };

  //   (window.addEventListener as jest.Mock).mockImplementation((event, handler) => {
  //     if (event === 'beforeinstallprompt') {
  //       handler(mockEvent);
  //     }
  //   });

  //   render(<PwaInstallPrompt />);

  //   window.dispatchEvent(new Event('beforeinstallprompt'));

  //   expect(screen.getByText('Install this app on your device for a better experience!')).toBeInTheDocument();
  // });

  // it('should close Snackbar when the close button is clicked', async () => {
  //   // Mock the event
  //   const mockEvent = {
  //     preventDefault: jest.fn(),
  //   };

  //   (window.addEventListener as jest.Mock).mockImplementation((event, handler) => {
  //     if (event === 'beforeinstallprompt') {
  //       handler(mockEvent);
  //     }
  //   });

  //   render(<PwaInstallPrompt />);

  //   window.dispatchEvent(new Event('beforeinstallprompt'));

  //   await act(async () => {
  //     userEvent.click(screen.getByRole('button', { name: /install/i }));
  //   });

  //   await waitFor(() => {
  //     expect(screen.queryByText('Install this app on your device for a better experience!')).not.toBeInTheDocument();
  //   });
  // });

  // it('should call deferredPrompt.prompt and handle userChoice correctly', async () => {
  //   const mockPrompt = jest.fn();
  //   const mockUserChoice = Promise.resolve({ outcome: 'accepted' });

  //   const mockEvent = {
  //     preventDefault: jest.fn(),
  //     prompt: mockPrompt,
  //     userChoice: mockUserChoice,
  //   };

  //   (window.addEventListener as jest.Mock).mockImplementation((event, handler) => {
  //     if (event === 'beforeinstallprompt') {
  //       handler(mockEvent);
  //     }
  //   });

  //   render(<PwaInstallPrompt />);

  //   window.dispatchEvent(new Event('beforeinstallprompt'));

  //   await act(async () => {
  //     userEvent.click(screen.getByRole('button', { name: /install/i }));
  //   });

  //   await waitFor(() => {
  //     expect(mockPrompt).toHaveBeenCalled();
  //   });
  // });
});
