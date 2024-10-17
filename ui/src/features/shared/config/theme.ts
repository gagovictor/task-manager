import { createTheme, Theme } from '@mui/material/styles';

// Define a color palette for both light and dark modes
const palette = {
  light: {
    primary: {
      main: '#45289a',
      contrastText: '#dfe8f0',
    },
    secondary: {
      main: '#1C6575',
      contrastText: '#C2FFC6',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F7F6F6',
    },
    text: {
      primary: '#111122',
      secondary: '#435160',
    },
    info: {
      main: '#3269C2',
    },
    snackbar: {
      background: '#444E5E',
    },
    textField: {
      autofillBackground: '#dfe8f0',
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
      background: '#333',
    },
    textField: {
      autofillBackground: '#1C6575',
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
  const pwaBackgroundColor =
    mode === 'light' ? currentPalette.primary.main : '#272727'; // Toolbar background color in dark mode

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
            backgroundColor: 'transparent !important', // Make container background transparent
          },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: currentPalette.snackbar.background,
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
              ':has(> input:-webkit-autofill)': {
                backgroundColor: currentPalette.textField.autofillBackground,
              },
            },
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
    },
    shape: {
      borderRadius: 6,
    },
  });
};

export default getTheme;
