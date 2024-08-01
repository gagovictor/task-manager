import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/redux/authSlice';
import tasksReducer from './features/tasks/redux/tasksSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
