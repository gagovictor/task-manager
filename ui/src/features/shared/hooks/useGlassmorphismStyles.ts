import { useTheme } from '@mui/material/styles';

export const useGlassmorphismStyles = ({ blur = 10, opacity = 0.1 } = {}) => {
  const theme = useTheme();
  return {
    backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 30px rgba(0, 0, 0, 0.1)'
      : '0 4px 30px rgba(255, 255, 255, 0.1)',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      borderColor: theme.palette.secondary.main,
      boxShadow: `0 0 4px ${theme.palette.secondary.main}`,
    },
    transition: 'all .15s ease-in-out',
  };
};
