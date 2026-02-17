import { configureStore } from '@reduxjs/toolkit';
import connectionReducer from './connectionSlice.js';

export const store = configureStore({
  reducer: {
    connections: connectionReducer
  }
});