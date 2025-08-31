import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { jobsService } from '../../api/services/jobs';
import type { Job } from '../../api/types/job';
import type { Paged } from '../../api/types/common';

interface JobsState { items: Job[]; total: number; loading: boolean; error?: string | null; }
const initialState: JobsState = { items: [], total: 0, loading: false, error: null };

export const fetchJobs = createAsyncThunk('jobs/list', async (query?: any) => {
  const res = await jobsService.list(query);
  return res as Paged<Job>;
});

const slice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchJobs.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchJobs.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.items; s.total = a.payload.total; })
      .addCase(fetchJobs.rejected, (s, a) => { s.loading = false; s.error = (a.error.message || 'Failed to load jobs'); });
  }
});

export default slice.reducer;
