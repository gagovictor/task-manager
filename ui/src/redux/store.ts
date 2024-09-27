import { combineSlices, configureStore } from '@reduxjs/toolkit';
import tasksSlice, { TasksState, initialState as tasksState } from '../features/tasks/redux/tasksSlice';
import authSlice, { AuthState, initialState as authState } from '../features/auth/redux/authSlice';
import loadingSlice, { LoadingState, initialState as loadingState } from '../features/shared/redux/loadingSlice';
import preferencesSlice, { PreferencesState, initialState as preferencesState } from '../features/shared/redux/preferencesSlice';
import loadingMiddleware from '../features/shared/redux/loadingMiddleware';

export const rootReducer = combineSlices(authSlice, tasksSlice, loadingSlice, preferencesSlice);

export type RootState = {
  auth: AuthState;
  tasks: TasksState;
  loading: LoadingState;
  preferences: PreferencesState;
};

export const initialState = {
  auth: authState,
  tasks: tasksState,
  loading: loadingState,
  preferences: preferencesState,
};

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(loadingMiddleware), 
  })
}

export type AppDispatch = typeof store.dispatch;

const store = setupStore(initialState);

export default store;
