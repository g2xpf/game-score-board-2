import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Arcaea, Chunithm } from "../@types/common";
import assert from "assert";

export const asyncThunk = {
  arcaea: {
    initialize: createAsyncThunk("arcaea/initialize", async () => {
      return await window.electron.fetchScoreData("arcaea");
    }),
    remove: createAsyncThunk(
      "arcaea/remove",
      async (data: Arcaea.ScoreData) => {
        return await window.electron.removeScoreData("arcaea", data);
      }
    ),
    update: createAsyncThunk(
      "arcaea/update",
      async (data: Arcaea.ScoreData) => {
        return await window.electron.updateScoreData("arcaea", data);
      }
    ),
    insert: createAsyncThunk(
      "arcaea/insert",
      async (data: Arcaea.ScoreData) => {
        return await window.electron.insertScoreData("arcaea", data);
      }
    ),
  },
  chunithm: {
    initialize: createAsyncThunk("chunithm/initialize", async () => {
      return await window.electron.fetchScoreData("chunithm");
    }),
    remove: createAsyncThunk(
      "chunithm/remove",
      async (data: Chunithm.ScoreData) => {
        return await window.electron.removeScoreData("chunithm", data);
      }
    ),
    update: createAsyncThunk(
      "chunithm/update",
      async (data: Chunithm.ScoreData) => {
        return await window.electron.updateScoreData("chunithm", data);
      }
    ),
    insert: createAsyncThunk(
      "chunithm/insert",
      async (data: Chunithm.ScoreData) => {
        return await window.electron.insertScoreData("chunithm", data);
      }
    ),
  },
};

export type GlobalState = {
  arcaea: Arcaea.ScoreData[] | null;
  chunithm: Chunithm.ScoreData[] | null;
};

const initialState: GlobalState = {
  arcaea: null,
  chunithm: null,
};

const slice = createSlice({
  name: "global",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(asyncThunk.arcaea.initialize.fulfilled, (state, action) => {
        state.arcaea = [...action.payload];
      })
      .addCase(asyncThunk.chunithm.initialize.fulfilled, (state, action) => {
        state.chunithm = [...action.payload];
      })
      .addCase(asyncThunk.arcaea.insert.fulfilled, (state, action) => {
        if (typeof action.payload !== "undefined" && state.arcaea !== null) {
          state.arcaea = [...state.arcaea, action.payload];
        }
      })
      .addCase(asyncThunk.chunithm.insert.fulfilled, (state, action) => {
        if (typeof action.payload !== "undefined" && state.chunithm !== null) {
          state.chunithm = [...state.chunithm, action.payload];
        }
      })
      .addCase(asyncThunk.arcaea.update.fulfilled, (state, action) => {
        if (typeof action.payload !== "undefined" && state.arcaea !== null) {
          const index = state.arcaea.findIndex(
            (data) =>
              data.name === action.payload?.name &&
              data.difficulty === action.payload?.difficulty
          );
          assert(index >= 0);
          state.arcaea = [
            ...state.arcaea.slice(0, index),
            action.payload,
            ...state.arcaea.slice(index + 1, state.arcaea.length),
          ];
        }
      })
      .addCase(asyncThunk.chunithm.update.fulfilled, (state, action) => {
        if (typeof action.payload !== "undefined" && state.chunithm !== null) {
          const index = state.chunithm.findIndex(
            (data) =>
              data.name === action.payload?.name &&
              data.difficulty === action.payload?.difficulty
          );
          assert(index >= 0);
          state.chunithm = [
            ...state.chunithm.slice(0, index),
            action.payload,
            ...state.chunithm.slice(index + 1, state.chunithm.length),
          ];
        }
      })
      .addCase(asyncThunk.arcaea.remove.fulfilled, (state, action) => {
        if (typeof action.payload !== "undefined" && state.arcaea !== null) {
          const index = state.arcaea.findIndex(
            (data) =>
              data.name === action.payload?.name &&
              data.difficulty === action.payload?.difficulty
          );
          assert(index >= 0);
          state.arcaea = [
            ...state.arcaea.slice(0, index),
            ...state.arcaea.slice(index + 1, state.arcaea.length),
          ];
        }
      })
      .addCase(asyncThunk.chunithm.remove.fulfilled, (state, action) => {
        if (typeof action.payload !== "undefined" && state.chunithm !== null) {
          const index = state.chunithm.findIndex(
            (data) =>
              data.name === action.payload?.name &&
              data.difficulty === action.payload?.difficulty
          );
          assert(index >= 0);
          state.chunithm = [
            ...state.chunithm.slice(0, index),
            ...state.chunithm.slice(index + 1, state.chunithm.length),
          ];
        }
      });
  },
});

export default slice.reducer;
