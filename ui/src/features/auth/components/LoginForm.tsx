import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { loginUser } from '../redux/authSlice';
import { Button, TextField, Container, Typography, Paper, Box, Snackbar, Alert, Link } from '@mui/material';
import { LoginRequest } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authStatus = useSelector((state: RootState) => state.auth.status);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const request: LoginRequest = { username, password };
      await dispatch(loginUser(request)).unwrap();
      navigate('/tasks');
    } catch (error) {
      console.error('Login failed', error);
      setErrorMessage('Login failed. Please check your username and password.');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="xs">
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
              inputProps={{ "data-testid": "input-username" }}
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
              inputProps={{ "data-testid": "input-password" }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={authStatus === 'loading'}
              data-testid="submit"
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginForm;
