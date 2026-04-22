import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseService from '../../services/courseService';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try { return await courseService.getCourses(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load courses'); }
});

export const fetchCourseById = createAsyncThunk('courses/fetchById', async (id, { rejectWithValue }) => {
  try { return await courseService.getCourseById(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load course'); }
});

export const fetchFeaturedCourses = createAsyncThunk('courses/featured', async (_, { rejectWithValue }) => {
  try { return await courseService.getFeaturedCourses(); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCategories = createAsyncThunk('courses/categories', async (_, { rejectWithValue }) => {
  try { return await courseService.getCategories(); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    list:       [],
    featured:   [],
    categories: [],
    current:    null,
    total:      0,
    pages:      1,
    isLoading:  false,
    error:      null,
  },
  reducers: {
    clearCurrentCourse(state) { state.current = null; },
    clearError(state)         { state.error   = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending,   (state)          => { state.isLoading = true;  state.error = null; })
      .addCase(fetchCourses.fulfilled, (state, action)  => {
        state.isLoading = false;
        state.list  = action.payload.courses;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchCourses.rejected,  (state, action)  => { state.isLoading = false; state.error = action.payload; });

    builder
      .addCase(fetchCourseById.pending,   (state)          => { state.isLoading = true;  state.error = null; state.current = null; })
      .addCase(fetchCourseById.fulfilled, (state, action)  => { state.isLoading = false; state.current = action.payload; })
      .addCase(fetchCourseById.rejected,  (state, action)  => { state.isLoading = false; state.error = action.payload; });

    builder
      .addCase(fetchFeaturedCourses.fulfilled, (state, action) => { state.featured = action.payload.courses; });

    builder
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload.categories; });
  },
});

export const { clearCurrentCourse, clearError } = courseSlice.actions;
export default courseSlice.reducer;
