import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formValues: {
    agencyName: '',
    projectName: '',
    ministry: '',
    agencyEmail: '',
    password: '',
    confirmPassword: '',
  },
  errors: {},
  showSuccess: false,
};

const agencySlice = createSlice({
  name: 'agency',
  initialState,
  reducers: {
    setFormValues(state, action) {
      state.formValues = { ...state.formValues, ...action.payload };
    },
    setErrors(state, action) {
      state.errors = action.payload;
    },
    toggleSuccess(state) {
      state.showSuccess = !state.showSuccess;
    },
    resetForm(state) {
      state.formValues = initialState.formValues;
      state.errors = {};
      state.showSuccess = false;
    },
  },
});

export const {
  setFormValues, setErrors, toggleSuccess, resetForm,
} = agencySlice.actions;
export default agencySlice.reducer;
