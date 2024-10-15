import { Container } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import ResetPasswordForm from '../components/ResetPasswordForm';

export default function ResetPasswordPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(logout());
    }, [dispatch]);

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                paddingTop: 8,
                paddingBottom: 8,
            }}
        >
            <ResetPasswordForm />
        </Container>
    );
}
