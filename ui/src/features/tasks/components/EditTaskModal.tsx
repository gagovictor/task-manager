import { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, MenuItem, FormControl, InputLabel, Select, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateTaskAsync } from '../redux/tasksSlice';
import { Task, taskStatuses } from '../models/task';
import { format, toZonedTime } from 'date-fns-tz';
import { ChecklistItem } from '../models/checklist';
import { v4 as uuidv4 } from 'uuid';
import Checklist from './Checklist';

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task }) => {
  const { updateStatus } = useSelector((state: RootState) => state.tasks);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [alignment, setAlignment] = useState('text');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    if (task.dueDate) {
      const zonedDate = toZonedTime(task.dueDate, timeZone);
      setDate(format(zonedDate, 'yyyy-MM-dd'));
      setTime(format(zonedDate, 'HH:mm'));
    } else {
      setDate('');
      setTime('');
    }
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
  
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setStatus('');
        setChecklistItems([]);
        setIsChecklistMode(false);
        setAlignment('text');
  
        onClose();
      } catch (error) {
      }
    }
  };
  
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
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: '85%',
          maxWidth: 500,
          margin: 'auto',
          backgroundColor: 'white',
          borderRadius: 1,
          position: 'relative',
          marginTop: '10vh',
          maxHeight: '80vh',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8
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
            marginBottom: 2,    // Add space for the fixed button at the bottom
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
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
          
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mb: isChecklistMode ? 2 : 0 }}
          >
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleModeChange}
              aria-label="Task Input Mode"
            >
              <ToggleButton value="text">Text</ToggleButton>
              <ToggleButton value="checklist">Checklist</ToggleButton>
            </ToggleButtonGroup>
          </Box>

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
        </Box>

        {/* Fixed button at the bottom */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            padding: 2,
            zIndex: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.23)'
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
        </Box>
      </Box>
    </Modal>
  );
};

export default EditTaskModal;
