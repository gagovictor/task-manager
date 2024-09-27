import { createSlice } from '@reduxjs/toolkit';

export interface LoadingState {
  activeRequests: number;
}

export const initialState: LoadingState = {
  activeRequests: 0,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    startLoading(state) {
      state.activeRequests += 1;
    },
    finishLoading(state) {
      if (state.activeRequests > 0) {
        state.activeRequests -= 1;
      }
    },
  }
});

export const { startLoading, finishLoading } = loadingSlice.actions;
export const loadingReducer = loadingSlice.reducer;
export default loadingSlice;
