import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { createTaskAsync } from '../redux/tasksSlice';
import { taskStatuses } from '../models/task';

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

  const handleCreate = async () => {
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
        await dispatch(createTaskAsync({ title, description, dueDate, status })).unwrap();
        // Reset form fields on success
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
          onClick={handleCreate}
        >
          Create
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateTaskModal;
