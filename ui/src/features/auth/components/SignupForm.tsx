import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { signupUser } from '../redux/authSlice';
import { Button, TextField, Container, Typography, Paper, Box, Snackbar, Alert } from '@mui/material';
import { SignupRequest } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import PasswordField from './PasswordField';

const SignupForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const authStatus = useSelector((state: RootState) => state.auth.status);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    // Check if passwords match before proceeding
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setSnackbarOpen(true);
      return;
    }

    try {
      // User does not input username directly. Instead, copy email to username
      const request: SignupRequest = { username: email, email, password };
      await dispatch(signupUser(request)).unwrap();
      navigate('/tasks');
    } catch (error) {
      setErrorMessage('Signup failed. Please check your details.');
      setSnackbarOpen(true);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : '');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordError(newConfirmPassword && newConfirmPassword !== password ? 'Passwords do not match' : '');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const isFormInvalid = () => {
    return !email || !password || !confirmPassword || password !== confirmPassword;
  };

  return (
    <Container maxWidth="xs">
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
              inputProps={{ "data-testid": "input-email" }}
            />
            <PasswordField
              value={password}
              onChange={handlePasswordChange}
              label="Password"
              id="password"
              required
              testId="input-password"
            />
            <PasswordField
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              label="Confirm password"
              id="confirm-password"
              required
              error={!!passwordError}
              helperText={passwordError}
              testId="input-confirm-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={authStatus === 'loading' || isFormInvalid()}
              data-testid="submit"
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
        data-testid="snackbar"
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: '100%' }}
          data-testid="alert">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignupForm;
