import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createChiefdomEntry } from '../../utils/formHelpers';

// Async thunks for draft operations
export const saveDraft = createAsyncThunk(
  'draft/saveDraft',
  async ({ draftData, draftId }, { getState }) => {
    const state = getState();
    const { token } = state.auth;

    try {
      let response;
      if (draftId) {
        // Update existing draft
        const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'}/drafts/${draftId}`;
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ draft: draftData }),
        });
      } else {
        // Create new draft
        const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'}/drafts`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ draft: draftData }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        // eslint-disable-next-line no-console
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Save draft error:', error);
      throw error;
    }
  },
);

export const fetchDrafts = createAsyncThunk(
  'draft/fetchDrafts',
  async (_, { getState }) => {
    const state = getState();
    const { token } = state.auth;

    try {
      const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'}/drafts`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        // eslint-disable-next-line no-console
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fetch drafts error:', error);
      throw error;
    }
  },
);

export const submitDraft = createAsyncThunk(
  'draft/submitDraft',
  async (draftId, { getState }) => {
    const state = getState();
    const { token } = state.auth;

    try {
      const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'}/drafts/${draftId}/submit`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        // eslint-disable-next-line no-console
        console.error('Submit draft server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Submit draft error:', error);
      throw error;
    }
  },
);

export const deleteDraft = createAsyncThunk(
  'draft/deleteDraft',
  async (draftId, { getState }) => {
    const state = getState();
    const { token } = state.auth;

    try {
      const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'}/drafts/${draftId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        // eslint-disable-next-line no-console
        console.error('Delete draft server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // DELETE returns 204 No Content, so no JSON to parse
      return draftId;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Delete draft error:', error);
      throw error;
    }
  },
);

// Async thunks for reference data
export const fetchReferenceData = createAsyncThunk(
  'draft/fetchReferenceData',
  async () => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
    const [
      districtsResponse, chiefdomsResponse, fertilizersResponse, dealersResponse,
    ] = await Promise.all([
      fetch(`${baseUrl}/districts`),
      fetch(`${baseUrl}/chiefdoms`),
      fetch(`${baseUrl}/fertilizers`),
      fetch(`${baseUrl}/dealers`),
    ]);

    const districts = await districtsResponse.json();
    const chiefdoms = await chiefdomsResponse.json();
    const fertilizers = await fertilizersResponse.json();
    const dealers = await dealersResponse.json();

    return {
      districts, chiefdoms, fertilizers, dealers,
    };
  },
);

export const createNewDistrict = createAsyncThunk(
  'draft/createNewDistrict',
  async (districtData, { getState }) => {
    const state = getState();
    const { api } = state;
    const result = await api.endpoints.createDistrict.initiate(districtData);
    return result.data;
  },
);

export const createNewChiefdom = createAsyncThunk(
  'draft/createNewChiefdom',
  async (chiefdomData, { getState }) => {
    const state = getState();
    const { api } = state;
    const result = await api.endpoints.createChiefdom.initiate(chiefdomData);
    return result.data;
  },
);

export const createNewFertilizer = createAsyncThunk(
  'draft/createNewFertilizer',
  async (fertilizerData, { getState }) => {
    const state = getState();
    const { api } = state;
    const result = await api.endpoints.createFertilizer.initiate(fertilizerData);
    return result.data;
  },
);

const initialState = {
  // Draft data
  drafts: [],
  currentDraft: null,
  isLoadingDrafts: false,
  draftsError: null,

  // Current working draft (district form data)
  districtForm: {
    id: null,
    title: '',
    data: {
      districts: [],
    },
    // Fields for the modal when adding/editing a single district
    district: '',
    customDistrict: '',
    chiefdoms: [],
  },

  // Reference data
  districts: [],
  chiefdoms: [],
  fertilizers: [],
  dealers: [],
  referenceDataLoading: false,
  referenceDataError: null,

  // UI state
  isModalOpen: false,
  viewModalDraft: null,
  editModalDraft: null,
  deleteModalDraft: null,
  isSuccessMessageVisible: false,
  formError: '',
};

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    // Modal management
    openModal: (state) => {
      state.isModalOpen = true;
      state.formError = '';
      state.isSuccessMessageVisible = false;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.formError = '';
    },

    // Draft management
    setDistrictForm: (state, action) => {
      state.districtForm = { ...state.districtForm, ...action.payload };
    },
    resetDistrictForm: (state) => {
      state.districtForm = {
        id: null,
        title: '',
        data: { districts: [] },
        district: '',
        customDistrict: '',
        chiefdoms: [],
      };
    },
    prepareForNewDistrict: (state) => {
      // Re-initialize only the modal-specific fields for adding a new district
      state.districtForm = {
        ...state.districtForm,
        district: '',
        customDistrict: '',
        chiefdoms: [createChiefdomEntry()],
      };
      state.formError = '';
      state.isSuccessMessageVisible = false;
    },
    loadDraftIntoForm: (state, action) => {
      const draft = state.drafts.find((d) => d.id === action.payload);
      if (draft) {
        state.districtForm = {
          ...state.districtForm,
          id: draft.id,
          title: draft.title,
          data: draft.data,
          // Reset modal-specific fields when loading a draft
          district: '',
          customDistrict: '',
          chiefdoms: [],
        };
        state.formError = '';
        state.isSuccessMessageVisible = false;
      }
    },
    startNewDraft: (state) => {
      state.districtForm = {
        id: null,
        title: '',
        data: { districts: [] },
        district: '',
        customDistrict: '',
        chiefdoms: [],
      };
      state.formError = '';
      state.isSuccessMessageVisible = false;
    },

    // Draft viewing/editing
    openViewModal: (state, action) => {
      state.viewModalDraft = action.payload;
      state.isSuccessMessageVisible = false;
    },
    closeViewModal: (state) => {
      state.viewModalDraft = null;
    },
    openEditModal: (state, action) => {
      // Just set the draft to edit.
      // The modal component will handle converting Names to IDs if necessary.
      state.editModalDraft = action.payload;
      state.isSuccessMessageVisible = false;
    },
    closeEditModal: (state) => {
      state.editModalDraft = null;
    },
    openDeleteModal: (state, action) => {
      state.deleteModalDraft = action.payload;
      state.isSuccessMessageVisible = false;
    },
    closeDeleteModal: (state) => {
      state.deleteModalDraft = null;
    },

    // UI state
    setFormError: (state, action) => {
      state.formError = action.payload;
    },
    triggerSuccessMessage: (state) => {
      state.isSuccessMessageVisible = true;
    },
    hideSuccessMessage: (state) => {
      state.isSuccessMessageVisible = false;
    },

    // District form specific actions (from original districtSlice)
    setDistricts: (state, action) => {
      if (state.districtForm.data) {
        state.districtForm.data.districts = action.payload;
      }
    },
    addDistrict: (state, action) => {
      if (state.districtForm.data) {
        state.districtForm.data.districts.push(action.payload);
      }
    },
    updateDistrict: (state, action) => {
      const { id, updatedData } = action.payload;
      if (state.districtForm.data) {
        const index = state.districtForm.data.districts.findIndex((d) => d.id === id);
        if (index !== -1) {
          state.districtForm.data.districts[index] = {
            ...state.districtForm.data.districts[index],
            ...updatedData,
          };
        }
      }
    },
    removeDistrict: (state, action) => {
      if (state.districtForm.data) {
        state.districtForm.data.districts = state.districtForm.data.districts.filter(
          (d) => d.id !== action.payload,
        );
      }
    },
  },
  extraReducers: (builder) => {
    // Draft operations
    builder
      .addCase(saveDraft.pending, (state) => {
        state.isLoadingDrafts = true;
        state.draftsError = null;
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.isLoadingDrafts = false;
        if (!state.districtForm.id) {
          state.districtForm.id = action.payload.id;
        }
        // Only show success message if it's NOT an auto-save
        if (!action.meta.arg.isAutoSave) {
          state.isSuccessMessageVisible = true;
        }
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.isLoadingDrafts = false;
        state.draftsError = action.error.message;
      })
      .addCase(fetchDrafts.pending, (state) => {
        state.isLoadingDrafts = true;
        state.draftsError = null;
      })
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        state.isLoadingDrafts = false;
        state.drafts = action.payload;
        // Load the first draft into the form if available
        if (action.payload.length > 0 && !state.districtForm.id) {
          const firstDraft = action.payload[0];
          state.districtForm.id = firstDraft.id;
          state.districtForm.title = firstDraft.title;
          state.districtForm.data = firstDraft.data || { districts: [] };
        }
      })
      .addCase(fetchDrafts.rejected, (state, action) => {
        state.isLoadingDrafts = false;
        state.draftsError = action.error.message;
      })
      .addCase(submitDraft.pending, (state) => {
        state.isLoadingDrafts = true;
        state.draftsError = null;
      })
      .addCase(submitDraft.fulfilled, (state, action) => {
        state.isLoadingDrafts = false;
        state.isSuccessMessageVisible = true;
        // Remove submitted draft from current drafts
        state.drafts = state.drafts.filter((d) => d.id !== action.meta.arg);
        // Reset form
        draftSlice.caseReducers.resetDistrictForm(state);
        draftSlice.caseReducers.closeModal(state);
      })
      .addCase(submitDraft.rejected, (state, action) => {
        state.isLoadingDrafts = false;
        state.draftsError = action.error.message;
      });

    builder
      .addCase(deleteDraft.pending, (state) => {
        state.isLoadingDrafts = true;
        state.draftsError = null;
      })
      .addCase(deleteDraft.fulfilled, (state, action) => {
        state.isLoadingDrafts = false;
        state.drafts = state.drafts.filter((d) => d.id !== action.payload);
        state.isSuccessMessageVisible = true;
      })
      .addCase(deleteDraft.rejected, (state, action) => {
        state.isLoadingDrafts = false;
        state.draftsError = action.error.message;
      });

    // Reference data operations
    builder
      .addCase(fetchReferenceData.pending, (state) => {
        state.referenceDataLoading = true;
        state.referenceDataError = null;
      })
      .addCase(fetchReferenceData.fulfilled, (state, action) => {
        state.referenceDataLoading = false;
        const {
          districts, chiefdoms, fertilizers, dealers,
        } = action.payload;
        state.districts = districts;
        state.chiefdoms = chiefdoms;
        state.fertilizers = fertilizers;
        state.dealers = dealers;
      })
      .addCase(fetchReferenceData.rejected, (state, action) => {
        state.referenceDataLoading = false;
        state.referenceDataError = action.error.message;
      });

    // Create reference data
    builder
      .addCase(createNewDistrict.fulfilled, (state, action) => {
        state.districts.push(action.payload);
      })
      .addCase(createNewChiefdom.fulfilled, (state, action) => {
        state.chiefdoms.push(action.payload);
      })
      .addCase(createNewFertilizer.fulfilled, (state, action) => {
        state.fertilizers.push(action.payload);
      });
  },
});

export const {
  openModal,
  closeModal,
  setDistrictForm,
  resetDistrictForm,
  openViewModal,
  closeViewModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  setFormError,
  triggerSuccessMessage,
  hideSuccessMessage,
  setDistricts,
  addDistrict,
  updateDistrict,
  removeDistrict,
  loadDraftIntoForm,
  startNewDraft,
  prepareForNewDistrict,
} = draftSlice.actions;

export default draftSlice.reducer;
