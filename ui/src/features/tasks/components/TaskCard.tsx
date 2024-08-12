import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Task } from '../models/task';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Box sx={{ minWidth: 275, marginBottom: 2 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Task
          </Typography>
          <Typography variant="h5" component="div">
            {task.title}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
          </Typography>
          <Typography variant="body2">
            {task.description || 'No description available.'}
          </Typography>
        </CardContent>
        <CardActions>
          {onEdit && (
            <Button size="small" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="small" color="error" onClick={onDelete}>
              Delete
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
}
