import React from 'react';
import { Container } from '@mui/material';
import SignupForm from '../components/SignupForm';

export default function SignupPage() {
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
            <SignupForm />
        </Container>
    );
}
