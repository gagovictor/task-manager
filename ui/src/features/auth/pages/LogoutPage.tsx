import { Container, Typography } from '@mui/material';

export default function LogoutPage() {
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
            <Typography variant="h6" align="center" gutterBottom>
                You are being logged out.
            </Typography>
            <Typography variant="body1" align="center">
                Please wait while we log you out and redirect you to the homepage.
            </Typography>
        </Container>
    );
}
