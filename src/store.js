import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice'; // Import auth slice
import agencyReducer from './features/agency/agencySlice'; // Import agency slice
import districtReducer from './features/district/districtSlice'; // Import district slice
import draftReducer from './features/draft/draftSlice'; // Import draft slice
import { apiSlice } from './app/api/apiSlice'; // Import the api slice

const store = configureStore({
  reducer: {
    auth: authReducer,
    agency: agencyReducer, // Add agency slice
    district: districtReducer, // Add district slice
    draft: draftReducer, // Add draft slice
    [apiSlice.reducerPath]: apiSlice.reducer, // Add api slice to the store
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
