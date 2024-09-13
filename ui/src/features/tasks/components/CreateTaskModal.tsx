import { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, MenuItem, FormControl, InputLabel, Select, Checkbox, ToggleButtonGroup, ToggleButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { createTaskAsync } from '../redux/tasksSlice';
import { taskStatuses } from '../models/task';
import { format, toZonedTime } from 'date-fns-tz';
import { ChecklistItem } from '../models/checklist';
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
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

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
        await dispatch(createTaskAsync({ title, description, checklist: checklistItems, dueDate, status })).unwrap();
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setStatus(taskStatuses[0]);
        onClose();
      } catch (error) {
      }
    }
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, { id: uuidv4(), text: '', completed: false }]);
  };
  
  const removeChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };
  
  const toggleChecklistItemCompletion = (id: string) => {
    setChecklistItems(checklistItems.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };
    
  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      setIsChecklistMode(newAlignment === 'checklist');
      if(!checklistItems.length) {
        setChecklistItems([{ id: uuidv4(), text: '' , completed: false }]);
      }
    }
  };

  const handleChecklistFocus = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if(checklistItems[index].text && index == checklistItems.length - 1) {
      addChecklistItem();
    }
  };
  
  const handleChecklistChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    console.log(e.target.value);
    const newItems = [...checklistItems];
    newItems[index] = { ...newItems[index], text: e.target.value };
    if(index == newItems.length - 1) {
      newItems.push({ id: uuidv4(), text: '', completed: false });
    }
    setChecklistItems(newItems);
  };
  
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: '85%',
          maxWidth: 500,
          margin: 'auto',
          padding: 2,
          backgroundColor: 'white',
          borderRadius: 1,
          position: 'relative',
          marginTop: '10%',
          overflow: 'hidden'
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
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

        <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ mb: isChecklistMode ? 2 : 0 }}>
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
          <Box sx={{ height: '178px', overflowY: 'auto' }}>
            {checklistItems.map((item, index) => (
              <Box
                key={item.id} display="flex" alignItems="center" mb={1}>
                <Checkbox
                  checked={item.completed}
                  onChange={() => toggleChecklistItemCompletion(item.id)}
                />
                <TextField
                  value={item.text}
                  onChange={(e) => handleChecklistChange(e as any, index)}
                  placeholder={`Item ${index + 1}`}
                  fullWidth
                />
                <IconButton onClick={() => removeChecklistItem(item.id)} aria-label="Remove item">
                  <CloseIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline
            rows={6}
            margin="normal"
            label="Description"
            variant="outlined"
            value={description}
            sx={{ height: '170px' }}
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
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleCreate}
          disabled={createStatus == 'loading' || !title }
        >
          Create
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateTaskModal;
