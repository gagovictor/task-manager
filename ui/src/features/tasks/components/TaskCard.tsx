import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import Tooltip from '@mui/material/Tooltip';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { archiveTaskAsync, deleteTaskAsync } from '../redux/tasksSlice';
import { Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { Task } from '../models/task';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { PendingActionsOutlined } from '@mui/icons-material';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onArchive?: (task: Task) => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function TaskCard({ task, onEdit, onArchive }: TaskCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const handleDeleteTask = async () => {
    try {
      await dispatch(deleteTaskAsync(task.id)).unwrap();
      setSnackbarMessage('Task deleted successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Failed to delete the task');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setOpenConfirm(false);
    }
  };

  const handleCloseConfirm = () => setOpenConfirm(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleArchive = async () => {
    try {
      await dispatch(archiveTaskAsync(task.id)).unwrap();
      if (onArchive) {
        onArchive(task);
      }
      setSnackbarMessage('Task archived successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Failed to archive the task');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCardClick = () => {
    onEdit(task);
  };

  const handleButtonClick = (event: React.MouseEvent, action: () => void) => {
    event.stopPropagation(); // Prevent the click event from triggering the card's onClick
    action(); // Call the specific action (archive or delete)
  };

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let formattedDate = null;
  if(task.dueDate) {
    formattedDate = format(toZonedTime(task.dueDate, timeZone), 'dd/MM/yyyy HH:mm');
  }

  const formattedStatus = task.status.charAt(0).toUpperCase() + task.status.slice(1).toLowerCase();
  return (
    <Box sx={{ minWidth: 275, marginBottom: 2 }}>
      <Card variant="outlined" onClick={handleCardClick}>
        <CardContent>
          <Typography variant="h5" component="div">
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PendingActionsOutlined sx={{ mr: 1 }} />
              {task.dueDate ? `${formattedDate}` : 'No due date'}
            </Box>
            <Typography>
              {formattedStatus}
            </Typography>
          </Box>
          <Typography variant="body2">
            {task.description || 'No description available.'}
          </Typography>
        </CardContent>
        <CardActions>
          <Tooltip title="Edit Task">
            <Button size="small" onClick={(event) => handleButtonClick(event, () => onEdit(task))}>
              <EditIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Archive Task">
            <Button size="small" onClick={(event) => handleButtonClick(event, handleArchive)}>
              <ArchiveIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Delete Task">
            <Button size="small" color="error" onClick={(event) => handleButtonClick(event, () => setOpenConfirm(true))}>
              <DeleteIcon />
            </Button>
          </Tooltip>
        </CardActions>
      </Card>

      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}
