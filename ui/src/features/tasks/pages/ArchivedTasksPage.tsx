import * as React from 'react';
import Box from '@mui/material/Box';
import Masonry from '@mui/lab/Masonry';
import TaskCard from '../components/TaskCard';

// Mock list of tasks
const tasks = [
  {
    id: '1',
    title: 'Complete React Project',
    description: 'Finish the task manager UI and integrate with backend.',
    dueDate: new Date().toISOString(),
    status: 'pending'
  },
  {
    id: '2',
    title: 'Update Documentation',
    description: 'Revise the API documentation for the latest changes.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    status: 'in-progress'
  },
  {
    id: '3',
    title: 'Fix Bugs',
    description: 'Resolve the reported bugs from the last release.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    status: 'pending'
  },
  {
    id: '4',
    title: 'Plan Sprint',
    description: 'Prepare the sprint planning for the next development cycle.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    status: 'completed'
  }
];

export default function ArchivedTasksPage() {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', padding: 2 }}>
      <Masonry columns={3} spacing={2}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => console.log(`Edit task ${task.id}`)}
          />
        ))}
      </Masonry>
    </Box>
  );
}
