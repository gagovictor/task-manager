import { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, MenuItem, FormControl, InputLabel, Select, ToggleButton, ToggleButtonGroup, Grid, useTheme, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { updateTaskAsync } from '../redux/tasksSlice';
import { Task, taskStatuses } from '../models/task';
import { format, toZonedTime } from 'date-fns-tz';
import { ChecklistItem } from '../models/checklist';
import { v4 as uuidv4 } from 'uuid';
import Checklist from './Checklist';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task }) => {
  const { updateStatus } = useSelector((state: RootState) => state.tasks);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [status, setStatus] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [alignment, setAlignment] = useState('text');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const theme = useTheme();
  
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDateTime(task.dueDate ? new Date(task.dueDate) : null);
    setStatus(task.status);
    if (task.checklist && task.checklist.length > 0) {
      setIsChecklistMode(true);
      setAlignment('checklist');
      setChecklistItems(task.checklist);
    } else {
      setIsChecklistMode(false);
      setAlignment('text');
      setChecklistItems([]);
    }
  }, [task]);
  
  const handleUpdate = async () => {
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
        
        resetForm();
        onClose();
      } catch (error) {
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
  }
  
  const handleClose = () => {
    resetForm();
    onClose();
  }
  
  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
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
    }
  };

  return (
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
            marginBottom: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Edit Task
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* DateTime selectors */}
          <DateTimePicker
            value={dateTime}
            onChange={(newValue) => setDateTime(newValue)}
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
                  onChange={(e) => setStatus(e.target.value as string)}
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
              onChange={(e) => setDescription(e.target.value)}
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
            onClick={handleUpdate}
            disabled={updateStatus === 'loading' || !title}
          >
            Update
          </Button>
        </Paper>
      </Paper>
    </Modal>
  );
};

export default EditTaskModal;
