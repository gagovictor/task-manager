import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTasksAsync, updateTaskStatusAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, DragEndEvent, closestCenter, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import TaskCard from '../components/TaskCard';
import { Task, taskStatuses } from '../models/task';
import { Paper } from '@mui/material';

const TaskBoardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, fetchStatus, fetchError } = useSelector((state: RootState) => state.tasks);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarUndoAction, setSnackbarUndoAction] = useState<(() => void) | undefined>(undefined);

  let filteredTasks = tasks.filter((task: Task) => !task.archivedAt);

  useEffect(() => {
    dispatch(fetchTasksAsync());
  }, [dispatch]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const showSnackbar = (message: string, severity: 'success' | 'error', undoAction?: () => void) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    setSnackbarUndoAction(() => undoAction);
  };

  const handleSnackbarAction = () => {
    if (snackbarUndoAction) {
      snackbarUndoAction();
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
  
    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex(task => task.id === active.id);
      const newIndex = filteredTasks.findIndex(task => task.id === over.id);
  
      const activeColumn = filteredTasks.find(task => task.id == active.id)?.status;
      const overColumn = filteredTasks.find(task => task.id == over.id)?.status;
      
      console.log(`activeColumn ${activeColumn} overColumn ${overColumn} `)
      if(!activeColumn || !overColumn) {
        return;
      }

      const newStatus = overColumn;
      const taskId = active.id.toString();
  
      try {
        // Dispatch the action and await the result with `unwrap`
        await dispatch(updateTaskStatusAsync({ id: taskId, status: newStatus })).unwrap();
        
        // If successful, optimistically update the UI
        filteredTasks = arrayMove(filteredTasks, oldIndex, newIndex);
  
        showSnackbar('Task moved successfully', 'success');
      } catch (error: any) {
        // If the update fails, show an error message
        showSnackbar(`Failed to move task`, 'error');
      }
    }
  };

  const SortableTaskCard = ({ task }: { task: Task }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: task.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <TaskCard
            key={task.id}
            task={task}
            onEdit={() => handleEditTask(task)}
            showSnackbar={showSnackbar}
        />
      </div>
    );
  };

  const taskColumnRefs = taskStatuses.reduce((acc, status) => {
    acc[status] = useDroppable({ id: status });
    return acc;
  }, {} as Record<string, ReturnType<typeof useDroppable>>);

  const renderTaskColumns = (status: string) => {
    const title = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const tasksByStatus = filteredTasks.filter(task => task.status === status);
    const { setNodeRef } = taskColumnRefs[status];

    return (
      <Box
        key={status}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          margin: '0 8px',
          height: '100%',
        }}
      >
        <Paper sx={{ padding: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: '16px' }}>
            {title}
          </Typography>
          <SortableContext
            items={tasksByStatus.map(task => task.id)}
            strategy={rectSortingStrategy}
            >
            <Box
              ref={setNodeRef}
              sx={{ flex: 1, overflowY: 'auto' }}>
              {tasksByStatus.map(task => (
                <SortableTaskCard key={task.id} task={task} />
              ))}
            </Box>
          </SortableContext>
        </Paper>
      </Box>
    );
  };
  
  return (
    <Container sx={{ width: '100%', minHeight: '100vh', padding: 16, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {fetchStatus === 'loading' && <CircularProgress />}
      {fetchStatus === 'idle' && <Typography>No tasks available</Typography>}
      {fetchStatus === 'failed' && <Alert severity="error">{fetchError}</Alert>}
      {fetchStatus === 'succeeded' && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {taskStatuses.map(status => renderTaskColumns(status))}
          </Box>
        </DndContext>
      )}

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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          action={
            snackbarUndoAction ? (
              <Button color="inherit" onClick={handleSnackbarAction}>
                Undo
              </Button>
            ) : null
          }>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskBoardPage;
