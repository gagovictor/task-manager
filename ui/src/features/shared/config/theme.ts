import { createTheme, Theme } from '@mui/material/styles';

// Define a color palette for both light and dark modes
const palette = {
  light: {
    primary: {
      main: '#5584ac', // Inverted with secondary color
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6a4fbf', // Inverted with primary color
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f8', // Softer background to reduce stark contrast
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a', // Darker text for better readability
      secondary: '#5f6368',
    },
    info: {
      main: '#0288d1',
    },
    snackbar: {
      background: '#323f4b',
      textColor: '#ffffff',
    },
    textField: {
      autofillBackground: '#e3f2fd', // Softer blue to match the theme
    },
  },
  dark: {
    primary: {
      main: '#dfe8f0',
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
      main: '#3269C2',
    },
    snackbar: {
      background: '#444E5E',
      textColor: '#fff',
    },
    textField: {
      autofillBackground: '#444E5E', // Adjusted for better contrast
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
