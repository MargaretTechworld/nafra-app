import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './styles/NafraDataForm.css';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import { EyeIcon } from './icons/EyeIcons';
import {
  fetchReferenceData,
  saveDraft,
  fetchDrafts,
  submitDraft,
  openModal,
  closeModal,
  setDistrictForm,
  setFormError,
  addDistrict,
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
import logo from '../img/nafra-logo.png';
import logo2 from '../img/logo3.png';
import {
  getDistrictOptions,
  getChiefdomOptions,
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
  getChiefdomDisplayName,
  hasDuplicateChiefdomName,
  hasDuplicateFertilizerName,
  getChiefdomFertilizerSummary,
  validateChiefdomEntry,
  uniqueId,
  createChiefdomValidationState,
  createFertilizerValidationState,
} from '../utils/formHelpers';

const FieldError = ({ id = undefined, message = '' }) => {
  if (!message) {
    return null;
  }

  return (
    <p className="field-error" id={id} role="status" aria-live="polite">
      {message}
    </p>
  );
};

FieldError.propTypes = {
  id: PropTypes.string,
  message: PropTypes.string,
};

FieldError.defaultProps = {
  id: undefined,
  message: '',
};

const FormLabel = ({ children, htmlFor, label }) => (
  <label className="form-label" htmlFor={htmlFor}>
    <span className="form-label-text">{label}</span>
    {children}
  </label>
);

FormLabel.propTypes = {
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const MAX_VISIBLE_DISTRICTS = 5;
const DISTRICT_ROW_HEIGHT_PX = 72; // Approximate height of a district row

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
            : clearFertilizerError(currentErrors, fertilizerId, 'name');
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

            // Create entries for each bag size with count > 0
            const entries = [];

            if (fertilizer.bag25kg && Number(fertilizer.bag25kg) > 0) {
              entries.push({
                name: FName,
                dealership: fertilizer.dealership.trim(),
                bagSize: '25',
                bagCount: Number(fertilizer.bag25kg) || 0,
              });
            }

            if (fertilizer.bag50kg && Number(fertilizer.bag50kg) > 0) {
              entries.push({
                name: FName,
                dealership: fertilizer.dealership.trim(),
                bagSize: '50',
                bagCount: Number(fertilizer.bag50kg) || 0,
              });
            }

            return entries;
          })
          .flat() // Flatten the array of entries
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

        // Update local state
        dispatch(addDistrict(newDistrictRecord));
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
      const mappedSubmissions = sortedSubmissions.map((sub) => ({
        id: sub.id,
        submissionDate: sub.submitted_at,
        districts: sub.submission_items ? Array.from(
          new Set(sub.submission_items.map((item) => item.district?.name)),
        ).map((name) => {
          const districtItems = sub.submission_items.filter((item) => item.district?.name === name);
          return {
            name,
            chiefdoms: Array.from(
              new Set(districtItems.map((item) => item.chiefdom?.name)),
            ).map((cName) => {
              const chiefdomItems = districtItems.filter((item) => item.chiefdom?.name === cName);
              return {
                name: cName,
                fertilizers: chiefdomItems.map((item) => ({
                  name: item.fertilizer?.name,
                  dealership: item.dealer?.name,
                  bag25kg: item.bags_25kg,
                  bag50kg: item.bags_50kg,
                })),
              };
            }),
          };
        }) : [],
        totals: {
          total25: sub.total_bags_25kg,
          total50: sub.total_bags_50kg,
        },
      }));

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
    // Create a proper structure that shows districts as groups
    const districtForView = {
      id: submission.id,
      name: `Submission from ${new Date(submission.submissionDate).toLocaleDateString()}`,
      districts: submission.districts.map((district) => ({
        ...district,
        chiefdoms: district.chiefdoms.map((chiefdom) => ({
          ...chiefdom,
          fertilizers: chiefdom.fertilizers.map((fertilizer) => ({
            ...fertilizer,
            // Ensure bag25kg and bag50kg are properly set
            bag25kg: fertilizer.bag25kg || 0,
            bag50kg: fertilizer.bag50kg || 0,
          })),
        })),
      })),
      chiefdoms: [], // Empty chiefdoms array since we'll use districts
      totals: submission.totals,
      isSubmission: true, // Flag to indicate this is a submission
      submissionDate: submission.submissionDate,
    };
    dispatch(openViewModal(districtForView));
  };

  return (
    <div className="nafra-data-form">
      <div className="form-content">
        <div className="header">
          <img className="form-logo" src={logo} alt="Logo" />
          <div className="header-text">
            <h1>National Fertilizer Regulatory Agency</h1>
            <h1>&#40;Nafra&#41;</h1>
            <p>Fertilizer Data Portal &#40;2025&#41; </p>
          </div>
          <img className="form-logo" src={logo2} alt="Logo" />
        </div>
        <div className="nafra-form-input-body" style={{ minHeight: '100vh' }}>
          <hr />
          <div className="form-welcome-message">
            <div className="welcome-login">
              <h1>
                Welcome,
                {' '}
                <span className="organization-name">Food Security Resilence Program &#40;FSRP&#41;</span>
              </h1>
            </div>

            <p>Please carefully fill out the form below to submit your data.</p>
          </div>

          {/* Success Message */}
          {isSuccessMessageVisible && (
            <div className="success-message">
              <p>Action completed successfully!</p>
              <button
                type="button"
                className="close-btn"
                onClick={() => dispatch(hideSuccessMessage())}
              >
                ×
              </button>
            </div>
          )}
          {formError || draftsError ? (
            <div className="error-message-global" role="alert">
              <span className="error-icon">⚠</span>
              <span className="error-text">{formError || draftsError}</span>
            </div>
          ) : null}

          {/* New Tabbed Toggle UI */}
          <div className="nafra-form-tabs">
            <button
              className={`tab-btn ${viewTab === 'active' ? 'active' : ''}`}
              onClick={() => setViewTab('active')}
              type="button"
            >
              My Record
            </button>
            <button
              className={`tab-btn ${viewTab === 'submissions' ? 'active' : ''}`}
              onClick={() => {
                setViewTab('submissions');
                handleViewSubmissions();
              }}
              type="button"
            >
              History
            </button>
            <button className="add-row-btn" type="button" onClick={handleOpenModal}>+ Add District</button>

          </div>
          <div className="nafra-form-data-collected">
            {viewTab === 'submissions' && (
              <>
                <div className="nafra-form-data-collected-header">
                  <span>Previous Submissions</span>
                  <span className="actions-title">Actions</span>
                </div>
                <ul
                  className="nafra-form-data-collected-body"
                  style={
                    previousSubmissions.length > MAX_VISIBLE_DISTRICTS
                      ? {
                        maxHeight: `${MAX_VISIBLE_DISTRICTS * DISTRICT_ROW_HEIGHT_PX}px`,
                        overflowY: 'auto',
                        paddingRight: '4px',
                      }
                      : undefined
                  }
                >
                  {previousSubmissions.length > 0 ? (
                    previousSubmissions.map((submission) => (
                      <li key={submission.id} className="submission-row">
                        <span className="submission-date">
                          Submitted on
                          {' '}
                          {new Date(submission.submissionDate).toLocaleDateString()}
                        </span>
                        <div className="submission-actions">
                          <button
                            className="btn-a-icon"
                            type="button"
                            title="View Submission"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <EyeIcon className="view-icon" />
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="no-submissions">No previous submissions found</li>
                  )}
                </ul>
              </>
            )}

            {viewTab === 'active' && (
              <>
                {/* Active Workspace */}
                <div className="nafra-form-data-collected-header">
                  <span>
                    Districts Record
                  </span>
                  <span className="actions-title">Actions</span>
                </div>
                <ul
                  className="nafra-form-data-collected-body"
                  style={
                    (districtForm.data?.districts?.length || 0) > MAX_VISIBLE_DISTRICTS
                      ? {
                        maxHeight: `${MAX_VISIBLE_DISTRICTS * DISTRICT_ROW_HEIGHT_PX}px`,
                        overflowY: 'auto',
                        paddingRight: '4px',
                      }
                      : undefined
                  }
                >
                  {(districtForm.data?.districts?.length || 0) > 0 ? (
                    districtForm.data.districts.map((district) => (
                      <li key={district.id} className="district-row">
                        <span className="district-name">{district.name}</span>
                        <div className="district-actions">
                          <button className="btn-a-icon" type="button" title="Edit" onClick={() => handleEditDistrict(district)}>
                            <EditIcon className="edit-icon" />
                          </button>
                          <button className="btn-a-icon" type="button" title="Delete" onClick={() => handleDeleteDistrict(district)}>
                            <DeleteIcon className="delete-icon" />
                          </button>
                          <button className="btn-a-icon" type="button" title="Preview" onClick={() => handleViewDistrict(district)}>
                            <EyeIcon className="view-icon" />
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="no-submissions">No districts added yet. Click &quot;+ Add District&quot; to start.</li>
                  )}
                </ul>

                <div className="form-view-buttons">
                  {(districtForm.data?.districts?.length || 0) > 0 && (
                    <button className="submit-button" type="button" onClick={handleSubmit}>
                      Submit Record
                    </button>
                  )}
                  <button className="login-prev" type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
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
                  {(districtForm.chiefdoms || []).map((chiefdom, index) => {
                    const chiefdomOptions = getChiefdomOptions(
                      referenceChiefdoms,
                      districtForm.district,
                    );
                    const cdomEr = chiefdom.validationErrors
                      || createChiefdomValidationState(chiefdom.fertilizers);
                    const chiefdomNameErrorId = `chiefdom-name-error-${chiefdom.id}`;
                    return (
                      <div key={chiefdom.id} className="chiefdom-card" aria-expanded={!chiefdom.isCollapsed}>
                        <div className="chiefdom-card-header">
                          <div className="chiefdom-card-header-info">
                            <button
                              type="button"
                              className="collapse-toggle-btn"
                              aria-label={chiefdom.isCollapsed ? 'Expand chiefdom' : 'Collapse chiefdom'}
                              onClick={() => handleToggleChiefdomCollapse(chiefdom.id)}
                            >
                              <span className={`collapse-arrow ${chiefdom.isCollapsed ? '' : 'open'}`} />
                            </button>
                            <h5>
                              Chiefdom
                              {' '}
                              {index + 1}
                            </h5>
                          </div>
                          {districtForm.chiefdoms.length > 1 ? (
                            <button
                              type="button"
                              className="remove-row-btn"
                              onClick={() => handleRemoveChiefdom(chiefdom.id)}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        {chiefdom.isCollapsed ? (
                          <div className="chiefdom-summary">
                            <p>
                              <strong>Name:</strong>
                              {' '}
                              {getChiefdomDisplayName(chiefdom, referenceChiefdoms)}
                            </p>
                            <p>
                              <strong>Fertilizers:</strong>
                              {' '}
                              {getChiefdomFertilizerSummary(chiefdom)}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="form-field">
                              <FormLabel
                                htmlFor={`chiefdom-select-${chiefdom.id}`}
                                label="Chiefdom Name"
                              >
                                <select
                                  id={`chiefdom-select-${chiefdom.id}`}
                                  value={chiefdom.useCustomName ? 'custom' : (chiefdom.name || '')}
                                  onChange={(event) => hdlChfSlct(chiefdom.id, event.target.value)}
                                  disabled={!districtForm.district}
                                  aria-invalid={Boolean(cdomEr.name)}
                                  aria-describedby={cdomEr.name ? chiefdomNameErrorId : undefined}
                                >
                                  <option value="">Select a chiefdom</option>
                                  {chiefdomOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                  <option value="custom">Other / Not listed</option>
                                </select>
                              </FormLabel>
                              {!chiefdom.useCustomName ? (
                                <FieldError id={chiefdomNameErrorId} message={cdomEr.name} />
                              ) : null}
                            </div>
                            {chiefdom.useCustomName ? (
                              <div className="form-field">
                                <FormLabel
                                  htmlFor={`chiefdom-custom-${chiefdom.id}`}
                                  label="Custom Chiefdom Name"
                                >
                                  <input
                                    id={`chiefdom-custom-${chiefdom.id}`}
                                    type="text"
                                    placeholder="Enter chiefdom name"
                                    value={chiefdom.customName}
                                    onChange={(event) => handleChiefdomFieldChange(
                                      chiefdom.id,
                                      'customName',
                                      event.target.value,
                                    )}
                                    aria-invalid={Boolean(cdomEr.name)}
                                    aria-describedby={cdomEr.name ? chiefdomNameErrorId : undefined}
                                    required
                                  />
                                </FormLabel>
                                <FieldError id={chiefdomNameErrorId} message={cdomEr.name} />
                              </div>
                            ) : null}

                            <div className="chiefdom-card-subheader">
                              <h6>Fertilizer Information</h6>
                              <button
                                type="button"
                                className="link-btn"
                                onClick={() => handleAddFertilizer(chiefdom.id)}
                              >
                                + Add Fertilizer Type
                              </button>
                            </div>
                            <div className="fertilizer-list">
                              {chiefdom.fertilizers.map((fertilizer) => {
                                const ftEr = cdomEr.fertilizers[fertilizer.id]
                                  || createFertilizerValidationState();
                                const FNameErrorId = `fert-name-error-${fertilizer.id}`;
                                return (
                                  <div key={fertilizer.id} className="fertilizer-row">
                                    <div className="fertilizer-field">
                                      <FormLabel
                                        htmlFor={`fert-${fertilizer.id}`}
                                        label="Fertilizer Name"
                                      >
                                        <select
                                          id={`fert-${fertilizer.id}`}
                                          value={fertilizer.useCustomName ? 'custom' : fertilizer.name}
                                          onChange={(event) => handleFertilizerSelect(
                                            chiefdom.id,
                                            fertilizer.id,
                                            event.target.value,
                                          )}
                                          aria-invalid={Boolean(ftEr.name)}
                                          aria-describedby={ftEr.name ? FNameErrorId : undefined}
                                        >
                                          <option value="">Select fertilizer</option>
                                          {fertilizerOptions.map((name) => (
                                            <option key={name} value={name}>
                                              {name}
                                            </option>
                                          ))}
                                          <option value="custom">Other / Add manually</option>
                                        </select>
                                      </FormLabel>
                                      {!fertilizer.useCustomName ? (
                                        <FieldError
                                          id={FNameErrorId}
                                          message={ftEr.name}
                                        />
                                      ) : null}
                                      {fertilizer.useCustomName ? (
                                        <div className="form-field nested">
                                          <FormLabel
                                            htmlFor={`fert-custom-${fertilizer.id}`}
                                            label="Custom Fertilizer Name"
                                          >
                                            <input
                                              id={`fert-custom-${fertilizer.id}`}
                                              type="text"
                                              placeholder="Enter fertilizer name"
                                              value={fertilizer.customName}
                                              onChange={(event) => handleFertilizerFieldChange(
                                                chiefdom.id,
                                                fertilizer.id,
                                                'customName',
                                                event.target.value,
                                              )}
                                              aria-invalid={Boolean(ftEr.name)}
                                              aria-describedby={
                                                ftEr.name ? FNameErrorId : undefined
                                              }
                                              required
                                            />
                                          </FormLabel>
                                          <FieldError
                                            id={FNameErrorId}
                                            message={ftEr.name}
                                          />
                                        </div>
                                      ) : null}
                                    </div>
                                    <div className="form-field">
                                      <FormLabel
                                        htmlFor={`dealership-${fertilizer.id}`}
                                        label="Fertilizer Dealership Name"
                                      >
                                        <select
                                          id={`dealership-${fertilizer.id}`}
                                          value={fertilizer.dealership}
                                          onChange={(event) => handleFertilizerFieldChange(
                                            chiefdom.id,
                                            fertilizer.id,
                                            'dealership',
                                            event.target.value,
                                          )}
                                          aria-invalid={Boolean(ftEr.dealership)}
                                          aria-describedby={ftEr.dealership ? `dealership-error-${fertilizer.id}` : undefined}
                                        >
                                          <option value="">Select a dealer</option>
                                          {dealerOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                              {option.label}
                                              {' '}
                                              (
                                              {option.licenseNumber}
                                              )
                                            </option>
                                          ))}
                                        </select>
                                      </FormLabel>
                                      <FieldError
                                        id={`dealership-error-${fertilizer.id}`}
                                        message={ftEr.dealership}
                                      />
                                    </div>
                                    <div className="bag-sizes-section">
                                      <h6>Bag Sizes</h6>
                                      <div className="bag-size-row">
                                        <div className="form-field">
                                          <FormLabel
                                            htmlFor={`bag-25kg-${fertilizer.id}`}
                                            label="25kg Bags"
                                          >
                                            <input
                                              id={`bag-25kg-${fertilizer.id}`}
                                              type="number"
                                              min="0"
                                              placeholder="0"
                                              value={fertilizer.bag25kg || ''}
                                              onChange={(event) => handleFertilizerFieldChange(
                                                chiefdom.id,
                                                fertilizer.id,
                                                'bag25kg',
                                                event.target.value,
                                              )}
                                              aria-invalid={Boolean(ftEr.bag25kg)}
                                              aria-describedby={
                                                ftEr.bag25kg
                                                  ? `bag-25kg-error-${fertilizer.id}`
                                                  : undefined
                                              }
                                              required
                                            />
                                          </FormLabel>
                                          <FieldError
                                            id={`bag-25kg-error-${fertilizer.id}`}
                                            message={ftEr.bag25kg}
                                          />
                                        </div>
                                      </div>
                                      <div className="bag-size-row">
                                        <div className="form-field">
                                          <FormLabel
                                            htmlFor={`bag-50kg-${fertilizer.id}`}
                                            label="50kg Bags"
                                          >
                                            <input
                                              id={`bag-50kg-${fertilizer.id}`}
                                              type="number"
                                              min="0"
                                              placeholder="0"
                                              value={fertilizer.bag50kg || ''}
                                              onChange={(event) => handleFertilizerFieldChange(
                                                chiefdom.id,
                                                fertilizer.id,
                                                'bag50kg',
                                                event.target.value,
                                              )}
                                              aria-invalid={Boolean(ftEr.bag50kg)}
                                              aria-describedby={
                                                ftEr.bag50kg
                                                  ? `bag-50kg-error-${fertilizer.id}`
                                                  : undefined
                                              }
                                              required
                                            />
                                          </FormLabel>
                                          <FieldError
                                            id={`bag-50kg-error-${fertilizer.id}`}
                                            message={ftEr.bag50kg}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <FieldError
                                      id={`bag-sizes-error-${fertilizer.id}`}
                                      message={ftEr.bagSizes}
                                    />
                                    <>
                                      {chiefdom.fertilizers.length > 1 ? (
                                        <button
                                          type="button"
                                          className="remove-row-btn small"
                                          onClick={() => hdleRmvFerti(chiefdom.id, fertilizer.id)}
                                        >
                                          Remove
                                        </button>
                                      ) : null}
                                    </>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
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
