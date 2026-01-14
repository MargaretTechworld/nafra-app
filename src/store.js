import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import districtReducer from './features/district/districtSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    district: districtReducer,
  },
});

export default store;
