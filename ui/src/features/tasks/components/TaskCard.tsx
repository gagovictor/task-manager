import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Tooltip from '@mui/material/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { archiveTaskAsync, deleteTaskAsync, unarchiveTaskAsync } from '../redux/tasksSlice';
import { Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { Task } from '../models/task';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { PendingActionsOutlined } from '@mui/icons-material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { useGlassmorphismStyles } from '../../shared/hooks/useGlassmorphismStyles';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  showSnackbar: (message: string, severity: 'success' | 'error', undoAction?: () => void) => void;
}

export default function TaskCard({ task, onEdit, showSnackbar }: TaskCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const { deleteStatus, deleteError, archiveStatus, archiveError } = useSelector((state: RootState) => state.tasks);
  const [isDescriptionOverflow, setIsDescriptionOverflow] = useState(false);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (descriptionRef.current) {
      setIsDescriptionOverflow(descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight);
    }
  }, [task.description]);

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
    try {
      await dispatch(archiveTaskAsync(task.id)).unwrap();
      showSnackbar('Task archived successfully', 'success', () => handleUnarchive());
    } catch (error) {
      showSnackbar(archiveError || 'Failed to archive task', 'error');
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
    if(onEdit) {
      onEdit(task);
    }
  };

  const handleButtonClick = (event: React.MouseEvent, action: () => void) => {
    event.stopPropagation(); // Prevent the click event from triggering the card's onClick
    action(); // Call the specific action (archive or delete)
  };

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentDate = new Date();
  let formattedDueDate = 'No due date';
  let isPastDue = false;

  if (task.dueDate) {
    const dueDate = toZonedTime(task.dueDate, timeZone);
    formattedDueDate = format(dueDate, 'dd/MM/yyyy HH:mm').replace(' 00:00', '');
    isPastDue = currentDate > dueDate && task.status != 'completed';
  }

  const formattedStatus = task.status.charAt(0).toUpperCase() + task.status.slice(1).toLowerCase();

  const formattedCreatedAt = task.createdAt
    ? format(toZonedTime(task.createdAt, timeZone), 'dd/MM/yyyy HH:mm')
    : '-';

  const isDueIn24hrs = () => {
    if(!task.dueDate) {
      return false;
    }
    const timeRemaining = new Date(task.dueDate).getTime() - currentDate.getTime();
    return timeRemaining > 0 && timeRemaining < 24 * 60 * 60 * 1000;
  }

  const moreCaption = (
    <Typography
      variant="caption"
      sx={{
        display: 'flex',
        alignItems: 'center',
        textAlign: 'left',
        color: 'text.warning',
        mr: 2,
      }}
    >
      <UnfoldMoreIcon
        sx={{
          fontSize: '1.5em',
          marginRight: '4px', 
        }}
      />
      More
    </Typography>
  );

  const createdAtCaption = (
    <Typography variant="caption"
      sx={{
        textAlign: 'right',
        color: 'text.warning',
      }}>
      Created at: {formattedCreatedAt}
    </Typography>
  );

  const glassStyles = useGlassmorphismStyles();

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Card
        variant="outlined"
        onClick={handleCardClick}
        sx={{
          ...glassStyles,
          // backgroundColor: theme.palette.background.paper,
          cursor: 'pointer',
          userSelect: 'no-select',
          borderColor: theme.palette.divider,
        }}
      >
        <CardContent>
          <Typography variant="h6" component="div">
            {task.title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              my: 1,
              gap: 1,
              color: 'text.warning'
            }}
          >
            {isPastDue ? (
                <Chip
                  icon={<PendingActionsOutlined />}
                  label={formattedDueDate}
                  color="error"
                  sx={{ backgroundColor: theme.palette.error.light, color: theme.palette.error.contrastText }}
                  data-testid="duedate-chip"
                />
              ) : (
                <Chip
                  icon={<PendingActionsOutlined />}
                  label={formattedDueDate}
                  color={isDueIn24hrs() ? 'warning' : 'default'}
                  data-testid="duedate-chip"
                />
              )
            }
            <Chip
              color={task.status == 'completed' ? 'success' : task.status == 'active' ? 'primary' : 'default'}
              label={formattedStatus}
              data-testid="status-chip"
            />
          </Box>

          {task.checklist && task.checklist.length > 0 ? (
            <List>
              {task.checklist.slice(0, 3).map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mt: -1.25 }}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={item.completed}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': `checkbox-list-label-${item.id}` }}
                    />
                  </ListItemIcon>
                  <ListItemText id={`checkbox-list-label-${item.id}`} primary={item.text} />
                </ListItem>
              ))}
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  {task.checklist.length > 3 && moreCaption}
                  </div>
                {createdAtCaption}
              </Box>
            </List>
          ) : (
            <>
              <Typography
                ref={descriptionRef}
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
                color="text.warning"
              >
                {task.description ? task.description : 'No description provided'}
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  {isDescriptionOverflow && moreCaption}
                </div>
                {createdAtCaption}
              </Box>

            </>
          )}
        </CardContent>

        <CardActions
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Tooltip title="Edit Task">
            <span>
              <Button
                size="small"
                color="primary"
                onClick={(event) => handleButtonClick(event, () => { if(onEdit) onEdit(task); })}
                data-testid="edit-task-btn">
                <EditIcon />
              </Button>
            </span>
          </Tooltip>
          {task.archivedAt ? (
            <Tooltip title="Unarchive Task">
              <span>
                <Button
                  size="small"
                  color="primary"
                  onClick={(event) => handleButtonClick(event, handleUnarchive)}
                  disabled={archiveStatus === 'loading'}
                  data-testid="unarchive-task-btn">
                  <UnarchiveIcon />
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Archive Task">
              <span>
                <Button
                  size="small"
                  color="primary"
                  onClick={(event) => handleButtonClick(event, handleArchive)}
                  disabled={archiveStatus === 'loading'}
                  data-testid="archive-task-btn">
                  <ArchiveIcon />
                </Button>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Delete Task">
            <span>
              <Button
                size="small"
                color="primary"
                onClick={(event) => handleButtonClick(event, () => setOpenConfirm(true))}
                disabled={deleteStatus === 'loading'}
                data-testid="delete-task-btn">
                <DeleteIcon />
              </Button>
            </span>
          </Tooltip>
        </CardActions>
      </Card>

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this task?
          </Typography>
          <Typography variant="body1" color="error">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
