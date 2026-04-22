import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import courseReducer       from './slices/courseSlice';
import cartReducer         from './slices/cartSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    courses:      courseReducer,
    cart:         cartReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
