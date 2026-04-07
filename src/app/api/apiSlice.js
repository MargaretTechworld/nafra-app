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
    bagsByFertilizer: builder.query({
      query: () => '/admin/analytics/bags-by-fertilizer',
    }),
    agencyDistrictDistribution: builder.query({
      query: ({ agencyId, districtId }) => ({
        url: '/admin/analytics/agency-district-distribution',
        params: { agency_id: agencyId, district_id: districtId },
      }),
    }),
    dealersByRegion: builder.query({
      query: () => '/admin/analytics/dealers-by-region',
    }),
    dealersByDistrict: builder.query({
      query: () => '/admin/analytics/dealers-by-district',
    }),
    licenseStatusSummary: builder.query({
      query: () => '/admin/analytics/license-status-summary',
    }),
    dealerOperationalCoverage: builder.query({
      query: () => '/admin/analytics/dealer-operational-coverage',
    }),

    // Reference Data Endpoints
    adminGetDistricts: builder.query({
      query: () => '/admin/districts',
      providesTags: ['Districts'],
    }),
    adminCreateDistrict: builder.mutation({
      query: (districtData) => ({
        url: '/admin/districts',
        method: 'POST',
        body: { district: districtData },
      }),
      invalidatesTags: ['Districts'],
    }),
    adminUpdateDistrict: builder.mutation({
      query: ({ id, ...districtData }) => ({
        url: `/admin/districts/${id}`,
        method: 'PUT',
        body: { district: districtData },
      }),
      invalidatesTags: ['Districts'],
    }),
    adminDeleteDistrict: builder.mutation({
      query: (id) => ({
        url: `/admin/districts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Districts'],
    }),
    getChiefdoms: builder.query({
      query: (districtId) => ({
        url: '/chiefdoms',
        params: districtId ? { district_id: districtId } : {},
      }),
    }),
    adminGetChiefdoms: builder.query({
      query: () => '/admin/chiefdoms',
      providesTags: ['Chiefdoms'],
    }),
    adminCreateChiefdom: builder.mutation({
      query: (chiefdomData) => ({
        url: '/admin/chiefdoms',
        method: 'POST',
        body: { chiefdom: chiefdomData },
      }),
      invalidatesTags: ['Chiefdoms'],
    }),
    adminUpdateChiefdom: builder.mutation({
      query: ({ id, ...chiefdomData }) => ({
        url: `/admin/chiefdoms/${id}`,
        method: 'PUT',
        body: { chiefdom: chiefdomData },
      }),
      invalidatesTags: ['Chiefdoms'],
    }),
    adminDeleteChiefdom: builder.mutation({
      query: (id) => ({
        url: `/admin/chiefdoms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chiefdoms'],
    }),
    getFertilizers: builder.query({
      query: () => '/fertilizers',
    }),
    adminGetFertilizers: builder.query({
      query: () => '/admin/fertilizers',
      providesTags: ['Fertilizers'],
    }),
    adminCreateFertilizer: builder.mutation({
      query: (fertilizerData) => ({
        url: '/admin/fertilizers',
        method: 'POST',
        body: { fertilizer: fertilizerData },
      }),
      invalidatesTags: ['Fertilizers'],
    }),
    adminUpdateFertilizer: builder.mutation({
      query: ({ id, ...fertilizerData }) => ({
        url: `/admin/fertilizers/${id}`,
        method: 'PUT',
        body: { fertilizer: fertilizerData },
      }),
      invalidatesTags: ['Fertilizers'],
    }),
    adminDeleteFertilizer: builder.mutation({
      query: (id) => ({
        url: `/admin/fertilizers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Fertilizers'],
    }),
    getRegions: builder.query({
      query: () => '/regions',
    }),
    adminGetRegions: builder.query({
      query: () => '/admin/regions',
      providesTags: ['Regions'],
    }),
    adminCreateRegion: builder.mutation({
      query: (regionData) => ({
        url: '/admin/regions',
        method: 'POST',
        body: { region: regionData },
      }),
      invalidatesTags: ['Regions'],
    }),
    adminUpdateRegion: builder.mutation({
      query: ({ id, ...regionData }) => ({
        url: `/admin/regions/${id}`,
        method: 'PUT',
        body: { region: regionData },
      }),
      invalidatesTags: ['Regions'],
    }),
    adminDeleteRegion: builder.mutation({
      query: (id) => ({
        url: `/admin/regions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Regions'],
    }),
    getTownships: builder.query({
      query: () => '/townships',
    }),
    adminGetTownships: builder.query({
      query: () => '/admin/townships',
      providesTags: ['Townships'],
    }),
    adminCreateTownship: builder.mutation({
      query: (townshipData) => ({
        url: '/admin/townships',
        method: 'POST',
        body: { township: townshipData },
      }),
      invalidatesTags: ['Townships'],
    }),
    adminUpdateTownship: builder.mutation({
      query: ({ id, ...townshipData }) => ({
        url: `/admin/townships/${id}`,
        method: 'PUT',
        body: { township: townshipData },
      }),
      invalidatesTags: ['Townships'],
    }),
    adminDeleteTownship: builder.mutation({
      query: (id) => ({
        url: `/admin/townships/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Townships'],
    }),
    getDealers: builder.query({
      query: () => '/dealers',
    }),
    adminGetDealers: builder.query({
      query: () => '/admin/dealers',
      providesTags: ['Dealers'],
    }),
    adminCreateDealer: builder.mutation({
      query: (dealerData) => ({
        url: '/admin/dealers',
        method: 'POST',
        body: { dealer: dealerData },
      }),
      invalidatesTags: ['Dealers'],
    }),
    adminUpdateDealer: builder.mutation({
      query: ({ id, ...dealerData }) => ({
        url: `/admin/dealers/${id}`,
        method: 'PUT',
        body: { dealer: dealerData },
      }),
      invalidatesTags: ['Dealers'],
    }),
    adminDeleteDealer: builder.mutation({
      query: (id) => ({
        url: `/admin/dealers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Dealers'],
    }),

    // Draft Management Endpoints
    getDrafts: builder.query({
      query: () => '/drafts',
    }),
    getDraft: builder.query({
      query: (id) => `/drafts/${id}`,
    }),
    createDraft: builder.mutation({
      query: (draftData) => ({
        url: '/drafts',
        method: 'POST',
        body: draftData,
      }),
    }),
    updateDraft: builder.mutation({
      query: ({ id, ...draftData }) => ({
        url: `/drafts/${id}`,
        method: 'PUT',
        body: draftData,
      }),
    }),
    deleteDraft: builder.mutation({
      query: (id) => ({
        url: `/drafts/${id}`,
        method: 'DELETE',
      }),
    }),
    submitDraft: builder.mutation({
      query: (id) => ({
        url: `/drafts/${id}/submit`,
        method: 'POST',
      }),
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
  useBagsByFertilizerQuery,
  useAgencyDistrictDistributionQuery,
  useDealersByRegionQuery,
  useDealersByDistrictQuery,
  useLicenseStatusSummaryQuery,
  useDealerOperationalCoverageQuery,
  useAdminGetDealersQuery,
  useAdminCreateDealerMutation,
  useAdminUpdateDealerMutation,
  useAdminDeleteDealerMutation,
  useAdminGetRegionsQuery,
  useAdminCreateRegionMutation,
  useAdminUpdateRegionMutation,
  useAdminDeleteRegionMutation,
  useAdminGetDistrictsQuery,
  useAdminCreateDistrictMutation,
  useAdminUpdateDistrictMutation,
  useAdminDeleteDistrictMutation,
  useAdminGetChiefdomsQuery,
  useAdminCreateChiefdomMutation,
  useAdminUpdateChiefdomMutation,
  useAdminDeleteChiefdomMutation,
  useAdminGetTownshipsQuery,
  useAdminCreateTownshipMutation,
  useAdminUpdateTownshipMutation,
  useAdminDeleteTownshipMutation,
  useAdminGetFertilizersQuery,
  useAdminCreateFertilizerMutation,
  useAdminUpdateFertilizerMutation,
  useAdminDeleteFertilizerMutation,
  useGetDistrictsQuery,
  useGetChiefdomsQuery,
  useGetFertilizersQuery,
  useGetRegionsQuery,
  useGetTownshipsQuery,
  useGetDealersQuery,
  useGetDraftsQuery,
  useGetDraftQuery,
  useCreateDraftMutation,
  useUpdateDraftMutation,
  useDeleteDraftMutation,
  useSubmitDraftMutation,
} = apiSlice;

export default apiSlice.reducer;
export { apiSlice };
