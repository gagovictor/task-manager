import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from './features/shared/components/Header';
import Footer from './features/shared/components/Footer';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import LogoutPage from './features/auth/pages/LogoutPage';
import TasksPage from './features/tasks/pages/TasksPage';
import ArchivedTasksPage from './features/tasks/pages/ArchivedTasksPage';
import AuthGuard from './features/shared/components/AuthGuard';
import TaskBoardPage from './features/tasks/pages/TaskBoardPage';
import PwaInstallPrompt from './features/shared/components/PwaInstallPrompt';
import { Box, ThemeProvider, useMediaQuery } from '@mui/material';
import { RootState } from './redux/store';
import { useSelector } from 'react-redux';
import getTheme from './features/shared/config/theme';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { enUS } from 'date-fns/locale/en-US';

function App() {
  const mode = useSelector((state: RootState) => state.preferences.theme);
  const theme = getTheme(mode);
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
        <ThemeProvider theme={theme}>
          <div className="App">
            <Header />
            <main>
              <Box sx={{ backgroundColor: theme.palette.background.default }}>
                <Routes>
                  <Route path="/" element={<TasksPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/logout" element={<LogoutPage />} />

                  <Route element={<AuthGuard />}>
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/archived" element={<ArchivedTasksPage />} />
                    <Route path="/board" element={<TaskBoardPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
              </Box>
            </main>

            {isSmUp && <Footer />}

            <PwaInstallPrompt />
          </div>
        </ThemeProvider>
      </LocalizationProvider>
    </BrowserRouter>
  );
}

export default App;
