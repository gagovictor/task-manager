import { useState, useEffect } from 'react';
import { Button, Snackbar, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Snackbar
        open={open}
        color="primary"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Install this app on your device for a better experience."
        action={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={handleInstallClick}
              disabled={installing}
            >
              {installing ? 'Installing...' : 'Install'}
            </Button>
            <Button
              variant="text"
              color="secondary"
              onClick={handleClose}
              disabled={installing}
            >
              Dismiss
            </Button>
          </Box>
        }
      />
    </div>
  );
};

export default PwaInstallPrompt;
