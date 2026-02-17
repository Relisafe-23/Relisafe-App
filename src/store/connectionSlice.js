import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connections: [],
  savedSources: {}   // structure: { module: { rowId: { field: value } } }
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {

    setConnections: (state, action) => {
      state.connections = action.payload;
    },

    // When source value is entered
    markSourceSaved: (state, action) => {
      const { moduleName, rowId, fieldName, value } = action.payload;

      if (!state.savedSources[moduleName]) {
        state.savedSources[moduleName] = {};
      }

      if (!state.savedSources[moduleName][rowId]) {
        state.savedSources[moduleName][rowId] = {};
      }

      state.savedSources[moduleName][rowId][fieldName] = value;
    },

    // When source is cleared
    clearRowSources: (state, action) => {
      const { moduleName, rowId } = action.payload;

      if (state.savedSources[moduleName]?.[rowId]) {
        delete state.savedSources[moduleName][rowId];
      }
    }
  }
});

export const {
  setConnections,
  markSourceSaved,
  clearRowSources
} = connectionSlice.actions;

export default connectionSlice.reducer;
