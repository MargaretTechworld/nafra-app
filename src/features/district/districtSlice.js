import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  districts: [],
  isModalOpen: false,
  districtForm: {
    district: '',
    customDistrict: '',
    chiefdoms: [],
  },
  districtErrors: {
    district: '',
    customDistrict: '',
  },
  formError: '',
  // District action modals state
  viewModalDistrict: null,
  editModalDistrict: null,
  deleteModalDistrict: null,
};

const districtSlice = createSlice({
  name: 'district',
  initialState,
  reducers: {
    setDistricts(state, action) {
      state.districts = action.payload;
    },
    openModal(state) {
      state.isModalOpen = true;
      state.districtForm = {
        district: '',
        customDistrict: '',
        chiefdoms: [],
      };
      state.districtErrors = {};
      state.formError = '';
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.districtForm = null;
      state.districtErrors = {};
      state.formError = '';
    },
    setDistrictForm(state, action) {
      state.districtForm = action.payload;
    },
    setDistrictErrors(state, action) {
      state.districtErrors = action.payload;
    },
    setFormError(state, action) {
      state.formError = action.payload;
    },
    openViewModal(state, action) {
      state.viewModalDistrict = action.payload;
    },
    closeViewModal(state) {
      state.viewModalDistrict = null;
    },
    openEditModal(state, action) {
      state.editModalDistrict = action.payload;
    },
    closeEditModal(state) {
      state.editModalDistrict = null;
    },
    openDeleteModal(state, action) {
      state.deleteModalDistrict = action.payload;
    },
    closeDeleteModal(state) {
      state.deleteModalDistrict = null;
    },
    addDistrict(state, action) {
      state.districts.push(action.payload);
    },
    updateDistrict(state, action) {
      const { id, updatedData } = action.payload;
      const index = state.districts.findIndex((district) => district.id === id);
      if (index !== -1) {
        state.districts[index] = { ...state.districts[index], ...updatedData };
      }
    },
    deleteDistrict(state, action) {
      state.districts = state.districts.filter((district) => district.id !== action.payload);
    },
  },
});

export const {
  setDistricts,
  openModal,
  closeModal,
  setDistrictForm,
  setDistrictErrors,
  setFormError,
  openViewModal,
  closeViewModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  addDistrict,
  updateDistrict,
  deleteDistrict,
} = districtSlice.actions;

export default districtSlice.reducer;
