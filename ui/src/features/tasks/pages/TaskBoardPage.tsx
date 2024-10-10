import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTasksAsync, reorderTasksLocally, updateTaskStatusAsync } from '../redux/tasksSlice';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, DragStartEvent, DragEndEvent, DragOverlay, closestCenter, useDroppable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from '../components/TaskCard';
import { Task } from '../models/task';
import { Paper, useTheme } from '@mui/material';
import TaskModal from '../components/TaskModal';
import { FetchTasksParams } from '../models/api';

const TaskBoardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, fetchStatus, fetchError } = useSelector((state: RootState) => state.tasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarUndoAction, setSnackbarUndoAction] = useState<(() => void) | undefined>(undefined);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const statusColumns = ['new', 'active', 'completed'];
  const theme = useTheme();
  const [fetchParams, setFetchParams] = useState<FetchTasksParams>({
    page: 1,
    limit: 20,
    filters: {
      archived: false
    }
  });
  
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
    dispatch(fetchTasksAsync(fetchParams));
  }, [dispatch]);

  const handleCreateTask = () => {
    setEditMode(false);
    setModalOpen(true);
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditMode(true);
    setModalOpen(true);
  };

  const onCloseTaskModal = () => {
    setEditMode(false);
    setModalOpen(false);
  }

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
    const { setNodeRef } = taskColumnRefs[status].droppable;

    return (
      <SortableContext
        key={status}
        items={tasksByStatus.map(task => task.id)}
        strategy={rectSortingStrategy}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: { sm: '60vw', md: '360px' },
            flex: '0 0 auto',
          }}
        >
          <Paper
            ref={setNodeRef}
            elevation={0}
            sx={{
              padding: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '80vh',
              borderRadius: '6px',
              border: `1px solid rgba(0, 0, 0, 0.23)`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginLeft: '8px',
                marginBottom: '16px',
                color: theme.palette.secondary.contrastText
              }}
              data-testid={`heading-${status}`}>
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
                <SortableTaskCard key={task.id} task={task} />
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
        minHeight: 'calc(100vh - 64px)', // full screen height minus footer
        paddingTop: { xs: 'calc(32px + 56px)', md: 'calc(32px + 64px)' }, // Offset fixed app bar/header
        position: 'relative',
        paddingBottom: '32px',
      }}
    >
      {fetchStatus === 'failed' &&
        <Alert
          severity="error"
          data-testid="fetch-error-alert"
        >
          {fetchError}
        </Alert>
      }
      {fetchStatus === 'succeeded' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box
            key={'dnd-container'}
            sx={{
              width: '100%',
              display: 'flex',
              height: 'calc(100vh - 64px)',
              overflowY: 'hidden',
              overflowX: 'auto'
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
        onClick={handleCreateTask}
      >
        <AddIcon />
      </Fab>

      <TaskModal
        open={modalOpen}
        onClose={onCloseTaskModal}
        task={selectedTask}
        mode={editMode ? 'edit' : 'create'}
      />

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
            snackbarUndoAction && (
              <Button color="inherit" onClick={handleSnackbarAction}>
                Undo
              </Button>
            )
          }>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskBoardPage;
