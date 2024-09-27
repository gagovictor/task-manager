import { createTheme, Theme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark'): Theme => createTheme({
  spacing: 8,
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
          backgroundColor: mode === 'dark' ? '#333' : '#444E5E',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            '& input:-webkit-autofill': {
              '-webkit-box-shadow': `0 0 0 100px ${mode === 'dark' ? '#55504E' : '#EDF5FF'} inset !important`,
            },
            ':has(> input:-webkit-autofill)': {
              backgroundColor: mode === 'dark' ? '#55504E' : '#EDF5FF',
            }
          },
        },
      }
    }
  },
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#EDF5FF' : '#39588A',
      contrastText: mode === 'dark' ? '#39588A' : '#EDF5FF',
    },
    secondary: {
      main: mode === 'dark' ? '#FFF1EB' : '#E0672F',
      contrastText: mode === 'dark' ? '#55504E' : '#FFF1EB',
    },
    background: {
      default: mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
      paper: mode === 'dark' ? '#121212' : '#F7F6F6',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#212121',
      secondary: mode === 'dark' ? '#e0e0e0' : '#757575',
    },
    info: {
      main: '#3269C2',
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

export default getTheme;
