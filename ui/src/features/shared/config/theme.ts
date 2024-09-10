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
      main: '#39588A',
    },
    secondary: {
      main: '#FFD0BB',
    },
    background: {
      default: '#ffffff',
      paper: '#fbf6f4',
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
