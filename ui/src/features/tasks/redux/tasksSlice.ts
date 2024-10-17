import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { archiveTask, createTask, CreateTaskRequest, deleteTask, fetchTasks, unarchiveTask, updateTask, UpdateTaskRequest, updateTaskStatus } from '../services/TaskService';
import { RootState } from '../../../redux/store';
import { Task } from '../models/task';
import { loadTasksFromLocalStorage, saveTasksToLocalStorage } from './persistTasks';
import { FetchTasksParams, PaginatedResponse } from '../models/api';

export interface TasksState {
  tasks: Task[];
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchError: string | null;
  hasMore: boolean;
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
  tasks: loadTasksFromLocalStorage() || [],
  fetchStatus: 'idle',
  fetchError: null,
  hasMore: true,
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
      saveTasksToLocalStorage(state.tasks);
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasksAsync.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        // TODO store archived tasks in a separate property so that the tasks list is not reset between views.
        let incomingTasks = action.payload.items || [];
        if (action.meta.arg.page === 1) {
          // If fetching from page, replace the tasks
          state.tasks = incomingTasks;
        } else {
          state.tasks.forEach((task, index) => {
            const updatedTaskIndex = incomingTasks.findIndex(t => t.id == task.id);
            if(updatedTaskIndex > -1) {
              state.tasks[index] = incomingTasks[updatedTaskIndex];
              incomingTasks.splice(updatedTaskIndex, 1);
            }
          });
          state.tasks = [
            ...state.tasks,
            ...incomingTasks
          ];
        }
        // Determine if more tasks are available
        state.hasMore = (action.payload.items?.length || 0) >= (action.meta.arg.limit || 20);
        saveTasksToLocalStorage(state.tasks);
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError = 'Failed to load tasks.';
        state.hasMore = false;
      });

    // Create Task
    builder
      .addCase(createTaskAsync.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        state.createStatus = 'succeeded';
        state.tasks.push(action.payload);
        saveTasksToLocalStorage(state.tasks);
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
        saveTasksToLocalStorage(state.tasks);
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
        saveTasksToLocalStorage(state.tasks);
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
        saveTasksToLocalStorage(state.tasks);
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
        saveTasksToLocalStorage(state.tasks);
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
        saveTasksToLocalStorage(state.tasks);
      })
      .addCase(updateTaskStatusAsync.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.error.message || 'Failed to update task status.';
      });
  },
});


export const fetchTasksAsync = createAsyncThunk<
  PaginatedResponse<Task>,
  FetchTasksParams,
  { state: RootState; rejectValue: any }
>(
  'tasks/fetchTasks',
  async (params, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;

    try {
      const response = await fetchTasks(token, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch tasks.');
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
