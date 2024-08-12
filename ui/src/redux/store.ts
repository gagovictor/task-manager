import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../features/tasks/redux/tasksSlice';
import authReducer from '../features/auth/redux/authSlice';

const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
