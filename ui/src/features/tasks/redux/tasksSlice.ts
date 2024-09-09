import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { archiveTask, createTask, CreateTaskRequest, deleteTask, fetchTasks, unarchiveTask, updateTask, UpdateTaskRequest, updateTaskStatus } from '../services/TaskService';
import { RootState } from '../../../store';
import { Task } from '../models/task';

export interface TasksState {
  tasks: Task[];
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchError: string | null;
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  createError: string | null;
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateError: string | null;
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deleteError: string | null;
  archiveStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  archiveError: string | null;
}

export const initialState: TasksState = {
  tasks: [],
  fetchStatus: 'idle',
  fetchError: null,
  createStatus: 'idle',
  createError: null,
  updateStatus: 'idle',
  updateError: null,
  deleteStatus: 'idle',
  deleteError: null,
  archiveStatus: 'idle',
  archiveError: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    reorderTasksLocally(state, action: PayloadAction<{ updatedTasks: Task[] }>) {
      const { updatedTasks } = action.payload;
      state.tasks = updatedTasks;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasksAsync.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.fetchStatus = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError = 'Failed to load tasks.';
      });

    // Create Task
    builder
      .addCase(createTaskAsync.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        state.createStatus = 'succeeded';
        state.tasks.push(action.payload);
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.error.message || 'Failed to create task.';
      });

    // Update Task
    builder
      .addCase(updateTaskAsync.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        state.updateStatus = 'succeeded';
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index >= 0) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.error.message || 'Failed to update task.';
      });

    // Delete Task
    builder
      .addCase(deleteTaskAsync.pending, (state) => {
        state.deleteStatus = 'loading';
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteStatus = 'succeeded';
        const task = state.tasks.find(task => task.id === action.payload);
        if (task) {
          task.deletedAt = new Date().toISOString();
        }
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.error.message ||  'Failed to delete task.';
      });

    // Archive Task
    builder
      .addCase(archiveTaskAsync.pending, (state) => {
        state.archiveStatus = 'loading';
      })
      .addCase(archiveTaskAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.archiveStatus = 'succeeded';
        const task = state.tasks.find(task => task.id === action.payload);
        if (task) {
          task.archivedAt = new Date().toISOString();
        }
      })
      .addCase(archiveTaskAsync.rejected, (state, action) => {
        state.archiveStatus = 'failed';
        state.archiveError = action.error.message || 'Failed to archive task.';
      })
      .addCase(unarchiveTaskAsync.pending, (state) => {
        state.archiveStatus = 'loading';
      })
      .addCase(unarchiveTaskAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.archiveStatus = 'succeeded';
        const task = state.tasks.find(task => task.id === action.payload);
        if (task) {
          task.archivedAt = null;
        }
      })
      .addCase(unarchiveTaskAsync.rejected, (state, action) => {
        state.archiveStatus = 'failed';
        state.archiveError = action.error.message || 'Failed to unarchive task.';
      })

      // Update task status
      .addCase(updateTaskStatusAsync.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateTaskStatusAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        state.updateStatus = 'succeeded';
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index >= 0) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTaskStatusAsync.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.error.message || 'Failed to update task status.';
      });
  },
});

export const fetchTasksAsync = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      const response = await fetchTasks(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data || null);
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/createTaskAsync',
  async (task: CreateTaskRequest, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      const response = await createTask(task, token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTaskAsync',
  async (task: UpdateTaskRequest, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      const response = await updateTask(task, token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTaskAsync',
  async (taskId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      await deleteTask(taskId, token);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const archiveTaskAsync = createAsyncThunk(
  'tasks/archiveTaskAsync',
  async (taskId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      await archiveTask(taskId, token);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const unarchiveTaskAsync = createAsyncThunk(
  'tasks/unarchiveTaskAsync',
  async (taskId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      await unarchiveTask(taskId, token);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateTaskStatusAsync = createAsyncThunk(
  'tasks/updateTaskStatusAsync',
  async ({ id, status }: { id: string, status: string }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      const response = await updateTaskStatus({ id, status } as UpdateTaskRequest, token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const { reorderTasksLocally } = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
export default tasksSlice;
