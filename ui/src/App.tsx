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

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            
            <Route element={<AuthGuard />}>
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/archived" element={<ArchivedTasksPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
