import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: 8,
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingBottom: '32px',
          '@media (min-width:0px)': {  // xs breakpoint
            paddingTop: 'calc(32px + 56px)',
          },
          '@media (min-width:600px)': {  // sm breakpoint
            paddingTop: 'calc(32px + 64px)',
          },
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#444E5E'
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#39588A',
      contrastText: '#EDF5FF'
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
    info: {
      main: '#3269C2'
    }
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
