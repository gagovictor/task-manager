import { createTheme, Theme } from '@mui/material/styles';

// Define a color palette for both light and dark modes
const palette = {
  light: {
    primary: {
      main: '#39588A',
      contrastText: '#EDF5FF',
    },
    secondary: {
      main: '#E0672F',
      contrastText: '#FFF1EB',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F7F6F6',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    info: {
      main: '#3269C2',
    },
    snackbar: {
      background: '#444E5E',
    },
    textField: {
      autofillBackground: '#EDF5FF',
    },
  },
  dark: {
    primary: {
      main: '#EDF5FF',
      contrastText: '#39588A',
    },
    secondary: {
      main: '#FFF1EB',
      contrastText: '#55504E',
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
      autofillBackground: '#55504E',
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
  const pwaBackgroundColor = mode === 'light' ?
    currentPalette.primary.main :
    '#272727'; // Toolbar background color in dark mode

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
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: '98% !important',
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
