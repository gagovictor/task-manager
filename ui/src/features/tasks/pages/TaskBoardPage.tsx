import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchTasksAsync, reorderTasksLocally, updateTaskStatusAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, DragStartEvent, DragEndEvent, DragOverlay, closestCenter, useDroppable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import TaskCard from '../components/TaskCard';
import { Task } from '../models/task';
import { Paper } from '@mui/material';

const TaskBoardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, fetchStatus, fetchError } = useSelector((state: RootState) => state.tasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarUndoAction, setSnackbarUndoAction] = useState<(() => void) | undefined>(undefined);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const statusColumns = ['new', 'active', 'completed'];
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  );

  useEffect(() => {
    setFilteredTasks(tasks.filter((task: Task) => !task.archivedAt));
  }, [tasks]);

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

  const handleDragStart = async (event: DragStartEvent) => {
    const task = filteredTasks.find(task => task.id == event.active.id);
    setDraggingTask(task || null);
  }
  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggingTask(null);
    const { active, over } = event;
  
    if (over && active.id !== over.id) {
      const taskId = active.id.toString();
      const activeTaskIndex = filteredTasks.findIndex(task => task.id === active.id);
      const overTaskIndex = filteredTasks.findIndex(task => task.id === over.id);
      const currentStatus = filteredTasks[activeTaskIndex]?.status;
      let newStatus;

      // Check if the dragged item is a task card and not a container
      if (!over.id.toString().includes('container')) {
        newStatus = filteredTasks[overTaskIndex]?.status;
        if(currentStatus == newStatus) {
          // Reorder tasks array locally
          const updatedTasks = [...filteredTasks];
          const [movedTask] = updatedTasks.splice(activeTaskIndex, 1);
          updatedTasks.splice(overTaskIndex, 0, movedTask);
          console.log(updatedTasks);
          dispatch(reorderTasksLocally({ updatedTasks }));
    
          showSnackbar('Tasks reordered successfully', 'success');
          return;
        }
      } else {
        // Handle moving task to a different column/container
        newStatus = over.id.toString().replace('container-', '');
      }

      if(currentStatus == newStatus) {
        return;
      }

      try {
        await dispatch(updateTaskStatusAsync({ id: taskId, status: newStatus })).unwrap();
        showSnackbar('Task moved successfully', 'success');
      } catch (error: any) {
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
        <div
          style={{
            opacity: draggingTask?.id === task.id ? 0.1 : 1,
          }}
        >
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => handleEditTask(task)}
            showSnackbar={showSnackbar}
          />
        </div>
      </div>
    );
  };

  const SortableContainer = ({ status }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: `container-${status}`,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      background: 'red',
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      </div>
    );
  };

  let taskColumnRefs = {};
  statusColumns.forEach(status => {
    taskColumnRefs[status] = {
      droppable: useDroppable({ id: status }),
      sortable: useDroppable({ id: `sortable-${status}` })
    };
  });

  const renderTaskColumns = (status: string) => {
    const title = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const tasksByStatus = filteredTasks.filter(task => task.status === status);
    const { isOver, setNodeRef } = taskColumnRefs[status].droppable;

    return (
      <SortableContext
        items={tasksByStatus.map(task => task.id)}
        strategy={rectSortingStrategy}
      >
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
          <Paper
            ref={setNodeRef}
            sx={{
              padding: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderRadius: '6px',
              border: isOver ? '1px solid blue' : '1px solid #777',
            }}
          >
            <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: '16px' }}>
              {title}
            </Typography>
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                display: 'block'
              }}
            >
              <SortableContainer status={status}></SortableContainer>
              {tasksByStatus.map(task => (
                <SortableTaskCard task={task} />
              ))}
            </Box>
          </Paper>
        </Box>
      </SortableContext>
    );
  };
  
  return (
    <Container
      sx={{
        width: '100%',
        minHeight: '100vh',
        padding: 16,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {fetchStatus === 'loading' && <CircularProgress />}
      {fetchStatus === 'idle' && <Typography>No tasks available</Typography>}
      {fetchStatus === 'failed' && <Alert severity="error">{fetchError}</Alert>}
      {fetchStatus === 'succeeded' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              height: 'calc(100vh - 64px)',
              overflow: 'hidden',
            }}
          >
            {statusColumns.map(status => renderTaskColumns(status))}
          </Box>
          <DragOverlay>
            {draggingTask && (
              <TaskCard
                task={draggingTask}
                showSnackbar={showSnackbar}
              />
            )}
          </DragOverlay>
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
