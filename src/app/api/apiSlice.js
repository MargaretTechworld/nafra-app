import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logOut } from '../../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const { token } = getState().auth;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Unauthorized: Logging out
    api.dispatch(logOut());
  }

  return result;
};

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Authentication Endpoints
    adminSetup: builder.mutation({
      query: (adminData) => ({
        url: '/auth/admin-setup',
        method: 'POST',
        body: adminData,
      }),
    }),
    agencySetup: builder.mutation({
      query: (agencyData) => ({
        url: '/auth/agency-setup',
        method: 'POST',
        body: agencyData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // User Management Endpoints
    listUsers: builder.query({
      query: () => '/admin/users',
    }),
    getUser: builder.query({
      query: (id) => `/admin/users/${id}`,
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
    }),

    // Agency Management Endpoints
    listAgencies: builder.query({
      query: () => '/admin/agencies',
    }),
    createAgency: builder.mutation({
      query: (agencyData) => ({
        url: '/admin/agencies',
        method: 'POST',
        body: agencyData,
      }),
    }),

    // Submissions Management Endpoints
    listSubmissions: builder.query({
      query: (params) => ({
        url: '/submissions',
        params,
      }),
    }),
    createSubmission: builder.mutation({
      query: (submissionData) => ({
        url: '/submissions',
        method: 'POST',
        body: submissionData,
      }),
    }),

    // Analytics Endpoints
    bagsByDistrict: builder.query({
      query: () => '/admin/analytics/bags-by-district',
    }),
    bagsByAgency: builder.query({
      query: () => '/admin/analytics/bags-by-agency',
    }),
  }),
});

// Export hooks generated for each endpoint
export const {
  useAdminSetupMutation,
  useAgencySetupMutation,
  useLoginMutation,
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useListAgenciesQuery,
  useCreateAgencyMutation,
  useListSubmissionsQuery,
  useCreateSubmissionMutation,
  useBagsByDistrictQuery,
  useBagsByAgencyQuery,
} = apiSlice;

export default apiSlice.reducer;
export { apiSlice };
