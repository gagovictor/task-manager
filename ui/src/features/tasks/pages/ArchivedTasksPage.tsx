import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTasksAsync, createTaskAsync, updateTaskAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';
import { CircularProgress, Typography, Alert, Fab, Container, Snackbar } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { Task } from '../models/task';

export default function ArchivedTasksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, fetchStatus, fetchError } = useSelector((state: RootState) => state.tasks);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Snackbar state
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
    <Container sx={{ width: '100%', minHeight: '100vh', padding: 8, position: 'relative' }}>
      {fetchStatus === 'loading' && <CircularProgress />}
      {fetchStatus === 'failed' && <Alert severity="error">{fetchError}</Alert>}
      {fetchStatus === 'succeeded' && (
        <Masonry columns={3} spacing={2}>
          {activeTasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => handleEditTask(task)}
              showSnackbar={showSnackbar}
            />
          ))}
          <Box
            sx={{
              width: 300,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed grey',
              borderRadius: 1,
              backgroundColor: '#f0f0f0',
              cursor: 'pointer'
            }}
            onClick={() => setCreateModalOpen(true)}
          >
            <Typography variant="h6">Create New Task</Typography>
          </Box>
        </Masonry>
      )}
      {status === 'idle' && <Typography>No tasks available</Typography>}

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
