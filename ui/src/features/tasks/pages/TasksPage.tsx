// src/pages/TasksPage.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTasks } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';
import { CircularProgress, Typography, Alert } from '@mui/material';
import { Task } from '../models/task';

export default function TasksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, status, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', padding: 2 }}>
      {status === 'loading' && <CircularProgress />}
      {status === 'failed' && <Alert severity="error">{error}</Alert>}
      {status === 'succeeded' && (
        <Masonry columns={3} spacing={2}>
          {tasks.map((task: any) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => console.log(`Edit task ${task.id}`)}
              onDelete={() => console.log(`Delete task ${task.id}`)}
            />
          ))}
        </Masonry>
      )}
      {status === 'idle' && <Typography>No tasks available</Typography>}
    </Box>
  );
}
