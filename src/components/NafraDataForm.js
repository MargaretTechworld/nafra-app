import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
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
  dealership: '',
  bag25kg: '',
  bag50kg: '',
});

const crChfValSt = (fertilizers = []) => ({
  name: '',
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
  dealership: '',
  bag25kg: '',
  bag50kg: '',
});

const createChiefdomEntry = () => {
  const initialFertilizer = createFertilizerEntry();
  return {
    id: uniqueId('chiefdom'),
    name: '',
    useCustomName: false,
    customName: '',
    fertilizers: [initialFertilizer],
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
  if (!chiefdom.fertilizers || chiefdom.fertilizers.length === 0) {
    return 'No fertilizers added';
  }

  const summary = [];
  const fertilizerMap = new Map();

  // Group fertilizers by name and dealership
  chiefdom.fertilizers.forEach((fertilizer) => {
    const key = `${fertilizer.name || fertilizer.customName}-${fertilizer.dealership}`;
    if (!fertilizerMap.has(key)) {
      fertilizerMap.set(key, {
        name: fertilizer.name || fertilizer.customName,
        dealership: fertilizer.dealership,
        bag25kg: 0,
        bag50kg: 0,
      });
    }
    const current = fertilizerMap.get(key);

    // Handle both old and new data formats
    if (fertilizer.bagSize && fertilizer.bagCount) {
      // Convert old format to new format
      const count = Number(fertilizer.bagCount) || 0;
      if (fertilizer.bagSize === '25') {
        current.bag25kg += count;
      } else if (fertilizer.bagSize === '50') {
        current.bag50kg += count;
      }
    } else {
      // New format
      current.bag25kg += Number(fertilizer.bag25kg) || 0;
      current.bag50kg += Number(fertilizer.bag50kg) || 0;
    }
  });

  // Generate summary strings
  fertilizerMap.forEach((fertilizer) => {
    const parts = [];
    if (fertilizer.bag25kg > 0) {
      parts.push(`${fertilizer.bag25kg} x 25kg`);
    }
    if (fertilizer.bag50kg > 0) {
      parts.push(`${fertilizer.bag50kg} x 50kg`);
    }

    const dealerInfo = fertilizer.dealership ? ` (${fertilizer.dealership})` : '';
    if (parts.length > 0) {
      summary.push(`${fertilizer.name}${dealerInfo}: ${parts.join(', ')}`);
    } else {
      summary.push(`${fertilizer.name}${dealerInfo}: No quantities specified`);
    }
  });

  return summary.join('; ');
};

const validateChiefdomEntry = (chiefdom) => {
  const errors = crChfValSt(chiefdom.fertilizers);
  const nameValue = getChiefdomNameValue(chiefdom);

  if (!nameValue) {
    errors.name = 'Select or enter a chiefdom name.';
  }

  chiefdom.fertilizers.forEach((fertilizer) => {
    const fertilizerErrors = errors.fertilizers[fertilizer.id]
      || crFertValSt();
    const fertName = fertilizer.useCustomName ? fertilizer.customName.trim() : fertilizer.name;
    if (!fertName) {
      fertilizerErrors.name = 'Select or enter a fertilizer name.';
    }
    if (!fertilizer.dealership.trim()) {
      fertilizerErrors.dealership = 'Enter the fertilizer dealership name.';
    }

    // Validate bag counts - at least one bag size must be filled with valid number
    const has25kg = fertilizer.bag25kg
      && fertilizer.bag25kg.trim()
      && Number(fertilizer.bag25kg) > 0;
    const has50kg = fertilizer.bag50kg
      && fertilizer.bag50kg.trim()
      && Number(fertilizer.bag50kg) > 0;

    if (!has25kg && !has50kg) {
      fertilizerErrors.bagSizes = 'At least one bag size (25kg or 50kg) must be specified.';
    } else {
      // Clear the combined error if at least one is valid
      delete fertilizerErrors.bagSizes;
    }

    // Only validate individual fields if they have values
    if (fertilizer.bag25kg && fertilizer.bag25kg.trim()
        && Number(fertilizer.bag25kg) <= 0) {
      fertilizerErrors.bag25kg = 'Enter valid bag count for 25kg bags.';
    } else if (!fertilizer.bag25kg || !fertilizer.bag25kg.trim()) {
      // Clear error if field is empty
      delete fertilizerErrors.bag25kg;
    }

    if (fertilizer.bag50kg && fertilizer.bag50kg.trim()
        && Number(fertilizer.bag50kg) <= 0) {
      fertilizerErrors.bag50kg = 'Enter valid bag count for 50kg bags.';
    } else if (!fertilizer.bag50kg || !fertilizer.bag50kg.trim()) {
      // Clear error if field is empty
      delete fertilizerErrors.bag50kg;
    }

    errors.fertilizers[fertilizer.id] = fertilizerErrors;
  });

  const hasName = !errors.name;
  const allFertilizersValid = Object.values(errors.fertilizers).every(
    (fertilizerErrors) => {
      const hasName = !fertilizerErrors.name;
      const hasDealership = !fertilizerErrors.dealership;
      const hasValid25kg = !fertilizerErrors.bag25kg;
      const hasValid50kg = !fertilizerErrors.bag50kg;
      return hasName && hasDealership && hasValid25kg && hasValid50kg;
    },
  );

  return { isValid: hasName && allFertilizersValid, errors };
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

  // State for submissions view and confirmation modal
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [previousSubmissions, setPreviousSubmissions] = useState([]);

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
              const bag25kgCount = Number(fertilizer.bag25kg) || 0;
              const bag50kgCount = Number(fertilizer.bag50kg) || 0;
              return {
                total25: acc.total25 + bag25kgCount,
                total50: acc.total50 + bag50kgCount,
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

        if (field === 'bag25kg') {
          updatedErrors = clearFertilizerError(currentErrors, fertilizerId, 'bag25kg');
        } else if (field === 'bag50kg') {
          updatedErrors = clearFertilizerError(currentErrors, fertilizerId, 'bag50kg');
        } else if (field === 'dealership') {
          updatedErrors = clearFertilizerError(currentErrors, fertilizerId, 'dealership');
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

  // Handler for View Previous Submissions
  const handleViewSubmissions = () => {
    // Load previous submissions from localStorage or API
    try {
      const savedSubmissions = window.localStorage.getItem('nafra-submissions');
      if (savedSubmissions) {
        const submissions = JSON.parse(savedSubmissions);
        // Sort by submission date (newest first) and filter by current user
        // Sort submissions by date (newest first)
        const sortedSubmissions = submissions.sort(
          (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate),
        );
        setPreviousSubmissions(sortedSubmissions);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Unable to load previous submissions', error);
    }
    setShowSubmissions(true);
  };

  // Handler for Submit button
  const handleSubmit = () => {
    if (districts.length === 0) {
      dispatch(setFormError('Please add at least one district before submitting.'));
      return;
    }
    setShowConfirmModal(true);
  };

  // Handler for confirming submission
  const handleConfirmSubmission = () => {
    setShowConfirmModal(false);

    // Prepare submission data
    const submissionData = {
      id: uniqueId('submission'),
      userId: 'current-user-id', // Replace with actual user ID from auth state
      submissionDate: new Date().toISOString(),
      districts, // Store original district structure with bag25kg/bag50kg fields
      totals: bagTotals,
    };

    // Save to localStorage (replace with actual database call)
    try {
      const existingSubmissions = window.localStorage.getItem('nafra-submissions');
      const submissions = existingSubmissions ? JSON.parse(existingSubmissions) : [];
      submissions.push(submissionData);
      window.localStorage.setItem('nafra-submissions', JSON.stringify(submissions));

      // Clear current districts
      dispatch(setDistricts([]));

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Hide submissions view and show empty state
      setShowSubmissions(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving submission:', error);
      dispatch(setFormError('Failed to save submission. Please try again.'));
    }
  };

  // Handler to cancel submission
  const handleCancelSubmission = () => {
    setShowConfirmModal(false);
  };

  // Handler to go back from submissions view
  const handleBackToForm = () => {
    setShowSubmissions(false);
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
          {showSuccessMessage && (
            <div className="success-message">
              ✓ Data submitted successfully!
            </div>
          )}
          <div className="nafra-form-input-fields">
            {!showSubmissions && <p>Add District of Operation</p>}
            {!showSubmissions && (
              <button className="add-row-btn" type="button" onClick={handleOpenModal}>+ Add District</button>
            )}
            <button className="view-submissions-btn" type="button" onClick={showSubmissions ? handleBackToForm : handleViewSubmissions}>
              {showSubmissions ? '← Back to Form' : 'View Previous Submissions'}
            </button>
            {showSubmissions && (
              <button className="login-prev" type="button" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
          <div className="nafra-form-data-collected">
            {showSubmissions ? (
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
            ) : (
              <>
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
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="form-view-buttons">
            {!showSubmissions && (
              <button className="submit-button" type="button" onClick={handleSubmit}>
                Submit
              </button>
            )}
            {!showSubmissions && (
              <button className="form-view-logout" type="button" onClick={handleLogout}>
                Logout
              </button>
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
                                    <div className="form-field">
                                      <FormLabel
                                        htmlFor={`dealership-${fertilizer.id}`}
                                        label="Fertilizer Dealership Name"
                                      >
                                        <input
                                          id={`dealership-${fertilizer.id}`}
                                          type="text"
                                          placeholder="e.g. Sunrise Agro Dealers"
                                          value={fertilizer.dealership}
                                          onChange={(event) => handleFertilizerFieldChange(
                                            chiefdom.id,
                                            fertilizer.id,
                                            'dealership',
                                            event.target.value,
                                          )}
                                          aria-invalid={Boolean(ftEr.dealership)}
                                          aria-describedby={ftEr.dealership ? `dealership-error-${fertilizer.id}` : undefined}
                                          required
                                        />
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
                {districts.length}
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
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
