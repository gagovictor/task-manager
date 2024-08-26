import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/redux/authSlice';
import tasksReducer from './features/tasks/redux/tasksSlice';
import { initialState as tasksState } from './features/tasks/redux/tasksSlice';
import { initialState as authState } from './features/auth/redux/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
  },
});

export const initialState = {
  auth: authState,
  tasks: tasksState
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
