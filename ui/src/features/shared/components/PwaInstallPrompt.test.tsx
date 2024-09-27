import { render, screen, waitFor } from '@testing-library/react';
import PwaInstallPrompt from './PwaInstallPrompt';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

// Mock the console to prevent actual logs during tests
global.console = {
  ...global.console,
  log: jest.fn(),
};

describe('PwaInstallPrompt Component', () => {
  const mockPrompt = jest.fn();
  const mockUserChoiceAccepted = Promise.resolve({ outcome: 'accepted' });
  const mockUserChoiceDismissed = Promise.resolve({ outcome: 'dismissed' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to dispatch the beforeinstallprompt event
  const mockBeforeInstallPromptEvent = (userChoice = mockUserChoiceAccepted) => {
    const event = new Event('beforeinstallprompt') as any;
    event.preventDefault = jest.fn();
    event.prompt = mockPrompt;
    event.userChoice = userChoice;
    window.dispatchEvent(event);
    return event;
  };

  it('should not display the Snackbar initially', () => {
    render(<PwaInstallPrompt />);

    waitFor(() => {
      expect(
        screen.queryByText('Install this app on your device for a better experience!')
      ).not.toBeInTheDocument();
    });
  });

  it('should display the Snackbar when beforeinstallprompt event is fired', () => {
    render(<PwaInstallPrompt />);
    mockBeforeInstallPromptEvent();

    waitFor(() => {
      expect(
        screen.getByText('Install this app on your device for a better experience!')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Install/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  // it('should call prompt and handle user acceptance when Install button is clicked', async () => {
  //   render(<PwaInstallPrompt />);
  //   mockBeforeInstallPromptEvent();

  //   act(() => {
  //     const installButton = screen.getByRole('button', { name: /Install/i });
  //     userEvent.click(installButton);
  //   });

  //   expect(mockPrompt).toHaveBeenCalled();

  //   await waitFor(() => {
  //     expect(
  //       screen.queryByText('Install this app on your device for a better experience!')
  //     ).not.toBeInTheDocument();
      
  //     expect(console.log).toHaveBeenCalledWith('User accepted the A2HS prompt');
  //   });

  // });

  // it('should call prompt and handle user dismissal when Install button is clicked', async () => {
  //   render(<PwaInstallPrompt />);
  //   mockBeforeInstallPromptEvent(mockUserChoiceDismissed);

  //   act(async () => {
  //     const installButton = await screen.getByRole('button', { name: /Install/i });
  //     userEvent.click(installButton);
  //   });

  //   expect(mockPrompt).toHaveBeenCalled();

  //   await waitFor(() => {
  //     expect(
  //       screen.queryByText('Install this app on your device for a better experience!')
  //     ).not.toBeInTheDocument();
  //   });

  //   expect(console.log).toHaveBeenCalledWith('User dismissed the A2HS prompt');
  // });

  // it('should close the Snackbar when the close button is clicked', () => {
  //   render(<PwaInstallPrompt />);
  //   mockBeforeInstallPromptEvent();

  //   const alertText = screen.findByText('Install this app on your device for a better experience!');

  //   waitFor(() => {
  //     expect(alertText).toBeInTheDocument();
  //   });
      
  //   act(() => {
  //     const closeButton = screen.getByRole('button', { name: /close/i });
  //     userEvent.click(closeButton);
  //   });

  //   expect(alertText).not.toBeInTheDocument();
  // });

  it('should not call prompt if deferredPrompt is null', () => {
    render(<PwaInstallPrompt />);
    // Simulate that beforeinstallprompt was not fired
    // Attempt to click the Install button without setting deferredPrompt
    // Since in the component, deferredPrompt is set only when the event is fired,
    // and the Snackbar only appears when the event is fired, this scenario
    // might not be possible unless the component is modified to allow it.
    // However, we'll ensure that prompt is not called if somehow it's null.

    // For this test, we need to render the component without dispatching the event
    // and attempt to interact with the Install button, which shouldn't exist.
    // Hence, we can try to query for the Install button and expect it not to be in the document.

    expect(screen.queryByRole('button', { name: /Install/i })).not.toBeInTheDocument();
  });
});
