import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      setInstalling(true);
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
        setOpen(false);
        setInstalling(false);
      });
    }
  };

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
            onClose={handleCloseSnackbar}
            severity="info"
            action={
            <Button color="inherit" onClick={handleInstallClick} disabled={installing}>
                Install
            </Button>
            }
        >
          Install this app on your device for a better experience!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PwaInstallPrompt;
