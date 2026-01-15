import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './styles/NafraDataForm.css';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import { EyeIcon } from './icons/EyeIcons';
import { logout } from '../features/auth/authSlice';
import {
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
} from '../features/district/districtSlice';
import DistrictViewModal from './DistrictViewModal';
import DistrictEditModal from './DistrictEditModal';
import DistrictDeleteModal from './DistrictDeleteModal';
import logo from '../img/nafra-logo.png';
import logo2 from '../img/logo3.png';
import {
  DISTRICT_CHIEFDOMS,
  DISTRICT_OPTIONS,
  FERTILIZER_OPTIONS,
} from '../constants/districtData';

const MAX_VISIBLE_DISTRICTS = 4;
const DISTRICT_ROW_HEIGHT_PX = 72;
const INITIAL_DISTRICT_ERRORS = {
  district: '',
  customDistrict: '',
};
const STORAGE_KEYS = {
  savedDistricts: 'nafra.savedDistricts',
};
const DUPLICATE_ERRORS = {
  chiefdom: 'This chiefdom already exists in the current district entry.',
  fertilizer: 'This fertilizer already exists for this chiefdom.',
};

const FieldError = ({ id, message }) => {
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

const uniqueId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const normalizeText = (value = '') => value.trim().toLowerCase();

const crFertValSt = () => ({
  name: '',
  bagCount: '',
});

const crChfValSt = (fertilizers = []) => ({
  name: '',
  dealership: '',
  fertilizers: fertilizers.reduce((acc, fertilizer) => {
    acc[fertilizer.id] = crFertValSt();
    return acc;
  }, {}),
});

const resetChiefdomValEr = (chiefdom) => crChfValSt(chiefdom.fertilizers);

const clearChiefdomError = (validationErrors, field) => ({
  ...validationErrors,
  [field]: '',
});

const setChiefdomError = (validationErrors, field, message) => ({
  ...validationErrors,
  [field]: message,
});

const clearFertilizerError = (validationErrors, fertilizerId, field) => {
  const fertilizerErrors = validationErrors.fertilizers[fertilizerId]
    || crFertValSt();
  return {
    ...validationErrors,
    fertilizers: {
      ...validationErrors.fertilizers,
      [fertilizerId]: {
        ...fertilizerErrors,
        [field]: '',
      },
    },
  };
};

const addFertilizerValidationError = (validationErrors, fertilizerId) => ({
  ...validationErrors,
  fertilizers: {
    ...validationErrors.fertilizers,
    [fertilizerId]: crFertValSt(),
  },
});

const removeFertilizerValidationError = (validationErrors, fertilizerId) => {
  const { [fertilizerId]: _removed, ...rest } = validationErrors.fertilizers;
  return {
    ...validationErrors,
    fertilizers: rest,
  };
};

const setFertilizerError = (validationErrors, fertilizerId, field, message) => {
  const fertilizerErrors = validationErrors.fertilizers[fertilizerId]
    || crFertValSt();
  return {
    ...validationErrors,
    fertilizers: {
      ...validationErrors.fertilizers,
      [fertilizerId]: {
        ...fertilizerErrors,
        [field]: message,
      },
    },
  };
};

const valDistSelection = (districtForm) => {
  const errors = { ...INITIAL_DISTRICT_ERRORS };

  if (!districtForm.district) {
    errors.district = 'Select a district before continuing.';
  }

  if (districtForm.district === 'custom' && !districtForm.customDistrict.trim()) {
    errors.customDistrict = 'Enter the custom district name.';
  }

  const isValid = !errors.district && !errors.customDistrict;
  return { isValid, errors };
};

const createFertilizerEntry = () => ({
  id: uniqueId('fert'),
  name: '',
  useCustomName: false,
  customName: '',
  bagSize: '25',
  bagCount: '',
});

const createChiefdomEntry = () => {
  const initialFertilizer = createFertilizerEntry();
  return {
    id: uniqueId('chiefdom'),
    name: '',
    useCustomName: false,
    customName: '',
    fertilizers: [initialFertilizer],
    dealership: '',
    isCollapsed: false,
    validationErrors: crChfValSt([initialFertilizer]),
  };
};

const getChiefdomNameValue = (chiefdom) => {
  if (!chiefdom) {
    return '';
  }
  if (chiefdom.useCustomName) {
    return chiefdom.customName.trim();
  }
  return chiefdom.name;
};

const getChiefdomDisplayName = (chiefdom) => getChiefdomNameValue(chiefdom) || 'Not specified';

const getfertNameValue = (fertilizer) => {
  if (!fertilizer) {
    return '';
  }
  if (fertilizer.useCustomName) {
    return fertilizer.customName.trim();
  }
  return fertilizer.name;
};

const hasDuplicateChiefdomName = (chiefdoms, targetId, candidateName) => {
  const normalizedCandidate = normalizeText(candidateName);
  if (!normalizedCandidate) {
    return false;
  }
  return chiefdoms.some(
    (chiefdom) => chiefdom.id !== targetId
      && normalizeText(getChiefdomNameValue(chiefdom)) === normalizedCandidate,
  );
};

const hasDuplicatefertName = (fertilizers, targetId, candidateName) => {
  const normalizedCandidate = normalizeText(candidateName);
  if (!normalizedCandidate) {
    return false;
  }
  return fertilizers.some(
    (fertilizer) => fertilizer.id !== targetId
      && normalizeText(getfertNameValue(fertilizer)) === normalizedCandidate,
  );
};

const getChiefdomFertilizerSummary = (chiefdom) => {
  if (!chiefdom?.fertilizers?.length) {
    return 'No fertilizer entries yet';
  }

  const summary = chiefdom.fertilizers
    .map((fertilizer) => {
      const label = fertilizer.useCustomName ? fertilizer.customName.trim() : fertilizer.name;
      if (!label) {
        return null;
      }
      const bagCount = Number(fertilizer.bagCount) || 0;
      const bagText = bagCount
        ? `${bagCount} x ${fertilizer.bagSize}kg`
        : `${fertilizer.bagSize}kg`;
      return `${label} (${bagText})`;
    })
    .filter(Boolean);

  if (!summary.length) {
    return 'No fertilizer entries yet';
  }

  return summary.join(' • ');
};

const validateChiefdomEntry = (chiefdom) => {
  const errors = crChfValSt(chiefdom.fertilizers);
  const nameValue = getChiefdomNameValue(chiefdom);

  if (!nameValue) {
    errors.name = 'Select or enter a chiefdom name.';
  }

  if (!chiefdom.dealership.trim()) {
    errors.dealership = 'Enter the fertilizer dealership name.';
  }

  chiefdom.fertilizers.forEach((fertilizer) => {
    const fertilizerErrors = errors.fertilizers[fertilizer.id]
      || crFertValSt();
    const fertName = fertilizer.useCustomName ? fertilizer.customName.trim() : fertilizer.name;
    if (!fertName) {
      fertilizerErrors.name = 'Select or enter a fertilizer name.';
    }
    const bagCountValue = Number(fertilizer.bagCount);
    if (!Number.isFinite(bagCountValue) || bagCountValue <= 0) {
      fertilizerErrors.bagCount = 'Enter a bag count greater than zero.';
    }
    errors.fertilizers[fertilizer.id] = fertilizerErrors;
  });

  const hasName = !errors.name;
  const hasDealership = !errors.dealership;
  const allFertilizersValid = Object.values(errors.fertilizers).every(
    (fertilizerErrors) => (!fertilizerErrors.name && !fertilizerErrors.bagCount),
  );

  return { isValid: hasName && hasDealership && allFertilizersValid, errors };
};

const getDistrictLabel = (value, customValue) => {
  if (value === 'custom') {
    return customValue.trim();
  }
  return DISTRICT_OPTIONS.find((option) => option.value === value)?.label || '';
};

export default function NafraDataForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const districtState = useSelector((state) => state.district);

  const {
    districts,
    isModalOpen,
    districtForm,
    districtErrors,
    formError,
    viewModalDistrict,
    editModalDistrict,
    deleteModalDistrict,
  } = districtState;

  useEffect(() => {
    // Initialize districts from localStorage on component mount
    if (typeof window !== 'undefined') {
      try {
        const savedDistricts = window.localStorage.getItem(STORAGE_KEYS.savedDistricts);
        if (savedDistricts) {
          const parsedDistricts = JSON.parse(savedDistricts);
          dispatch(setDistricts(parsedDistricts));
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Unable to load district list from storage', error);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    // Save districts to localStorage whenever they change
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.savedDistricts, JSON.stringify(districts));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Unable to persist district list', error);
    }
  }, [districts]);

  const bagTotals = useMemo(
    () => {
      if (!districtForm || !districtForm.chiefdoms) {
        return { total25: 0, total50: 0 };
      }
      return districtForm.chiefdoms.reduce(
        (totals, chiefdom) => {
          const chiefdomTotals = chiefdom.fertilizers.reduce(
            (acc, fertilizer) => {
              const count = Number(fertilizer.bagCount) || 0;
              if (fertilizer.bagSize === '25') {
                return { ...acc, total25: acc.total25 + count };
              }
              if (fertilizer.bagSize === '50') {
                return { ...acc, total50: acc.total50 + count };
              }
              return acc;
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
    [districtForm],
  );

  const handleOpenModal = () => {
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

    dispatch(setDistrictErrors({
      district: '',
      customDistrict: value === 'custom' ? districtErrors.customDistrict : '',
    }));
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
        validationErrors: resetChiefdomValEr(chiefdom),
      })),
    }));
  };

  const handleCustomDistrictChange = (event) => {
    if (!districtForm) return;

    dispatch(setDistrictErrors({
      ...districtErrors,
      customDistrict: '',
    }));
    dispatch(setDistrictForm({
      ...districtForm,
      customDistrict: event.target.value,
    }));
  };

  const hdlChfSlct = (chiefdomId, value) => {
    if (!districtForm) return;

    dispatch(setDistrictForm({
      ...districtForm,
      chiefdoms: districtForm.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }
        const validationErrors = chiefdom.validationErrors
          || resetChiefdomValEr(chiefdom);
        const isDuplicate = value !== 'custom'
          && hasDuplicateChiefdomName(districtForm.chiefdoms, chiefdomId, value);
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
          name: value,
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
          || resetChiefdomValEr(chiefdom);
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
          || resetChiefdomValEr(chiefdom);
        let nextErrors = validationErrors;
        if (value === 'custom') {
          nextErrors = clearFertilizerError(validationErrors, fertilizerId, 'name');
        } else {
          const isDuplicate = hasDuplicatefertName(
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
          || resetChiefdomValEr(chiefdom);
        let updatedErrors = currentErrors;
        if (field === 'bagCount') {
          updatedErrors = clearFertilizerError(currentErrors, fertilizerId, 'bagCount');
        } else if (field === 'customName') {
          const isDuplicate = hasDuplicatefertName(
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
          || resetChiefdomValEr(chiefdom);
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
                || resetChiefdomValEr(chiefdom),
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

    const { isValid: isDistrictValid, errors: nextDistrictErrors } = valDistSelection(districtForm);
    if (!isDistrictValid) {
      dispatch(setDistrictErrors(nextDistrictErrors));
      dispatch(setFormError('Please resolve the highlighted district errors.'));
      return;
    }

    const invalidChiefdoms = districtForm.chiefdoms
      .map((chiefdom) => {
        const validation = validateChiefdomEntry(chiefdom);
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
    const duplicateDistrictExists = districts.some(
      (district) => district.name.toLowerCase() === districtLabel.toLowerCase(),
    );
    if (duplicateDistrictExists) {
      dispatch(setFormError(`${districtLabel} has already been added. Remove it first to add new data.`));
      return;
    }

    const preparedChiefdoms = districtForm.chiefdoms
      .map((chiefdom) => {
        const chiefdomName = chiefdom.useCustomName ? chiefdom.customName.trim() : chiefdom.name;
        if (!chiefdomName) {
          return null;
        }
        const fertilizers = chiefdom.fertilizers
          .map((fertilizer) => {
            const FName = fertilizer.useCustomName ? fertilizer.customName.trim() : fertilizer.name;
            if (!FName) {
              return null;
            }
            return {
              name: FName,
              bagSize: fertilizer.bagSize,
              bagCount: Number(fertilizer.bagCount) || 0,
            };
          })
          .filter(Boolean);

        return {
          name: chiefdomName,
          dealership: chiefdom.dealership.trim(),
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
      totals: bagTotals,
      createdAt: new Date().toISOString(),
    };

    const summaryName = `${districtLabel}`;
    dispatch(addDistrict({ id: uniqueId('record'), name: summaryName, ...payload }));
    // eslint-disable-next-line no-console
    console.log('District submission payload', payload);
    dispatch(closeModal());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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

          <div className="nafra-form-input-fields">
            <p>Add District of Operation</p>
            <button className="add-row-btn" type="button" onClick={handleOpenModal}>+ Add District</button>
          </div>
          <div className="nafra-form-data-collected">
            <div className="nafra-form-data-collected-header">
              <span>District Added</span>
              <span className="actions-title">Actions</span>
            </div>

            <ul
              className="nafra-form-data-collected-body"
              style={
                districts.length > MAX_VISIBLE_DISTRICTS
                  ? {
                    maxHeight: `${MAX_VISIBLE_DISTRICTS * DISTRICT_ROW_HEIGHT_PX}px`,
                    overflowY: 'auto',
                    paddingRight: '4px',
                  }
                  : undefined
              }
            >
              {districts.map((district) => (
                <li key={district.id} className="district-row">
                  <span className="district-name">{district.name}</span>
                  <div className="district-actions">
                    <button type="button" title="Edit" onClick={() => handleEditDistrict(district)}>
                      <EditIcon className="edit-icon" />
                    </button>
                    <button type="button" title="Delete" onClick={() => handleDeleteDistrict(district)}>
                      <DeleteIcon className="delete-icon" />
                    </button>
                    <button type="button" title="Preview" onClick={() => handleViewDistrict(district)}>
                      <EyeIcon className="view-icon" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="form-view-buttons">
            <button className="submit-button" type="button">
              submit
            </button>
            <button className="form-view-logout" type="button" onClick={handleLogout}>
              Logout
            </button>
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
                      {DISTRICT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormLabel>
                  <FieldError id="district-select-error" message={districtErrors.district} />
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
                    <FieldError id="district-custom-error" message={districtErrors.customDistrict} />
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
                  {districtForm.chiefdoms.map((chiefdom, index) => {
                    const chiefdomOptions = DISTRICT_CHIEFDOMS[districtForm.district] || [];
                    const cdomEr = chiefdom.validationErrors || crChfValSt(chiefdom.fertilizers);
                    const chiefdomNameErrorId = `chiefdom-name-error-${chiefdom.id}`;
                    const dealErrorId = `chiefdom-dealer-error-${chiefdom.id}`;
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
                              {getChiefdomDisplayName(chiefdom)}
                            </p>
                            <p>
                              <strong>Dealership:</strong>
                              {' '}
                              {chiefdom.dealership || 'Not specified'}
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
                                  value={chiefdom.useCustomName ? 'custom' : chiefdom.name}
                                  onChange={(event) => hdlChfSlct(chiefdom.id, event.target.value)}
                                  disabled={!districtForm.district}
                                  aria-invalid={Boolean(cdomEr.name)}
                                  aria-describedby={cdomEr.name ? chiefdomNameErrorId : undefined}
                                >
                                  <option value="">Select a chiefdom</option>
                                  {chiefdomOptions.map((name) => (
                                    <option key={name} value={name}>
                                      {name}
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

                            <div className="form-field">
                              <FormLabel
                                htmlFor={`dealership-${chiefdom.id}`}
                                label="Fertilizer Dealership Name"
                              >
                                <input
                                  id={`dealership-${chiefdom.id}`}
                                  type="text"
                                  placeholder="e.g. Sunrise Agro Dealers"
                                  value={chiefdom.dealership}
                                  onChange={(event) => handleChiefdomFieldChange(
                                    chiefdom.id,
                                    'dealership',
                                    event.target.value,
                                  )}
                                  aria-invalid={Boolean(cdomEr.dealership)}
                                  aria-describedby={cdomEr.dealership ? dealErrorId : undefined}
                                  required
                                />
                              </FormLabel>
                              <FieldError id={dealErrorId} message={cdomEr.dealership} />
                            </div>

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
                                const ftEr = cdomEr.fertilizers[fertilizer.id] || crFertValSt();
                                const FNameErrorId = `fert-name-error-${fertilizer.id}`;
                                const bagCountErrorId = `fert-bags-error-${fertilizer.id}`;
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
                                          {FERTILIZER_OPTIONS.map((name) => (
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
                                    <div className="fertilizer-field-inline">
                                      <div className="form-field">
                                        <FormLabel
                                          htmlFor={`bag-size-${fertilizer.id}`}
                                          label="Bag Size (kg)"
                                        >
                                          <select
                                            id={`bag-size-${fertilizer.id}`}
                                            value={fertilizer.bagSize}
                                            onChange={(event) => handleFertilizerFieldChange(
                                              chiefdom.id,
                                              fertilizer.id,
                                              'bagSize',
                                              event.target.value,
                                            )}
                                          >
                                            <option value="25">25 kg</option>
                                            <option value="50">50 kg</option>
                                          </select>
                                        </FormLabel>
                                      </div>
                                      <div className="form-field">
                                        <FormLabel
                                          htmlFor={`bag-count-${fertilizer.id}`}
                                          label="Number of Bags"
                                        >
                                          <input
                                            id={`bag-count-${fertilizer.id}`}
                                            type="number"
                                            min="0"
                                            value={fertilizer.bagCount}
                                            onChange={(event) => handleFertilizerFieldChange(
                                              chiefdom.id,
                                              fertilizer.id,
                                              'bagCount',
                                              event.target.value,
                                            )}
                                            aria-invalid={Boolean(ftEr.bagCount)}
                                            aria-describedby={
                                              ftEr.bagCount
                                                ? bagCountErrorId
                                                : undefined
                                            }
                                            required
                                          />
                                        </FormLabel>
                                        <FieldError
                                          id={bagCountErrorId}
                                          message={ftEr.bagCount}
                                        />
                                      </div>
                                      {chiefdom.fertilizers.length > 1 ? (
                                        <button
                                          type="button"
                                          className="remove-row-btn small"
                                          onClick={() => hdleRmvFerti(chiefdom.id, fertilizer.id)}
                                        >
                                          Remove
                                        </button>
                                      ) : null}
                                    </div>
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
                  <strong>{bagTotals.total25}</strong>
                </span>
                <span>
                  50kg Bags:
                  {' '}
                  <strong>{bagTotals.total50}</strong>
                </span>
              </div>
              <div className="modal-footer-actions">
                <button type="button" className="secondary-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="button" className="primary-btn" onClick={handleSaveDistrictPlan}>
                  Save District Data
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* District Action Modals */}
      {viewModalDistrict && (
        <DistrictViewModal
          district={viewModalDistrict}
          onClose={handleCloseViewModal}
        />
      )}

      {editModalDistrict && (
        <DistrictEditModal
          district={editModalDistrict}
          onClose={handleCloseEditModal}
        />
      )}

      {deleteModalDistrict && (
        <DistrictDeleteModal
          district={deleteModalDistrict}
          onClose={handleCloseDeleteModal}
        />
      )}
    </div>
  );
}
