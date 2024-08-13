import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { signupUser } from '../redux/authSlice';
import { Button, TextField, Container, Typography, Paper, Box, Snackbar, Alert } from '@mui/material';
import { SignupRequest } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const SignupForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // State for form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Error message to display
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authStatus = useSelector((state: RootState) => state.auth.status);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null); // Reset error message on form submit

    // Copy email to username
    const username = email;

    try {
      const request: SignupRequest = { username, email, password };
      await dispatch(signupUser(request)).unwrap();
      navigate('/tasks'); // Redirect on successful registration
    } catch (error) {
      console.error('Signup failed', error);
      setErrorMessage('Signup failed. Please check your details.');
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
            Sign Up
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Sign Up
            </Button>
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

export default SignupForm;
