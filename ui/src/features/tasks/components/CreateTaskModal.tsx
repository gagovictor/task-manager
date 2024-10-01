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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { createTaskAsync } from '../redux/tasksSlice';
import { taskStatuses } from '../models/task';
import { ChecklistItem } from '../models/checklist';
import Checklist from '../components/Checklist';
import { v4 as uuidv4 } from 'uuid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ConfirmCloseDialog from './ConfirmCloseDialog';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ open, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [status, setStatus] = useState(taskStatuses[0]);
  const dispatch = useDispatch<AppDispatch>();
  const { createStatus } = useSelector((state: RootState) => state.tasks);
  const [alignment, setAlignment] = useState('text');
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: uuidv4(), text: '', completed: false },
  ]);
  const theme = useTheme();
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCreate = async () => {
    if (title) {
      let dueDate: string | null = null;
      if (dateTime) {
        dueDate = dateTime.toISOString();
      }
      try {
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

        await dispatch(createTaskAsync({ title, description: descriptionToSend, checklist, dueDate, status })).unwrap();
        resetForm();
        onClose();
      } catch (error: any) {
        console.error(`An error ocurred during matter creation: ${error?.message}`);
      }
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
  }

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      setIsChecklistMode(newAlignment === 'checklist');
      if (!checklistItems.length) {
        setChecklistItems([{ id: uuidv4(), text: '', completed: false }]);
      }
    }
  };
  
  const handleClose = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      resetForm();
      onClose();
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

  const confirmClose = () => {
    setShowConfirm(false);
    resetForm();
    onClose();
  };

  const cancelClose = () => {
    setShowConfirm(false);
  };

  useEffect(() => {
    if (!open) {
      setIsDirty(false);
    }
  }, [open]);
  
  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
      >
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
              Create New Task
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
                justifyContent: 'center'
              }}>
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
                  fullWidth sx={{ height: '56px', mt: '8px' }}
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
                onItemsChange={setChecklistItems}
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
              onClick={handleCreate}
              disabled={createStatus === 'loading' || !title}
            >
              Create
            </Button>
          </Paper>
        </Paper>
      </Modal>

      <ConfirmCloseDialog
        open={showConfirm}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close?"
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </>
  );
};

export default CreateTaskModal;
