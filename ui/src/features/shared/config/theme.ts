import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: 8,
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: '32px 16px',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  shape: {
    borderRadius: 6,
  },
});

export default theme;
