import { combineSlices, configureStore } from '@reduxjs/toolkit';
import tasksSlice, { TasksState, initialState as tasksState } from './features/tasks/redux/tasksSlice';
import authSlice, { AuthState, initialState as authState } from './features/auth/redux/authSlice';

export const rootReducer = combineSlices(authSlice, tasksSlice);

export const initialState = {
  auth: authState,
  tasks: tasksState
};

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  })
}

export type RootState = {
  auth: AuthState;
  tasks: TasksState;
};

export type AppDispatch = typeof store.dispatch;

const store = setupStore(initialState);

export default store;
