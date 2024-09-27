import { Container } from '@mui/material';
import LoginForm from '../components/LoginForm';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

export default function LoginPage() {
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
                minHeight: 'calc(100vh - 64px)',
                paddingTop: 8,
                paddingBottom: 8,
            }}
        >
            <LoginForm/>
        </Container>
    );
}
