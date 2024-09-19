import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchTasksAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';
import { CircularProgress, Typography, Alert, Fab, Container, Snackbar, Button, TextField, MenuItem, Select, FormControl, InputLabel, Card, useTheme, IconButton, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { Task, taskStatuses } from '../models/task';
import ClearIcon from '@mui/icons-material/Clear';

const TasksPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, fetchStatus, fetchError } = useSelector((state: RootState) => state.tasks);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarUndoAction, setSnackbarUndoAction] = useState<(() => void) | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterText, setFilterText] = useState<string>('');
  const theme = useTheme();
  
  useEffect(() => {
    dispatch(fetchTasksAsync());
  }, [dispatch]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const showSnackbar = (message: string, severity: 'success' | 'error', undoAction?: () => void) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    setSnackbarUndoAction(() => undoAction);
  };

  const handleSnackbarAction = () => {
    if (snackbarUndoAction) {
      snackbarUndoAction();
    }
  };

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesStatus = filterStatus ? task.status === filterStatus : task.status !== 'removed'; // Removed tasks are hidden by default
    const matchesText = filterText ? 
      task.title.toLowerCase().includes(filterText.toLowerCase()) || 
      task.description.toLowerCase().includes(filterText.toLowerCase()) 
      : true;
    return !task.archivedAt && !task.deletedAt && matchesStatus && matchesText;
  });

  const handleClearStatus = () => setFilterStatus('');
  const handleClearSearch = () => setFilterText('');
  
  return (
    <Container
      sx={{
        width: '100%',
        minHeight: 'calc(100vh - 296px)',
        mt: { sm: 4, md: 12 },
        mb: { sm: 6, md: 12 },
        position: 'relative'
      }}>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { sm: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            flexDirection: { sm: 'column', md: 'row' }
          }}
        >
          {/* Status Filter */}
          <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as string)}
                label="Status"
                endAdornment={filterStatus && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear status filter"
                      size="small"
                      edge="end"
                      sx={{ marginRight: '8px' }}
                      onClick={handleClearStatus}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )}
              >
                <MenuItem value="">All</MenuItem>
                {taskStatuses.map((statusOption) => (
                  <MenuItem key={statusOption} value={statusOption}>
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Search Filter */}
          <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <TextField
              fullWidth
              margin="normal"
              label="Search"
              variant="outlined"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              InputProps={{
                endAdornment: filterText && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      size="small"
                      edge="end"
                      onClick={handleClearSearch}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Task Cards and Loading/Error Handling */}
      {fetchStatus === 'loading' && <CircularProgress />}
      {fetchStatus === 'failed' &&
        <Alert
          severity="error"
          data-testid="fetch-error-alert"
        >
          {fetchError}
        </Alert>
      }
      {fetchStatus === 'succeeded' && filteredTasks.length == 0 && (
        <Alert severity="info" sx={{ mb: 4, flex: 1 }}>
          No tasks match the filter criteria.
        </Alert>
      )}
      {fetchStatus === 'succeeded' && (
        <Masonry
          columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}
          spacing={2}
          data-testid="masonry"
        >
          {filteredTasks.length > 0 && (
            filteredTasks.map((task: Task) => (
              <Box
                data-testid="task-card"
                key={task.id}>
                <TaskCard
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  showSnackbar={showSnackbar}
                />
              </Box>
            ))
          )}
          <Card
            variant="outlined"
            sx={{
              width: 300,
              height: 198,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed grey',
              backgroundColor: theme.palette.background.paper,
              cursor: 'pointer'
            }}
            onClick={() => setCreateModalOpen(true)}
          >
            <Typography variant="h6">
              Create New Task
            </Typography>
          </Card>
        </Masonry>
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
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          action={
            snackbarUndoAction && (
              <Button color="inherit" onClick={handleSnackbarAction}>
                Undo
              </Button>
            )
          }>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TasksPage;
