// src/components/Header.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
} from '@mui/material';
import Sidebar from './Sidebar';
import { RootState } from '../../../redux/store';
import { logout } from '../../../features/auth/redux/authSlice';
import Logout from '@mui/icons-material/Logout';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const username = useSelector((state: RootState) => state.auth.user?.username);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLoading = useSelector((state: RootState) => state.loading.activeRequests > 0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/logout');
    handleMenuClose();
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1, zIndex: 999 }}>
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.mode === 'dark' ?
            `linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0))` :
            `linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))`,
          boxShadow: 'none',
          color: theme.palette.text.primary,
          // backdropFilter: 'blur(4px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          {/* Left Side Placeholder */}
          <Box sx={{ width: 100, display: 'flex', alignItems: 'center' }}>
            <Sidebar />
          </Box>

          {/* Centered Logo */}
          <Logo isLoading={isLoading} onClick={handleLogoClick} />

          {/* Right Side Placeholder */}
          <Box
            sx={{
              width: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {isLoading && (
              <CircularProgress color="inherit" size={24} sx={{ marginRight: 2 }} />
            )}

            {!isMobile &&
              (isAuthenticated ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleAvatarClick}
                      size="small"
                      sx={{ ml: 2 }}
                      aria-controls={open ? 'account-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? 'true' : undefined}
                    >
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {username ? username.charAt(0).toUpperCase() : ''}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                    <MenuItem>
                      <ThemeToggle />
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button
                  color="inherit"
                  sx={{ fontWeight: '400' }}
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
              ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
