import { createTheme, Theme } from '@mui/material/styles';

// Define a color palette for both light and dark modes
const palette = {
  dark: {
    primary: {
      main: '#dae9f7', // Adjusted halfway in saturation
      contrastText: '#45289a',
    },
    secondary: {
      main: '#C2FFC6',
      contrastText: '#1C6575',
    },
    background: {
      default: '#1e1e1e',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
    },
    info: {
      main: '#dae9f7',
    },
    success: {
      main: '#C2FFC6',
    },
    warning: {
      main: '#ffb74d',
      contrastText: '#1e1e1e',
    },
    error: {
      main: '#e57373',
      contrastText: '#1e1e1e',
    },
    snackbar: {
      background: '#444E5E',
      textColor: '#ffffff',
    },
    textField: {
      autofillBackground: '#444E5E',
    },
  },
  light: {
    primary: {
      main: '#3a5683', // Derived from dark primary, adjusted for light mode
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#77a6f7', // Derived from dark secondary, adjusted for light mode
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5f6368',
    },
    info: {
      main: '#3a5683', // Same as primary.main
    },
    success: {
      main: '#77a6f7', // Same as secondary.main
    },
    warning: {
      main: '#ff9800',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336',
      contrastText: '#ffffff',
    },
    snackbar: {
      background: '#323f4b',
      textColor: '#ffffff',
    },
    textField: {
      autofillBackground: '#e3f2fd',
    },
  },
};

export const getTheme = (mode: 'light' | 'dark'): Theme => {
  const currentPalette = palette[mode];

  // Dynamically update the theme-color and background-color meta tags
  const setMetaTag = (name: string, content: string) => {
    let element = document.querySelector(`meta[name="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Set PWA background color based on the theme mode
  const pwaBackgroundColor = currentPalette.background.default;

  setMetaTag('theme-color', pwaBackgroundColor);
  setMetaTag('background-color', pwaBackgroundColor);

  // Return the MUI theme configuration
  return createTheme({
    spacing: 8,
    palette: {
      mode,
      primary: currentPalette.primary,
      secondary: currentPalette.secondary,
      background: {
        default: currentPalette.background.default,
        paper: currentPalette.background.paper,
      },
      text: currentPalette.text,
      info: currentPalette.info,
      success: currentPalette.success,
      warning: currentPalette.warning,
      error: currentPalette.error,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Global Box styling
            '& .MuiBox-root': {
              backgroundColor: 'transparent !important',
            },
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: '98% !important',
            backgroundColor: 'transparent', // Use palette instead of hardcoding
          },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: currentPalette.snackbar.background,
            color: currentPalette.snackbar.textColor,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              '& input:-webkit-autofill': {
                '-webkit-box-shadow': `0 0 0 100px ${currentPalette.textField.autofillBackground} inset !important`,
              },
            },
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: `${currentPalette.background.default}80`,
            backdropFilter: 'blur(10px)',
            transition: 'all .5s ease-in-out',
          },
        },
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      button: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 500,
      },
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      body1: {
        fontWeight: 400,
      },
      body2: {
        fontWeight: 400,
      },
    },
    shape: {
      borderRadius: 6,
    },
  });
};

export default getTheme;
