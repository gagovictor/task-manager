// src/pages/TasksPage.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTasksAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';
import { CircularProgress, Typography, Alert, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateTaskModal from '../components/CreateTaskModal';

export default function TasksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, status, error } = useSelector((state: RootState) => state.tasks);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTasksAsync());
  }, [dispatch]);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', padding: 2, position: 'relative' }}>
      {status === 'loading' && <CircularProgress />}
      {status === 'failed' && <Alert severity="error">{error}</Alert>}
      {status === 'succeeded' && (
        <Masonry columns={3} spacing={2}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => console.log(`Edit task ${task.id}`)}
              onDelete={() => console.log(`Delete task ${task.id}`)}
            />
          ))}
          <Box
            sx={{
              width: 300,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed grey',
              borderRadius: 1,
              backgroundColor: '#f0f0f0',
              cursor: 'pointer'
            }}
            onClick={handleModalOpen}
          >
            <Typography variant="h6">Create New Task</Typography>
          </Box>
        </Masonry>
      )}
      {status === 'idle' && <Typography>No tasks available</Typography>}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleModalOpen}
      >
        <AddIcon />
      </Fab>

      <CreateTaskModal
        open={modalOpen}
        onClose={handleModalClose}
      />
    </Box>
  );
}
