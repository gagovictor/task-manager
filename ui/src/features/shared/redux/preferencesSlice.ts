// src/redux/preferencesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PreferencesState {
  theme: 'light' | 'dark';
  language: 'en' | 'es';
}

export const initialState: PreferencesState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  language: 'en',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      state.theme = newTheme;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'es'>) => {
      state.language = action.payload;
    },
  },
});

export const { toggleTheme, setLanguage } = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
export default preferencesSlice;
