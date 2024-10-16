import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Paper, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../redux/authSlice';
import { AppDispatch } from '../../../redux/store';
import PasswordField from './PasswordField';

const ResetPasswordForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(
      confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''
    );
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordError(
      newConfirmPassword && newConfirmPassword !== password ? 'Passwords do not match' : ''
    );
  };

  const isFormInvalid = () => {
    return !password || !confirmPassword || password !== confirmPassword;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setErrorMessage('Invalid or missing token.');
      setSnackbarOpen(true);
      return;
    }

    if (isFormInvalid()) {
      setErrorMessage('Please fix the errors before submitting.');
      setSnackbarOpen(true);
      return;
    }

    try {
      await dispatch(resetPassword({ token, password })).unwrap();
      setErrorMessage(null);
      setSnackbarOpen(true);
      navigate('/login');
    } catch (error: any) {
      // Handle error
      const errMsg = error.message || 'An error occurred while resetting the password.';
      setErrorMessage(errMsg);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ width: '400px', maxWidth: '100%' }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <PasswordField
            value={password}
            onChange={handlePasswordChange}
            label="New Password"
            id="new-password"
            required
            testId="input-new-password"
          />
          <PasswordField
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            label="Confirm New Password"
            id="confirm-new-password"
            required
            error={!!passwordError}
            helperText={passwordError}
            testId="input-confirm-new-password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isFormInvalid()}
          >
            Reset Password
          </Button>
        </form>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        data-testid="snackbar"
      >
        <Alert
          severity={errorMessage ? 'error' : 'success'}
          onClose={handleCloseSnackbar}
          sx={{ width: '100%' }}
        >
          {errorMessage || 'Password has been reset!'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPasswordForm;
