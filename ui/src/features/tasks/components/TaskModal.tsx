import { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  useTheme,
  Paper,
  SelectChangeEvent,
  Alert,
  Snackbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { createTaskAsync, updateTaskAsync } from '../redux/tasksSlice';
import { taskStatuses, Task } from '../models/task';
import { ChecklistItem } from '../models/checklist';
import Checklist from '../components/Checklist';
import { v4 as uuidv4 } from 'uuid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ConfirmCloseDialog from './ConfirmCloseDialog';

export type TaskModalMode = 'create' | 'edit';

export interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  mode: TaskModalMode;
  task?: Task;
}

const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, mode, task }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { createStatus, updateStatus } = useSelector((state: RootState) => state.tasks);
  const theme = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [status, setStatus] = useState(taskStatuses[0]);
  const [alignment, setAlignment] = useState<'text' | 'checklist'>('text');
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: uuidv4(), text: '', completed: false },
  ]);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const isLoading = mode === 'create' ? createStatus === 'loading' : updateStatus === 'loading';
  const buttonLabel = mode === 'create' ? 'Create' : 'Update';
  const modalTitle = mode === 'create' ? 'New Task' : 'Edit Task';

  useEffect(() => {
    resetForm();
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setDescription(task.description);
      setDateTime(task.dueDate ? new Date(task.dueDate) : null);
      setStatus(task.status);
      if (task.checklist && task.checklist.length > 0) {
        setIsChecklistMode(true);
        setAlignment('checklist');
        setChecklistItems(task.checklist);
      }
      setTimeout(() => {
        setIsDirty(false);
      }, 100); // Required because checklist onItemsChange marks as dirty
    }
  }, [mode, task, open]);

  const handleSubmit = async () => {
    if (!title) {
      return;
    }
    
    handleSnackbarClose();
    
    let dueDate: string | null = null;
    if (dateTime) {
      dueDate = dateTime.toISOString();
    }

    let checklist: ChecklistItem[] | null = null;
    let descriptionToSend = description;

    const filteredChecklist = checklistItems.filter(
      (item) => item.text.trim() !== ''
    );
    checklist = filteredChecklist;

    if (isChecklistMode) {
      descriptionToSend = '';
    } else {
      checklist = null;
    }

    try {
      if (mode === 'create') {
        await dispatch(
          createTaskAsync({ title, description: descriptionToSend, checklist, dueDate, status })
        ).unwrap();
        showSnackbar('Task created successfully', 'success');
      } else if (mode === 'edit' && task) {
        await dispatch(
          updateTaskAsync({
            id: task.id,
            title,
            description: descriptionToSend,
            checklist,
            dueDate,
            status: status as string,
          })
        ).unwrap();
        showSnackbar('Task updated successfully', 'success');
      }

      resetForm();
      onClose();
    } catch (error: any) {
      console.error(`An error occurred: ${error?.message}`);
      showSnackbar(`Failed to ${mode} task`, 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDateTime(null);
    setChecklistItems([]);
    setIsChecklistMode(false);
    setAlignment('text');
    setStatus(taskStatuses[0]);
    setIsDirty(false);
  };

  const handleClose = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowConfirm(false);
    onClose();
  };

  const cancelClose = () => {
    setShowConfirm(false);
  };

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: 'text' | 'checklist' | null
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      const switchingToChecklist = newAlignment === 'checklist';
      setIsChecklistMode(switchingToChecklist);

      if (switchingToChecklist && checklistItems.length === 0) {
        setChecklistItems([{ id: uuidv4(), text: '', completed: false }]);
      } else if (!switchingToChecklist) {
        const filteredChecklist = checklistItems.filter(
          (item) => item.text.trim() !== ''
        );
        setChecklistItems(filteredChecklist);
      }
      setIsDirty(true);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    setIsDirty(true);
  };

  const handleDateTimeChange = (newValue: Date | null) => {
    setDateTime(newValue);
    setIsDirty(true);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value);
    setIsDirty(true);
  };


  const handleSnackbarClose = () => setSnackbarOpen(false);

  const showSnackbar = (message: string, severity: 'success' | 'error', undoAction?: () => void) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Paper
          sx={{
            width: '85%',
            maxWidth: '540px',
            margin: 'auto',
            borderRadius: 1,
            position: 'relative',
            marginTop: '10vh',
            maxHeight: '80vh',
            overflowX: 'hidden',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>

          {/* Scrollable content */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              padding: 2,
              paddingBottom: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {modalTitle}
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              label="Title"
              variant="outlined"
              value={title}
              onChange={handleTitleChange}
              required
            />

            <DateTimePicker
              value={dateTime}
              label="Due Date"
              onChange={handleDateTimeChange}
              views={['year', 'month', 'day', 'hours', 'minutes']}
              sx={{ width: '100%' }}
            />

            {/* Grid container for Toggle Button and Status Selector */}
            <Grid
              container
              spacing={2}
              sx={{
                mb: isChecklistMode ? 2 : 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    {taskStatuses.map((statusOption) => (
                      <MenuItem key={statusOption} value={statusOption}>
                        {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <ToggleButtonGroup
                  color="primary"
                  value={alignment}
                  exclusive
                  onChange={handleModeChange}
                  aria-label="Task Input Mode"
                  fullWidth
                  sx={{ height: '56px', mt: '8px' }}
                >
                  <ToggleButton value="text">Text</ToggleButton>
                  <ToggleButton value="checklist">Checklist</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>

            {/* Description or Checklist */}
            {isChecklistMode ? (
              <Checklist
                items={checklistItems}
                onItemsChange={(items) => {
                  setChecklistItems(items);
                  setIsDirty(true);
                }}
              />
            ) : (
              <TextField
                fullWidth
                multiline
                rows={6}
                margin="normal"
                label="Description"
                variant="outlined"
                value={description}
                onChange={handleDescriptionChange}
              />
            )}
          </Box>

          {/* Fixed button at the bottom */}
          <Paper
            sx={{
              position: 'sticky',
              bottom: 0,
              padding: 2,
              zIndex: 2,
              borderTop: '1px solid rgba(0, 0, 0, 0.23)',
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isLoading || !title}
            >
              {buttonLabel}
            </Button>
          </Paper>
        </Paper>
      </Modal>

      {/* Confirmation Dialog for Unsaved Changes */}
      <ConfirmCloseDialog
        open={showConfirm}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close?"
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
      
      {/* Snackbar for action feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskModal;
