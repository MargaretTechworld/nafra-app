import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './styles/NafraDataForm.css';
import Header from './Header';
import NotificationSection from './NotificationSection';
import TabNavigation from './TabNavigation';
import RecordsList from './RecordsList';
import ChiefdomCard from './ChiefdomCard';
import { FormLabel, FieldError } from './ui/FormElements';
import {
  fetchReferenceData,
  saveDraft,
  fetchDrafts,
  submitDraft,
  openModal,
  closeModal,
  setDistrictForm,
  setFormError,
  triggerSuccessMessage, // Added triggerSuccessMessage
  hideSuccessMessage,
  openViewModal,
  closeViewModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  prepareForNewDistrict,
} from '../features/draft/draftSlice';
import { logOut } from '../features/auth/authSlice';
import DistrictViewModal from './DistrictViewModal';
import DistrictEditModal from './DistrictEditModal';
import DistrictDeleteModal from './DistrictDeleteModal';
import {
  getDistrictOptions,
  getFertilizerOptions,
  getDealerOptions,
} from '../constants/referenceData';

import {
  DUPLICATE_ERRORS,
  resetChiefdomValidationErrors,
  clearChiefdomError,
  setChiefdomError,
  clearFertilizerError,
  addFertilizerValidationError,
  removeFertilizerValidationError,
  setFertilizerError,
  validateDistrictSelection,
  createFertilizerEntry,
  createChiefdomEntry,
  hasDuplicateChiefdomName,
  hasDuplicateFertilizerName,
  validateChiefdomEntry,
  uniqueId,
} from '../utils/formHelpers';

export default function NafraDataForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get state from draft slice
  const draftState = useSelector((state) => state.draft);
  const authState = useSelector((state) => state.auth);

  const {
    districtForm,
    formError,
    draftsError,
    viewModalDraft,
    editModalDraft,
    deleteModalDraft,
    isSuccessMessageVisible,
    isModalOpen,
    isLoadingDrafts,
    districts: referenceDistricts, // Change from referenceDistricts to districts
    chiefdoms: referenceChiefdoms,
    fertilizers: referenceFertilizers,
    dealers: referenceDealers,
  } = draftState;

  const { isAuthenticated } = authState;

  // State for view tabs and confirmation modal
  const [viewTab, setViewTab] = useState('active'); // 'active', 'submissions'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previousSubmissions, setPreviousSubmissions] = useState([]);

  // Fetch reference data on component mount
  useEffect(() => {
    dispatch(fetchReferenceData());

    // One-time cleanup of legacy localStorage data for drafts and submissions
    try {
      window.localStorage.removeItem('nafra-submissions');
      window.localStorage.removeItem('nafra-drafts');
      // eslint-disable-next-line no-console
      console.log('Cleaned up legacy localStorage data.');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('LocalStorage cleanup failed', e);
    }
  }, [dispatch]);

  // Fetch saved drafts when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDrafts());
    }
  }, [dispatch, isAuthenticated]);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (isSuccessMessageVisible) {
      const timer = setTimeout(() => {
        dispatch(hideSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSuccessMessageVisible, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(logOut());
      navigate('/login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  // Memoized computed values (must be before early return)
  const districtOptions = useMemo(
    () => getDistrictOptions(referenceDistricts),
    [referenceDistricts],
  );
  const fertilizerOptions = useMemo(
    () => getFertilizerOptions(referenceFertilizers),
    [referenceFertilizers],
  );
  const dealerOptions = useMemo(
    () => getDealerOptions(referenceDealers),
    [referenceDealers],
  );

  // Calculate totals for the modal's current data
  const modalBagTotals = useMemo(
    () => {
      if (!districtForm.chiefdoms || !Array.isArray(districtForm.chiefdoms)) {
        return { total25: 0, total50: 0 };
      }
      return districtForm.chiefdoms.reduce(
        (totals, chiefdom) => {
          const chiefdomTotals = chiefdom.fertilizers.reduce(
            (fertAcc, fertilizer) => {
              const bag25kgCount = Number(fertilizer.bag25kg) || 0;
              const bag50kgCount = Number(fertilizer.bag50kg) || 0;
              return {
                total25: fertAcc.total25 + bag25kgCount,
                total50: fertAcc.total50 + bag50kgCount,
              };
            },
            { total25: 0, total50: 0 },
          );
          return {
            total25: totals.total25 + chiefdomTotals.total25,
            total50: totals.total50 + chiefdomTotals.total50,
          };
        },
        { total25: 0, total50: 0 },
      );
    },
    [districtForm.chiefdoms],
  );

  // Helper function to get district label
  const getDistrictLabel = (value, customValue) => {
    if (value === 'custom') {
      return customValue.trim();
    }
    return districtOptions.find((option) => option.value === value)?.label || '';
  };

  if (!isAuthenticated) {
    return null;
  }

  const handleOpenModal = () => {
    dispatch(prepareForNewDistrict());
    dispatch(openModal());
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  // District action handlers
  const handleViewDistrict = (district) => {
    dispatch(openViewModal(district));
  };

  const handleCloseViewModal = () => {
    dispatch(closeViewModal());
  };

  const handleEditDistrict = (district) => {
    dispatch(openEditModal(district));
  };

  const handleCloseEditModal = () => {
    dispatch(closeEditModal());
  };

  const handleDeleteDistrict = (district) => {
    dispatch(openDeleteModal(district));
  };

  const handleCloseDeleteModal = () => {
    dispatch(closeDeleteModal());
  };

  const handleDistrictChange = (event) => {
    const { value } = event.target;
    if (!districtForm) return;

    // Only show error if no district is selected
    if (!value) {
      dispatch(setFormError('Please select a district before continuing.'));
    } else {
      dispatch(setFormError('')); // Clear error when district is selected
    }

    dispatch(setDistrictForm({
      ...districtForm,
      district: value,
      customDistrict: value === 'custom' ? districtForm.customDistrict : '',
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => ({
        ...chiefdom,
        name: '',
        useCustomName: false,
        customName: '',
        isCollapsed: false,
        validationErrors: resetChiefdomValidationErrors(chiefdom),
      })),
    }));
  };

  const handleCustomDistrictChange = (event) => {
    if (!districtForm) return;

    dispatch(setFormError(''));
    dispatch(setDistrictForm({
      ...districtForm,
      customDistrict: event.target.value,
    }));
  };

  const hdlChfSlct = (chiefdomId, value) => {
    if (!districtForm) return;

    // Find the chiefdom name from reference data
    const selectedChiefdom = value !== 'custom'
      ? referenceChiefdoms.find((c) => c.id.toString() === value)
      : null;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }
        const validationErrors = chiefdom.validationErrors
          || resetChiefdomValidationErrors(chiefdom);
        const chiefdomName = selectedChiefdom ? selectedChiefdom.name : value;
        const isDuplicate = value !== 'custom'
          && hasDuplicateChiefdomName(districtForm.chiefdoms, chiefdomId, chiefdomName);
        const nextErrors = isDuplicate
          ? setChiefdomError(validationErrors, 'name', DUPLICATE_ERRORS.chiefdom)
          : clearChiefdomError(validationErrors, 'name');
        if (value === 'custom') {
          return {
            ...chiefdom,
            useCustomName: true,
            name: '',
            customName: '',
            isCollapsed: false,
            validationErrors: nextErrors,
          };
        }
        return {
          ...chiefdom,
          useCustomName: false,
          name: value, // Store the chiefdom ID, not the name
          customName: '',
          isCollapsed: false,
          validationErrors: nextErrors,
        };
      }),
    }));
  };

  const handleChiefdomFieldChange = (chiefdomId, field, value) => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }
        const baseErrors = chiefdom.validationErrors
          || resetChiefdomValidationErrors(chiefdom);
        let updatedErrors = baseErrors;
        if (field === 'customName') {
          const isDuplicate = hasDuplicateChiefdomName(
            districtForm.chiefdoms,
            chiefdomId,
            value,
          );
          updatedErrors = isDuplicate
            ? setChiefdomError(updatedErrors, 'name', DUPLICATE_ERRORS.chiefdom)
            : clearChiefdomError(updatedErrors, 'name');
        } else if (field === 'name') {
          updatedErrors = clearChiefdomError(updatedErrors, 'name');
        }
        return {
          ...chiefdom,
          [field]: value,
          validationErrors: updatedErrors,
        };
      }),
    }));
  };

  const handleToggleChiefdomCollapse = (chiefdomId) => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }
        return {
          ...chiefdom,
          isCollapsed: !chiefdom.isCollapsed,
        };
      }),
    }));
  };

  const handleAddChiefdom = () => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: [createChiefdomEntry(), ...districtForm.chiefdoms],
    }));
  };

  const handleRemoveChiefdom = (chiefdomId) => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms:
        districtForm.chiefdoms.length === 1
          ? districtForm.chiefdoms
          : districtForm.chiefdoms.filter((chiefdom) => chiefdom.id !== chiefdomId),
    }));
  };

  const handleFertilizerSelect = (chiefdomId, fertilizerId, value) => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }
        const validationErrors = chiefdom.validationErrors
          || resetChiefdomValidationErrors(chiefdom);
        let nextErrors = validationErrors;
        if (value === 'custom') {
          nextErrors = clearFertilizerError(validationErrors, fertilizerId, 'name');
        } else {
          const isDuplicate = hasDuplicateFertilizerName(
            chiefdom.fertilizers,
            fertilizerId,
            value,
          );
          nextErrors = isDuplicate
            ? setFertilizerError(validationErrors, fertilizerId, 'name', DUPLICATE_ERRORS.fertilizer)
            : clearFertilizerError(validationErrors, fertilizerId, 'name');
        }
        return {
          ...chiefdom,
          fertilizers: chiefdom.fertilizers.map((fertilizer) => {
            if (fertilizer.id !== fertilizerId) {
              return fertilizer;
            }
            if (value === 'custom') {
              return {
                ...fertilizer,
                useCustomName: true,
                name: '',
                customName: '',
              };
            }
            return {
              ...fertilizer,
              useCustomName: false,
              name: value,
              customName: '',
            };
          }),
          isCollapsed: false,
          validationErrors: nextErrors,
        };
      }),
    }));
  };

  const handleFertilizerFieldChange = (chiefdomId, fertilizerId, field, value) => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }
        const currentErrors = chiefdom.validationErrors
          || resetChiefdomValidationErrors(chiefdom);
        let updatedErrors = currentErrors;

        if (field === 'bag25kg') {
          updatedErrors = clearFertilizerError(currentErrors, fertilizerId, 'bag25kg');
        } else if (field === 'bag50kg') {
          updatedErrors = clearFertilizerError(currentErrors, fertilizerId, 'bag50kg');
        } else if (field === 'dealership') {
          updatedErrors = clearFertilizerError(currentErrors, fertilizerId, 'dealership');
        } else if (field === 'customName') {
          const isDuplicate = hasDuplicateFertilizerName(
            chiefdom.fertilizers,
            fertilizerId,
            value,
          );
          updatedErrors = isDuplicate
            ? setFertilizerError(currentErrors, fertilizerId, 'name', DUPLICATE_ERRORS.fertilizer)
            : clearFertilizerError(currentErrors, 'name');
        } else if (field === 'name') {
          updatedErrors = clearFertilizerError(currentErrors, fertilizerId, 'name');
        }

        return {
          ...chiefdom,
          fertilizers: chiefdom.fertilizers.map((fertilizer) => {
            if (fertilizer.id !== fertilizerId) {
              return fertilizer;
            }
            return { ...fertilizer, [field]: value };
          }),
          isCollapsed: false,
          validationErrors: updatedErrors,
        };
      }),
    }));
  };

  const handleAddFertilizer = (chiefdomId) => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }
        const newFertilizer = createFertilizerEntry();
        const baseErrors = chiefdom.validationErrors
          || resetChiefdomValidationErrors(chiefdom);
        return {
          ...chiefdom,
          fertilizers: [newFertilizer, ...chiefdom.fertilizers],
          isCollapsed: false,
          validationErrors: addFertilizerValidationError(baseErrors, newFertilizer.id),
        };
      }),
    }));
  };

  const hdleRmvFerti = (chiefdomId, fertilizerId) => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }
        return {
          ...chiefdom,
          fertilizers:
            chiefdom.fertilizers.length === 1
              ? chiefdom.fertilizers
              : chiefdom.fertilizers.filter((fertilizer) => fertilizer.id !== fertilizerId),
          isCollapsed: false,
          validationErrors:
            chiefdom.fertilizers.length === 1
              ? chiefdom.validationErrors
              : removeFertilizerValidationError(
                chiefdom.validationErrors
                || resetChiefdomValidationErrors(chiefdom),
                fertilizerId,
              ),
        };
      }),
    }));
  };

  const handleSaveDistrictPlan = () => {
    if (!districtForm) {
      dispatch(
        setFormError('District form is not initialized.'),
      );
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      dispatch(setFormError('Please log in to save drafts.'));
      return;
    }

    const { isValid: isDistrictValid } = validateDistrictSelection(districtForm);
    if (!isDistrictValid) {
      dispatch(setFormError('Please resolve the highlighted district errors.'));
      return;
    }

    const invalidChiefdoms = districtForm.chiefdoms
      .map((chiefdom) => {
        const validation = validateChiefdomEntry(chiefdom, referenceChiefdoms);
        return validation.isValid ? null : { id: chiefdom.id, validationErrors: validation.errors };
      })
      .filter(Boolean);

    if (invalidChiefdoms.length > 0) {
      dispatch(setDistrictForm({
        ...districtForm,
        chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
          const invalid = invalidChiefdoms.find((item) => item.id === chiefdom.id);
          if (!invalid) {
            return chiefdom;
          }
          return {
            ...chiefdom,
            validationErrors: invalid.validationErrors,
            isCollapsed: false,
          };
        }),
      }));
      dispatch(setFormError('Complete all required chiefdom fields before saving.'));
      return;
    }

    const districtLabel = getDistrictLabel(districtForm.district, districtForm.customDistrict);
    const duplicateDistrictExists = (districtForm.data?.districts || []).some(
      (district) => district.name.toLowerCase() === districtLabel.toLowerCase(),
    );
    if (duplicateDistrictExists) {
      dispatch(setFormError(`${districtLabel} has already been added. Remove it first to add new data.`));
      return;
    }

    const preparedChiefdoms = districtForm.chiefdoms
      .map((chiefdom) => {
        const chiefdomName = chiefdom.useCustomName
          ? chiefdom.customName.trim()
          : (referenceChiefdoms.find((c) => c.id.toString() === chiefdom.name)?.name || '');
        if (!chiefdomName) {
          return null;
        }
        const fertilizers = chiefdom.fertilizers
          .map((fertilizer) => {
            const FName = fertilizer.useCustomName ? fertilizer.customName.trim() : fertilizer.name;
            if (!FName) {
              return null;
            }

            // Aggregate both bag sizes into a single object
            return {
              name: FName,
              dealership: fertilizer.dealership.trim(),
              bag25kg: Number(fertilizer.bag25kg) || 0,
              bag50kg: Number(fertilizer.bag50kg) || 0,
            };
          })
          .filter(Boolean);

        return {
          name: chiefdomName,
          fertilizers,
        };
      })
      .filter(Boolean);

    if (preparedChiefdoms.length === 0) {
      dispatch(setFormError('Add at least one chiefdom with fertilizer details.'));
      return;
    }

    const payload = {
      district: districtLabel,
      chiefdoms: preparedChiefdoms,
      totals: modalBagTotals, // Use modal totals instead of saved totals
      createdAt: new Date().toISOString(),
    };

    const summaryName = `${districtLabel}`;
    const newDistrictRecord = { id: uniqueId('record'), name: summaryName, ...payload };

    // Prepare updated draft data including the new district
    const updatedDistricts = [...(districtForm.data?.districts || []), newDistrictRecord];
    const draftData = {
      title: districtForm.title || `Draft - ${new Date().toLocaleDateString()}`,
      data: {
        ...districtForm.data,
        districts: updatedDistricts,
      },
      status: 'draft',
    };

    // eslint-disable-next-line no-console
    console.log('Manually saving draft with new district:', { isAuthenticated, draftData: JSON.stringify(draftData, null, 2) });
    dispatch(saveDraft({ draftData, draftId: districtForm.id }))
      .unwrap()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('Draft saved successfully');

        // Note: state is updated automatically via saveDraft.fulfilled extraReducer
        dispatch(triggerSuccessMessage());
        dispatch(closeModal());
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to save draft:', error);
        dispatch(setFormError('Failed to save draft. Please try again.'));
      });
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  // Handler for View Previous Submissions
  const handleViewSubmissions = async () => {
    // Load previous submissions from API
    try {
      const { token } = authState;
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'}/submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const result = await response.json();
      // Result is { submissions: [], pagination: {} }
      const submissions = result.submissions || [];

      // Sort submissions by date (newest first)
      const sortedSubmissions = [...submissions].sort(
        (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at),
      );

      // Map backend submission to frontend structure for viewing
      const mappedSubmissions = sortedSubmissions.map((sub) => {
        const items = sub.submission_items || [];

        // Group by District
        const districtGroups = {};
        items.forEach((item) => {
          const dName = item.district?.name || 'Unknown District';
          if (!districtGroups[dName]) {
            districtGroups[dName] = { name: dName, chiefdoms: {} };
          }

          const cName = item.chiefdom?.name || 'Unknown Chiefdom';
          if (!districtGroups[dName].chiefdoms[cName]) {
            districtGroups[dName].chiefdoms[cName] = { name: cName, fertilizers: [] };
          }

          districtGroups[dName].chiefdoms[cName].fertilizers.push({
            id: item.id,
            name: item.fertilizer?.name || 'Unknown Fertilizer',
            dealership: item.dealer?.name || 'Not specified',
            bag25kg: Number(item.bags_25kg || 0),
            bag50kg: Number(item.bags_50kg || 0),
          });
        });

        const districts = Object.values(districtGroups).map((d) => ({
          ...d,
          chiefdoms: Object.values(d.chiefdoms),
        }));

        return {
          id: sub.id,
          submissionDate: sub.submitted_at,
          districts,
          totals: {
            total25: Number(sub.total_bags_25kg || 0),
            total50: Number(sub.total_bags_50kg || 0),
          },
        };
      });

      setPreviousSubmissions(mappedSubmissions);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unable to load previous submissions', error);
      dispatch(setFormError('Failed to load previous submissions.'));
    }
    setViewTab('submissions');
  };

  // Handler for Submit button
  const handleSubmit = () => {
    if (!districtForm.data?.districts || districtForm.data.districts.length === 0) {
      dispatch(setFormError('Please add at least one district before submitting.'));
      return;
    }
    setShowConfirmModal(true);
  };

  // Handler for confirming submission
  const handleConfirmSubmission = async () => {
    // Submit the current draft
    try {
      const draftIdToSubmit = districtForm.id;
      if (draftIdToSubmit) {
        await dispatch(submitDraft(draftIdToSubmit)).unwrap();
      }

      // ONLY close modal and update state on success
      setShowConfirmModal(false);

      // Show success message
      dispatch(triggerSuccessMessage());

      // Note: We don't delete the draft because:
      // 1. The submission has a foreign key reference to it (for audit trail)
      // 2. The draft status is already updated to 'submitted' by the backend
      // 3. Submitted drafts are filtered out from the drafts list

      // Refresh drafts list and go to history
      dispatch(fetchDrafts());
      handleViewSubmissions();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting draft:', error);
      dispatch(setFormError('Failed to submit draft. Please try again.'));
    }
  };

  // Handler to cancel submission
  const handleCancelSubmission = () => {
    setShowConfirmModal(false);
  };

  // Handler for viewing submission data
  const handleViewSubmission = (submission) => {
    // The submission is already mapped correctly in handleViewSubmissions
    const districtForView = {
      ...submission,
      name: `Submission from ${new Date(submission.submissionDate).toLocaleDateString()}`,
      isSubmission: true,
    };
    dispatch(openViewModal(districtForView));
  };

  return (
    <div className="nafra-data-form">
      <div className="form-content">
        <Header />
        <div className="nafra-form-input-body" style={{ minHeight: '100vh' }}>
          <hr />

          {/* Notifications area */}
          <NotificationSection
            isSuccessMessageVisible={isSuccessMessageVisible}
            formError={formError}
            draftsError={draftsError}
            onHideSuccess={() => dispatch(hideSuccessMessage())}
          />

          <TabNavigation
            viewTab={viewTab}
            setViewTab={setViewTab}
            onAddDistrict={handleOpenModal}
            onViewSubmissions={handleViewSubmissions}
          />
          <RecordsList
            viewTab={viewTab}
            previousSubmissions={previousSubmissions}
            districtForm={districtForm}
            onViewSubmission={handleViewSubmission}
            onEditDistrict={handleEditDistrict}
            onDeleteDistrict={handleDeleteDistrict}
            onViewDistrict={handleViewDistrict}
            onSubmitRecord={handleSubmit}
            onLogout={handleLogout}
          />
        </div>
      </div>
      {isModalOpen ? (
        <div className="district-modal-overlay" role="dialog" aria-modal="true">
          <div className="district-modal">
            <div className="district-modal-header">
              <div>
                <h3>Add District-Level Data</h3>
                <p>Capture district, chiefdom and fertilizer details for submission.</p>
              </div>
              <button
                className="close-modal-btn"
                type="button"
                aria-label="Close modal"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            <div className="district-modal-body">
              <section className="modal-section">
                <div className="form-field">
                  <FormLabel htmlFor="district-select" label="District Name">
                    <select
                      id="district-select"
                      value={districtForm.district}
                      onChange={handleDistrictChange}
                      aria-describedby="district-select-error"
                    >
                      <option value="">Select a district</option>
                      {districtOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormLabel>
                  <FieldError id="district-select-error" message={formError} />
                </div>
                {districtForm.district === 'custom' ? (
                  <div className="form-field">
                    <FormLabel htmlFor="district-custom-input" label="Custom District Name">
                      <input
                        id="district-custom-input"
                        type="text"
                        placeholder="Enter district name"
                        value={districtForm.customDistrict}
                        onChange={handleCustomDistrictChange}
                        aria-describedby="district-custom-error"
                        required
                      />
                    </FormLabel>
                    <FieldError id="district-custom-error" message={formError} />
                  </div>
                ) : null}
              </section>

              <section className="modal-section">
                <div className="modal-section-header">
                  <h4>Chiefdom Information</h4>
                  <button
                    type="button"
                    className="add-row-btn"
                    onClick={handleAddChiefdom}
                  >
                    + Add Chiefdom
                  </button>
                </div>
                <div className="chiefdom-grid">
                  {(districtForm.chiefdoms || []).map((chiefdom, index) => (
                    <ChiefdomCard
                      key={chiefdom.id}
                      chiefdom={chiefdom}
                      index={index}
                      districtForm={districtForm}
                      referenceChiefdoms={referenceChiefdoms}
                      fertilizerOptions={fertilizerOptions}
                      dealerOptions={dealerOptions}
                      onRemoveChiefdom={handleRemoveChiefdom}
                      onToggleCollapse={handleToggleChiefdomCollapse}
                      onChiefdomSelect={hdlChfSlct}
                      onFieldChange={handleChiefdomFieldChange}
                      onAddFertilizer={handleAddFertilizer}
                      onFertilizerSelect={handleFertilizerSelect}
                      onFertilizerFieldChange={handleFertilizerFieldChange}
                      onRemoveFertilizer={hdleRmvFerti}
                    />
                  ))}
                </div>
              </section>
              {formError ? <p className="modal-error">{formError}</p> : null}
            </div>
            <div className="district-modal-footer">
              <div className="bag-total-row">
                <span>
                  25kg Bags:
                  {' '}
                  <strong>{modalBagTotals.total25}</strong>
                </span>
                <span>
                  50kg Bags:
                  {' '}
                  <strong>{modalBagTotals.total50}</strong>
                </span>
              </div>
              <div className="modal-footer-actions">
                <button type="button" className="secondary-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="button" className="primary-btn" onClick={handleSaveDistrictPlan} disabled={isLoadingDrafts}>
                  {isLoadingDrafts ? 'Saving...' : 'Save District Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* District Action Modals */}
      {viewModalDraft && (
        <DistrictViewModal
          district={viewModalDraft}
          onClose={handleCloseViewModal}
        />
      )}

      {editModalDraft && (
        <DistrictEditModal
          district={editModalDraft}
          onClose={handleCloseEditModal}
        />
      )}

      {deleteModalDraft && (
        <DistrictDeleteModal
          district={deleteModalDraft}
          onClose={handleCloseDeleteModal}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="confirmation-modal">
            <div className="confirmation-modal-header">
              <h3>Confirm Submission</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={handleCancelSubmission}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="confirmation-modal-body">
              <p>Are you sure you want to submit the collected data?</p>
              <p>
                This will submit
                {districtForm.data?.districts?.length || 0}
                {' '}
                district(s)
              </p>
            </div>
            <div className="confirmation-modal-footer">
              <button
                type="button"
                className="secondary-btn"
                onClick={handleCancelSubmission}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleConfirmSubmission}
                disabled={isLoadingDrafts}
              >
                {isLoadingDrafts ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
