import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTasksAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';
import { Alert, Fab, Container, Snackbar, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, InputAdornment } from '@mui/material';
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

  const lowerCaseFilterText = filterText?.toLowerCase() || '';

  const filteredTasks = tasks
    .filter((task: Task) => {
      const matchesStatus = filterStatus ? task.status === filterStatus : task.status !== 'removed' && task.status !== 'completed'; // Removed or Completed tasks are hidden by default
      const matchesText = filterText ? 
        task.title.toLowerCase().includes(lowerCaseFilterText) || 
        task.description.toLowerCase().includes(lowerCaseFilterText) 
        : true;
      return !task.archivedAt && !task.deletedAt && matchesStatus && matchesText;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

  const handleClearStatus = () => setFilterStatus('');
  const handleClearSearch = () => setFilterText('');

  const handleEditModalClose = () => {
    setSelectedTask(null);
    setEditModalOpen(false);
  }
  
  return (
    <Container
      sx={{
        width: '100%',
        minHeight: 'calc(100vh - 64px)', // full screen height minus footer
        paddingTop: { xs: 'calc(32px + 56px)', md: 'calc(32px + 64px)' }, // Offset fixed app bar/header
        position: 'relative',
        paddingBottom: '32px',
      }}
    >
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

      {fetchStatus === 'failed' && (
        <Alert
          severity="error"
          data-testid="fetch-error-alert"
          sx={{ mb: 4 }}
        >
          {fetchError}
          { filteredTasks.length > 0 && (
            <>Tasks shown may not represent their current state. {/*Changes will be saved once connectivity is restored. (TODO)*/} </>
          )}
        </Alert>
      )}

      {(fetchStatus === 'succeeded' && filteredTasks.length == 0) && (
        <Alert severity="info" sx={{ mb: 4, flex: 1 }}>
          No tasks match the filter criteria.
        </Alert>
      )}
      
      {(fetchStatus === 'succeeded' || filteredTasks.length > 0) && (
        <Masonry
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          spacing={1}
          data-testid="masonry"
          sx={{ mb: 4 }}
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
          onClose={() => handleEditModalClose()}
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
