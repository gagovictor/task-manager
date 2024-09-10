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
      contrastText: '#EDF5FF '
      // contrastText: '#4e5155',
    },
    secondary: {
      main: '#FFD0BB',
      contrastText: '#55504e'
    },
    background: {
      default: '#FFFFFF',
      paper: '#FBF6F4',
      
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
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

export default theme;
