import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { updateTaskAsync } from '../redux/tasksSlice';
import { Task, taskStatuses } from '../models/task';
import { format, toZonedTime } from 'date-fns-tz';

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    if (task.dueDate) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const zonedDate = toZonedTime(task.dueDate, timeZone);
      setDate(format(zonedDate, 'yyyy-MM-dd'));
      setTime(format(zonedDate, 'HH:mm'));
    } else {
      setDate('');
      setTime('');
    }
    setStatus(task.status);
  }, [task]);

  const handleUpdate = async () => {
    console.log('handleUpdate');
    if (title) {
      let dueDate = '';
      if (date || time) {
        // Use today's date if no date is provided
        const finalDate = date || new Date().toISOString().split('T')[0];
        // Set time or default to '00:00:00'
        const finalTime = time || '00:00:00';
        const localDateTime = new Date(`${finalDate}T${finalTime}`);
        dueDate = localDateTime.toISOString();
      }
      try {
        await dispatch(updateTaskAsync({ id: task.id, title, description, dueDate, status: status as string })).unwrap();
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

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          margin: 'auto',
          padding: 2,
          backgroundColor: 'white',
          marginTop: '10%',
          borderRadius: 1,
          position: 'relative'
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
        <TextField
          fullWidth
          multiline
          rows={10}
          margin="normal"
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
          onClick={handleUpdate}
        >
          Update
        </Button>
      </Box>
    </Modal>
  );
};

export default EditTaskModal;
