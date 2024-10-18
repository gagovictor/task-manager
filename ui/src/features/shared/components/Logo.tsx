// src/components/Logo.tsx
import React from 'react';
import { Typography, useTheme } from '@mui/material';

interface LogoProps {
  isLoading: boolean;
  onClick: () => void;
}

const Logo: React.FC<LogoProps> = ({ isLoading, onClick }) => {
  const theme = useTheme();

  return (
    <Typography
      variant="h6"
      component="div"
      onClick={onClick}
      sx={{
        fontFamily: '"Uncial Antiqua", cursive',
        cursor: 'pointer',
        fontSize: '28px',
        letterSpacing: '0.020em',
        textAlign: 'center',
        background: `linear-gradient(-60deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main}, ${theme.palette.primary.main})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '200% 100%',
        animation: isLoading
          ? 'gradientAnimation 1s infinite linear'
          : 'none',
        '@keyframes gradientAnimation': {
          '0%': {
            backgroundPosition: '200% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      }}
    >
      zooit
    </Typography>
  );
};

export default Logo;
