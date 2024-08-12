import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { loginUser } from '../redux/authSlice';
import { Button, TextField, Container, Typography, Paper, Box, Snackbar, Alert, Link } from '@mui/material';
import { LoginRequest } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // State for form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Error message to display
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get auth status and error from the store
  const authStatus = useSelector((state: RootState) => state.auth.status);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null); // Reset error message on form submit

    try {
      const request: LoginRequest = { username, password };
      await dispatch(loginUser(request)).unwrap();
      navigate('/tasks'); // Redirect on successful login
    } catch (error) {
      console.error('Login failed', error);
      setErrorMessage('Login failed. Please check your username and password.');
      setSnackbarOpen(true); // Open the Snackbar on error
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={authStatus === 'loading'}
            >
              {authStatus === 'loading' ? 'Logging in...' : 'Login'}
            </Button>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" align="center">
                Don't have an account?{' '}
                <Link href="/signup" variant="body2">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginForm;
