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
import UnarchiveIcon from '@mui/icons-material/Unarchive'; // Import Unarchive icon
import Tooltip from '@mui/material/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { archiveTaskAsync, deleteTaskAsync, unarchiveTaskAsync } from '../redux/tasksSlice';
import { Chip, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Task } from '../models/task';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { PendingActionsOutlined } from '@mui/icons-material';
import { useState } from 'react';
import './TaskCard.css';
import theme from '../../shared/config/theme';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  showSnackbar: (message: string, severity: 'success' | 'error', undoAction?: () => void) => void; // Update to accept undoAction
}

export default function TaskCard({ task, onEdit, showSnackbar }: TaskCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [archiving, setArchiving] = useState(false); // State to track archiving

  const { deleteStatus, deleteError, archiveStatus, archiveError } = useSelector((state: RootState) => state.tasks);

  const handleCloseConfirm = () => setOpenConfirm(false);

  const handleDelete = async () => {
    try {
      await dispatch(deleteTaskAsync(task.id)).unwrap();
      showSnackbar('Task deleted successfully', 'success');
    } catch (error) {
      showSnackbar(deleteError || 'Failed to delete task', 'error');
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await dispatch(archiveTaskAsync(task.id)).unwrap();
      showSnackbar('Task archived successfully', 'success', () => handleUnarchive());
    } catch (error) {
      showSnackbar(archiveError || 'Failed to archive task', 'error');
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    try {
      await dispatch(unarchiveTaskAsync(task.id)).unwrap();
      showSnackbar('Task unarchived successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to unarchive task', 'error');
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
  let formattedDueDate = 'No due date';
  if (task.dueDate) {
    formattedDueDate = format(toZonedTime(task.dueDate, timeZone), 'dd/MM/yyyy HH:mm');
  }

  const formattedStatus = task.status.charAt(0).toUpperCase() + task.status.slice(1).toLowerCase();

  return (
    <Box sx={{ width: '100%', marginBottom: 2 }}>
      <Card
        className="no-select"
        variant="outlined"
        onClick={handleCardClick}
        sx={{
          backgroundColor: theme.palette.background.paper,
          cursor: 'pointer'
        }}
      >
        <CardContent>
          <Typography variant="h5" component="div">
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', my: 1, gap: 1, color: 'text.secondary' }}>
            <Chip
              icon={<PendingActionsOutlined />}
              label={formattedDueDate}
            />
            <Chip label={formattedStatus} />
          </Box>
          <Typography
            sx={{ 
              mb: 1.5, 
              whiteSpace: 'pre-line', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              maxHeight: '5em',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}
            color="text.secondary"
          >
            {task.description ? task.description : 'No description provided'}
          </Typography>
        </CardContent>
        <CardActions>
          <Tooltip title="Edit Task">
            <Button size="small" onClick={(event) => handleButtonClick(event, () => onEdit(task))}>
              <EditIcon />
            </Button>
          </Tooltip>
          {task.archivedAt ? (
            <Tooltip title="Unarchive Task">
              <Button size="small" onClick={(event) => handleButtonClick(event, handleUnarchive)}>
                <UnarchiveIcon />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Archive Task">
              <Button size="small" onClick={(event) => handleButtonClick(event, handleArchive)} disabled={archiving}>
                <ArchiveIcon />
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Delete Task">
            <Button size="small" onClick={(event) => handleButtonClick(event, () => setOpenConfirm(true))}>
              <DeleteIcon />
            </Button>
          </Tooltip>
        </CardActions>
      </Card>
      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this task?</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
