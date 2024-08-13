import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { archiveTask, createTask, CreateTaskRequest, deleteTask, fetchTasks, updateTask, UpdateTaskRequest } from '../services/TaskService';
import { RootState } from '../../../redux/store';
import { Task } from '../models/task';

interface TasksState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  status: 'idle',
  error: null,
};

export const fetchTasksAsync = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      const response = await fetchTasks(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as any).error as string || 'Failed to fetch tasks';
      })
      .addCase(createTaskAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        state.status = 'succeeded';
        state.tasks.push(action.payload);
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as any).error as string || 'Failed to create task';
      })
      .addCase(updateTaskAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        state.status = 'succeeded';
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index >= 0) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as any).error as string || 'Failed to update task';
      })
      .addCase(deleteTaskAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as any).error as string || 'Failed to delete task';
      });
  },
});

export default tasksSlice.reducer;
