import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import dotnetClient from "../../api/clients/dotnet";

export type SearchResult = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  postedAt?: string;
  [key: string]: any;
};

export type SearchState = {
  query: string;
  results: SearchResult[];
  total: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: { code: string; message: string; correlationId?: string };
  lastFetchedAt?: number;
};

const initialState: SearchState = {
  query: "",
  results: [],
  total: 0,
  status: "idle",
};

export const searchJobs = createAsyncThunk<
  { items: SearchResult[]; total: number },
  { q: string; page?: number; pageSize?: number }
>("search/query", async ({ q, page = 1, pageSize = 20 }, { rejectWithValue }) => {
  try {
    const resp = await dotnetClient.get("/search", { params: { q, page, pageSize } });
    const data = resp.data;
    const items: SearchResult[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    const total: number = typeof data?.total === "number" ? data.total : items.length;
    return { items, total };
  } catch (e: any) {
    // e is ApiError from interceptors.ts (mapAxiosError)
    return rejectWithValue({
      code: e.code || "SEARCH_ERROR",
      message: e.message || "Search failed",
      correlationId: e.correlationId,
    });
  }
});

const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    clear(state) {
      state.results = [];
      state.total = 0;
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchJobs.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload.items;
        state.total = action.payload.total;
        state.lastFetchedAt = Date.now();
      })
      .addCase(searchJobs.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload || { code: "SEARCH_ERROR", message: "Search failed" };
      });
  },
});

export const { setQuery, clear } = slice.actions;
export const searchReducer = slice.reducer;
export default slice.reducer;
