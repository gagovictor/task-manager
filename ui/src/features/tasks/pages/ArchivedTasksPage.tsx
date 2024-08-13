import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTasksAsync, createTaskAsync, updateTaskAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';
import { CircularProgress, Typography, Alert, Fab, Container } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { Task } from '../models/task';

export default function ArchivedTasksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, status, error } = useSelector((state: RootState) => state.tasks);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasksAsync());
  }, [dispatch]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  // Display only archived tasks
  const archivedTasks = tasks.filter((task: Task) => task.archivedAt && !task.deletedAt);

  return (
    <Container sx={{ width: '100%', minHeight: '100vh', padding: 8, position: 'relative' }}>
      {status === 'loading' && <CircularProgress />}
      {status === 'failed' && <Alert severity="error">{error}</Alert>}
      {status === 'succeeded' && (
        <Masonry columns={3} spacing={2}>
          {archivedTasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => handleEditTask(task)}
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
            onClick={() => setCreateModalOpen(true)}
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
        onClick={() => setCreateModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {selectedTask && (
        <EditTaskModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          task={selectedTask}
        />
      )}
    </Container>
  );
}
