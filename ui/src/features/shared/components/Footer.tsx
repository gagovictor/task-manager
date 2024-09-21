import React from 'react';
import { Toolbar, Typography, Link, IconButton, Container, Box, useTheme, AppBar } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {

  const theme = useTheme();
  
  return (
    <AppBar position="relative" elevation={0}>
      <Toolbar component="footer" sx={{ backgroundColor: theme.palette.background.paper }}>
        <Container 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: 'center',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ marginBottom: { xs: '10px', sm: '0' }, width: { xs: '100%', sm: 'auto' } }}
          >
            &copy; 2024 Gago.Works. All rights reserved.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Link
              href="https://gago.works"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Gago.Works"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                marginRight: '10px' 
              }}
            >
              <IconButton color="inherit">
                <LinkIcon />
              </IconButton>
              Gago.Works
            </Link>
            <Link
              href="https://github.com/gagovictor"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit GitHub profile"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none'
              }}
            >
              <IconButton color="inherit">
                <GitHubIcon />
              </IconButton>
              GitHub
            </Link>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
