import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTasksAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';
import { Typography, Alert, Fab, Container, Snackbar, Button, Grow } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Task } from '../models/task';
import { useNavigate } from 'react-router-dom';
import TaskModal from '../components/TaskModal';
import { FetchTasksParams } from '../models/api';
import PullToRefresh from '../../shared/components/PullToRefresh';
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh';

export default function ArchivedTasksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tasks, fetchStatus, fetchError } = useSelector((state: RootState) => state.tasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [fetchParams, setFetchParams] = useState<FetchTasksParams>({
    page: 1,
    limit: 20,
    filters: {
      archived: true
    }
  });

  useEffect(() => {
    dispatch(fetchTasksAsync(fetchParams));
  }, [fetchParams]);

  const fetchTasks = async () => {
    await dispatch(fetchTasksAsync(fetchParams));
  }

  useAutoRefresh({
    onRefresh: fetchTasks,
    interval: 60000,
    immediate: false,
    onlyWhenFocused: true
  });
  
  const handleCreateTask = () => {
    setEditMode(false);
    setModalOpen(true);
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditMode(true);
    setModalOpen(true);
  };

  const onCloseTaskModal = () => {
    setEditMode(false);
    setModalOpen(false);
  }

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const filteredTasks = tasks.filter((task: Task) => task.archivedAt && !task.deletedAt);

  return (
    <PullToRefresh onRefresh={fetchTasks}>
      <Container
        sx={{
          width: '100%',
          minHeight: 'calc(100vh - 64px)', // full screen height minus footer
          paddingTop: { xs: 'calc(32px + 56px)', md: 'calc(32px + 64px)' }, // Offset fixed app bar/header
          position: 'relative',
          paddingBottom: '32px',
        }}
      >
        {fetchStatus === 'failed' &&
          <Alert
            severity="error"
            data-testid="fetch-error-alert"
          >
            {fetchError}
          </Alert>
        }
        {(fetchStatus === 'succeeded' || filteredTasks.length > 0) && (
          <Masonry
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
            spacing={2}
            data-testid="masonry"
          >
            {filteredTasks.map((task: Task, index: number) => (
              <Grow
                key={task.id}
                in={true}
                timeout={(index + 1) * 300} // Staggered delay for animation
              >
                <Box data-testid="task-card">
                  <TaskCard
                    task={task}
                    onEdit={() => handleEditTask(task)}
                    showSnackbar={showSnackbar}
                  />
                </Box>
              </Grow>
            ))}
          </Masonry>
        )}
        {fetchStatus === 'succeeded' && filteredTasks.length === 0 && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>No tasks archived</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/tasks')}>
              Back to tasks
            </Button>
          </Box>
        )}

        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateTask}
        >
          <AddIcon />
        </Fab>

        <TaskModal
          open={modalOpen}
          onClose={onCloseTaskModal}
          task={selectedTask}
          mode={editMode ? 'edit' : 'create'}
        />

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
    </PullToRefresh>
  );
}
