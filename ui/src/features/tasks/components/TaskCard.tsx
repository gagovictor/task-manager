import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { deleteTaskAsync } from '../redux/tasksSlice';
import { Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { Task } from '../models/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function TaskCard({ task, onEdit }: TaskCardProps) {
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

  const handleOpenConfirm = () => setOpenConfirm(true);
  const handleCloseConfirm = () => setOpenConfirm(false);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box sx={{ minWidth: 275, marginBottom: 2 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Task
          </Typography>
          <Typography variant="h5" component="div">
            {task.title}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
          </Typography>
          <Typography variant="body2">
            {task.description || 'No description available.'}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => onEdit(task)}>
            <EditIcon /> Edit
          </Button>
          <Button size="small" color="error" onClick={handleOpenConfirm}>
            <DeleteIcon /> Delete
          </Button>
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

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
