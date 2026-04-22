import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { return await authService.register(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { return await authService.login(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { return await authService.getMe(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch user'); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try { return await authService.updateProfile(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Update failed'); }
});

// ─── Initial State ─────────────────────────────────────────────────────────────
const storedToken = localStorage.getItem('lms_token');
const storedUser  = (() => { try { return JSON.parse(localStorage.getItem('lms_user')); } catch { return null; } })();

const initialState = {
  user:      storedUser  || null,
  token:     storedToken || null,
  isLoading: false,
  error:     null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('lms_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // ── Register ──────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state)          => { state.isLoading = true;  state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user  = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('lms_token', action.payload.token);
        localStorage.setItem('lms_user',  JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    // ── Login ─────────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state)          => { state.isLoading = true;  state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user  = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('lms_token', action.payload.token);
        localStorage.setItem('lms_user',  JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    // ── Fetch Me ──────────────────────────────────────────────────────────────
    builder
      .addCase(fetchMe.pending, (state)          => { state.isLoading = true; })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        localStorage.setItem('lms_user', JSON.stringify(action.payload.user));
      })
      .addCase(fetchMe.rejected, (state) => { state.isLoading = false; state.user = null; state.token = null; });

    // ── Update Profile ────────────────────────────────────────────────────────
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('lms_user', JSON.stringify(action.payload.user));
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
