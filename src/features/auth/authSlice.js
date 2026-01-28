import { createSlice } from '@reduxjs/toolkit';

// Validate JWT token
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// Load initial state from localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem('authState');

    if (serializedState === null) {
      return {
        user: null,
        token: null,
        role: null,
        userId: null,
        isAuthenticated: false,
      };
    }
    const parsedState = JSON.parse(serializedState);

    // Check if token is still valid
    if (parsedState.token && !isTokenValid(parsedState.token)) {
      // Token expired, clear localStorage and return initial state
      localStorage.removeItem('authState');
      return {
        user: null,
        token: null,
        role: null,
        userId: null,
        isAuthenticated: false,
      };
    }

    const finalState = {
      ...parsedState,
      isAuthenticated: !!parsedState.token,
    };
    return finalState;
  } catch (error) {
    // Clear corrupted data
    localStorage.removeItem('authState');
    return {
      user: null,
      token: null,
      role: null,
      userId: null,
      isAuthenticated: false,
    };
  }
};

// Save auth state to localStorage
const saveAuthState = (state) => {
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      token: state.token,
      role: state.role,
      userId: state.userId,
    });
    localStorage.setItem('authState', serializedState);
  } catch (error) {
    // Ignore write errors
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuthState(),
  reducers: {
    setCredentials: (state, action) => {
      const {
        token, role, userId, user,
      } = action.payload;
      state.token = token;
      state.role = role;
      state.userId = userId;
      state.user = user;
      state.isAuthenticated = !!token;
      // Save to localStorage
      saveAuthState(state);
    },
    logOut: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      state.user = null;
      state.isAuthenticated = false;
      // Clear localStorage
      localStorage.removeItem('authState');
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;
