import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { updateTaskAsync } from '../redux/tasksSlice';
import { Task } from '../models/task';

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
  }, [task]);

  const handleUpdate = () => {
    if (title && description && dueDate) {
      dispatch(updateTaskAsync({ id: task.id, title, description, dueDate, status: task.status as string }));
      onClose();
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
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Due Date"
          variant="outlined"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
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
