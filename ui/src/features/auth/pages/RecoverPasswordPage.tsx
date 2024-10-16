import { Container } from '@mui/material';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import RecoverPasswordForm from '../components/RecoverPasswordForm';

export default function RecoverPasswordPage() {
    const dispatch = useDispatch();
    
    // Landing on the log in screen should clear user data from application.
    dispatch(logout());

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
            <RecoverPasswordForm/>
        </Container>
    );
}
