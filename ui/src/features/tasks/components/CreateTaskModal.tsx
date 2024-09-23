import { useState } from 'react';
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
  Grid, // Import Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { createTaskAsync } from '../redux/tasksSlice';
import { taskStatuses } from '../models/task';
import { format, toZonedTime } from 'date-fns-tz';
import { ChecklistItem } from '../models/checklist';
import Checklist from '../components/Checklist';
import { v4 as uuidv4 } from 'uuid';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ open, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState(taskStatuses[0]);
  const dispatch = useDispatch<AppDispatch>();
  const { createStatus } = useSelector((state: RootState) => state.tasks);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [alignment, setAlignment] = useState('text');
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: uuidv4(), text: '', completed: false },
  ]);

  const handleCreate = async () => {
    if (title) {
      let dueDate: string | null = null;
      if (date || time) {
        const zonedToday = toZonedTime(new Date(), timeZone);
        const finalDate = date || format(zonedToday, 'yyyy-MM-dd');
        const finalTime = time || '00:00:00';
        const localDateTime = new Date(`${finalDate}T${finalTime}`);
        dueDate = localDateTime.toISOString();
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
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setStatus(taskStatuses[0]);
        onClose();
      } catch (error) {
        // Handle error appropriately
      }
    }
  };

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

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: '85%',
          maxWidth: 600, // Increased maxWidth for better layout
          margin: 'auto',
          backgroundColor: 'white',
          borderRadius: 1,
          position: 'relative',
          marginTop: '10vh',
          maxHeight: '80vh',
          overflowX: 'hidden',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <IconButton
          onClick={onClose}
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
            paddingBottom: 4, // Adjusted padding for better spacing
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
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Date"
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Time"
              variant="outlined"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Box>

          {/* Grid container for Toggle Button and Status Selector */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: isChecklistMode ? 2 : 0 }}>
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
                fullWidth
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
              onChange={(e) => setDescription(e.target.value)}
            />
          )}
        </Box>

        {/* Fixed button at the bottom */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            padding: 2,
            zIndex: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.23)',
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
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateTaskModal;
