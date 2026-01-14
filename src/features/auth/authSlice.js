import { createSlice } from '@reduxjs/toolkit';

const DUMMY_USER = {
  email: 'admin@nafra.gov',
  password: 'password123',
  name: 'NaFRA Administrator',
  agency: 'NaFRA',
};

const initialState = {
  user: null,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { email, password } = action.payload;
      const normalizedEmail = email?.trim().toLowerCase();
      const isValidUser = normalizedEmail === DUMMY_USER.email && password === DUMMY_USER.password;

      if (isValidUser) {
        state.isAuthenticated = true;
        state.user = {
          name: DUMMY_USER.name,
          email: DUMMY_USER.email,
          agency: DUMMY_USER.agency,
        };
        state.error = null;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.error = 'Invalid email or password. Please try again.';
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
