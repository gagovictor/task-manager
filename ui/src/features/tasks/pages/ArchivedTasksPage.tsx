import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchTasksAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';
import { CircularProgress, Typography, Alert, Fab, Container, Snackbar, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { Task } from '../models/task';
import { useNavigate } from 'react-router-dom';

export default function ArchivedTasksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tasks, fetchStatus, fetchError } = useSelector((state: RootState) => state.tasks);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    dispatch(fetchTasksAsync());
  }, [dispatch]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const activeTasks = tasks.filter((task: Task) => task.archivedAt && !task.deletedAt);

  return (
    <Container sx={{ width: '100%', minHeight: '100vh', padding: 16, position: 'relative' }}>
      {fetchStatus === 'loading' && <CircularProgress />}
      {fetchStatus === 'failed' &&
        <Alert
          severity="error"
          data-testid="fetch-error-alert"
        >
          {fetchError}
        </Alert>
      }
      {fetchStatus === 'succeeded' && activeTasks.length > 0 && (
        <Masonry columns={3} spacing={2}>
          {activeTasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => handleEditTask(task)}
              showSnackbar={showSnackbar}
            />
          ))}
        </Masonry>
      )}
      {fetchStatus === 'succeeded' && activeTasks.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 64px)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>No archived tasks available</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/tasks')}>
            Back to tasks
          </Button>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {selectedTask && (
        <EditTaskModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          task={selectedTask}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
