import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { recoverPassword } from '../redux/authSlice';
import { AppDispatch } from '../../../redux/store';

const RecoverPasswordForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await dispatch(recoverPassword({ email })).unwrap();
            setSnackbarMessage("If an account is associated with this email, you'll receive a message with instructions to reset your password.");
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('An error occurred. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };
    
    return (
        <Box sx={{ width: '400px', maxWidth: '100%' }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Recover Password
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email Address"
                        fullWidth
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Send Reset Link
                    </Button>
                </form>
            </Paper>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                data-testid="snackbar"
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RecoverPasswordForm;
