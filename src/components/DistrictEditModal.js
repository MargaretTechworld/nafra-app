import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../features/auth/authSlice';
import {
  useGetDistrictsQuery,
  useGetChiefdomsQuery,
  useGetFertilizersQuery,
  useGetDealersQuery,
} from '../app/api/apiSlice';
import {
  triggerSuccessMessage,
  saveDraft,
} from '../features/draft/draftSlice';
// We use the same CSS as NafraDataForm for consistency, plus some modal specifics
import './styles/DistrictEditModal.css';
import './styles/NafraDataForm.css'; // Ensure we have the form styles
import {
  getDistrictOptions,
  getChiefdomOptions,
  getFertilizerOptions,
  getDealerOptions,
} from '../constants/referenceData';

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

const createFertilizerEntry = () => ({
  id: uniqueId('fert'),
  name: '',
  useCustomName: false,
  customName: '',
  dealership: '', // This will hold the Dealer ID (value)
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

const getChiefdomNameValue = (chiefdom, referenceChiefdoms = []) => {
  if (!chiefdom) {
    return '';
  }
  if (chiefdom.useCustomName) {
    return (chiefdom.customName || '').trim();
  }
  // Look up the actual chiefdom name from reference data using the ID
  const foundChiefdom = referenceChiefdoms.find((c) => c.id.toString() === chiefdom.name);
  return foundChiefdom ? foundChiefdom.name : '';
};

const getfertNameValue = (fertilizer) => {
  if (!fertilizer) {
    return '';
  }
  if (fertilizer.useCustomName) {
    return (fertilizer.customName || '').trim();
  }
  return fertilizer.name;
};

const hasDuplicateChiefdomName = (chiefdoms, targetId, candidateName, referenceChiefdoms) => {
  const normalizedCandidate = normalizeText(candidateName);
  if (!normalizedCandidate) {
    return false;
  }
  return chiefdoms.some(
    (chiefdom) => chiefdom.id !== targetId
      && normalizeText(getChiefdomNameValue(chiefdom, referenceChiefdoms)) === normalizedCandidate,
  );
};

const validateChiefdomEntry = (chiefdom, referenceChiefdoms = []) => {
  const errors = crChfValSt(chiefdom.fertilizers);
  const nameValue = getChiefdomNameValue(chiefdom, referenceChiefdoms);

  if (!nameValue) {
    errors.name = 'Select or enter a chiefdom name.';
  }

  chiefdom.fertilizers.forEach((fertilizer) => {
    const fertilizerErrors = errors.fertilizers[fertilizer.id]
      || crFertValSt();
    const fertName = fertilizer.useCustomName
      ? (fertilizer.customName || '').trim()
      : fertilizer.name;
    if (!fertName) {
      fertilizerErrors.name = 'Select or enter a fertilizer name.';
    }
    if (!(fertilizer.dealership || '').trim()) {
      fertilizerErrors.dealership = 'Enter the fertilizer dealership name.';
    }

    // Validate bag counts - at least one bag size must be filled with valid number
    const val25 = String(fertilizer.bag25kg || '').trim();
    const val50 = String(fertilizer.bag50kg || '').trim();

    const has25kg = val25 && Number(val25) > 0;
    const has50kg = val50 && Number(val50) > 0;

    if (!has25kg && !has50kg) {
      fertilizerErrors.bagSizes = 'At least one bag size (25kg or 50kg) must be specified.';
    } else {
      // Clear the combined error if at least one is valid
      delete fertilizerErrors.bagSizes;
    }

    // Only validate individual fields if they have values
    if (val25 && Number(val25) <= 0) {
      fertilizerErrors.bag25kg = 'Enter valid bag count for 25kg bags.';
    } else if (!val25) {
      // Clear error if field is empty
      delete fertilizerErrors.bag25kg;
    }

    if (val50 && Number(val50) <= 0) {
      fertilizerErrors.bag50kg = 'Enter valid bag count for 50kg bags.';
    } else if (!val50) {
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
      const hasBagSizes = !fertilizerErrors.bagSizes;
      return hasName && hasDealership && hasValid25kg && hasValid50kg && hasBagSizes;
    },
  );

  return { isValid: hasName && allFertilizersValid, errors };
};

const DUPLICATE_ERRORS = {
  chiefdom: 'This chiefdom already exists in the current district entry.',
  fertilizer: 'This fertilizer already exists for this chiefdom.',
};

// Helper Components (mirrored from NafraDataForm.js for consistent styling)
const FieldError = ({ id, message }) => {
  if (!message) return null;
  return (
    <p className="field-error" id={id} role="status" aria-live="polite">
      {message}
    </p>
  );
};

FieldError.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string,
};

FieldError.defaultProps = {
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

const DistrictEditModal = ({ district, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data: districts = [], isLoading: isDistrictsLoading } = useGetDistrictsQuery();
  const { data: chiefdoms = [], isLoading: isChiefdomsLoading } = useGetChiefdomsQuery();
  const { data: fertilizers = [], isLoading: isFertilizersLoading } = useGetFertilizersQuery();
  const { data: dealers = [], isLoading: isDealersLoading } = useGetDealersQuery();

  const districtOptions = useMemo(() => getDistrictOptions(districts), [districts]);
  const fertilizerOptions = useMemo(() => getFertilizerOptions(fertilizers), [fertilizers]);
  const dealerOptions = useMemo(() => getDealerOptions(dealers), [dealers]);

  const [formData, setFormData] = useState({
    district: '',
    customDistrict: '',
    chiefdoms: [createChiefdomEntry()],
  });

  const [formError, setFormError] = useState('');
  const [isProcessingData, setIsProcessingData] = useState(true);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modalBagTotals = useMemo(() => formData.chiefdoms.reduce((acc, c) => {
    const cTotals = c.fertilizers.reduce((fAcc, f) => ({
      total25: fAcc.total25 + (Number(f.bag25kg) || 0),
      total50: fAcc.total50 + (Number(f.bag50kg) || 0),
    }), { total25: 0, total50: 0 });
    return {
      total25: acc.total25 + cTotals.total25,
      total50: acc.total50 + cTotals.total50,
    };
  }, { total25: 0, total50: 0 }), [formData.chiefdoms]);

  // Get full draft form from state for saving
  const districtForm = useSelector((state) => state.draft.districtForm);

  // Combine loading states
  const isLoading = isDistrictsLoading
    || isChiefdomsLoading
    || isFertilizersLoading
    || isDealersLoading
    || isProcessingData;

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(logOut());
      navigate('/login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  // Populate form data when district prop changes
  useEffect(() => {
    if (district && !isDataInitialized && districts.length > 0 && chiefdoms.length > 0) {
      // Resolve IDs from Names for the modal display
      // We need to do this here because the stored data uses Names, but the Selects use IDs

      // 1. Resolve District ID
      const districtName = district.district || '';
      // Try to find by name first, then by ID match
      let foundDistrict = districts.find((d) => d.name === districtName);
      if (!foundDistrict) {
        foundDistrict = districts.find((d) => d.id.toString() === districtName);
      }

      let districtId = '';
      let customDistrict = '';

      if (foundDistrict) {
        districtId = foundDistrict.id.toString();
      } else if (districtName === 'custom') {
        districtId = 'custom';
        customDistrict = district.customDistrict || '';
      } else {
        // It might be a custom name that isn't 'custom' keyword yet
        districtId = 'custom';
        customDistrict = districtName;
      }

      // 2. Resolve Chiefdom IDs
      const initialChiefdoms = Array.isArray(district.chiefdoms)
        ? district.chiefdoms
        : [createChiefdomEntry()];

      const resolvedChiefdoms = initialChiefdoms.map((c) => {
        // Chiefdom Name Resolution
        let foundCh = chiefdoms.find((ref) => ref.name === c.name);
        if (!foundCh) {
          foundCh = chiefdoms.find((ref) => ref.id.toString() === c.name);
        }
        const isCustom = !foundCh && !!c.name;

        // Fertilizer Transformation (Legacy -> New)
        // Group by unique fertilizer identifier
        // (name + custom info + dealership) to merge bag sizes
        const fertilizerMap = new Map();

        (c.fertilizers || []).forEach((f) => {
          // Create a unique key for grouping
          const fName = f.name || '';
          const fCustomName = f.customName || '';
          const fUseCustom = f.useCustomName || false;

          // Resolve Dealer ID
          // The draft might have a dealer Name (legacy) or ID
          const dealerInput = f.dealership || '';
          let dealerId = '';

          const foundDealer = dealers.find(
            (d) => d.name === dealerInput || d.id.toString() === dealerInput,
          );
          if (foundDealer) {
            dealerId = foundDealer.id.toString();
          } else {
            // If not found in list, we might just keep the value if it's not empty?
            // Or leave it empty to force re-selection?
            // Let's keep it to be safe, but it won't show in dropdown if not in options
            dealerId = dealerInput;
          }

          // Key includes name, custom-ness, and dealership to identify "same" fertilizer row
          const key = `${fName}|${fUseCustom}|${fCustomName}|${dealerId}`;

          if (!fertilizerMap.has(key)) {
            fertilizerMap.set(key, {
              ...createFertilizerEntry(), // Start with clean entry with IDs
              ...f, // Copy existing props
              id: f.id || uniqueId('fert'),
              name: fName,
              useCustomName: fUseCustom,
              customName: fCustomName,
              dealership: dealerId,
              bag25kg: f.bag25kg || '', // Initialize/Keep
              bag50kg: f.bag50kg || '', // Initialize/Keep
            });
          }

          const current = fertilizerMap.get(key);

          // Handle Legacy Format (bagSize/bagCount)
          if (f.bagSize && f.bagCount) {
            if (f.bagSize === '25') current.bag25kg = f.bagCount;
            if (f.bagSize === '50') current.bag50kg = f.bagCount;
          }
        });

        const consolidatedFertilizers = Array.from(fertilizerMap.values());
        if (consolidatedFertilizers.length === 0) {
          consolidatedFertilizers.push(createFertilizerEntry());
        }

        return {
          ...c,
          name: foundCh ? foundCh.id.toString() : '',
          useCustomName: isCustom,
          customName: isCustom ? c.name : '',
          fertilizers: consolidatedFertilizers,
        };
      });

      setFormData({
        ...district,
        district: districtId,
        customDistrict,
        chiefdoms: resolvedChiefdoms,
      });

      setIsDataInitialized(true);
      setIsProcessingData(false);
    }
  }, [district, districts, chiefdoms, dealers, isDataInitialized]);

  /* ------------------ HANDLERS ------------------ */

  if (!district || !isAuthenticated) return null;

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      customDistrict: newDistrict === 'custom' ? prev.customDistrict : '',
      // Clear chiefdom names when district changes to force re-selection
      chiefdoms: prev.chiefdoms.map((chiefdom) => ({
        ...chiefdom,
        name: '',
        useCustomName: false,
        customName: '',
        validationErrors: resetChiefdomValEr(chiefdom),
      })),
    }));
  };

  const handleChiefdomChange = (chiefdomId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      chiefdoms: prev.chiefdoms.map((c) => {
        if (c.id !== chiefdomId) return c;

        const validationErrors = c.validationErrors || resetChiefdomValEr(c);
        let nextErrors = { ...validationErrors };

        if (field === 'name') {
          // Special handling for chiefdom name validation
          const selectedChiefdom = value !== 'custom'
            ? chiefdoms.find((ref) => ref.id.toString() === value)
            : null;
          const chiefdomName = selectedChiefdom ? selectedChiefdom.name : value;
          const isDuplicate = value !== 'custom'
            && hasDuplicateChiefdomName(prev.chiefdoms, chiefdomId, chiefdomName, chiefdoms);

          if (isDuplicate) {
            nextErrors = setChiefdomError(validationErrors, 'name', DUPLICATE_ERRORS.chiefdom);
          } else {
            nextErrors = clearChiefdomError(validationErrors, 'name');
          }

          return {
            ...c,
            name: value,
            customName: value === 'custom' ? c.customName : '',
            useCustomName: value === 'custom',
            validationErrors: nextErrors,
          };
        }

        if (field === 'customName') {
          const isDuplicate = hasDuplicateChiefdomName(
            prev.chiefdoms,
            chiefdomId,
            value,
            chiefdoms,
          );
          if (isDuplicate) {
            nextErrors = setChiefdomError(validationErrors, 'name', DUPLICATE_ERRORS.chiefdom);
          } else {
            nextErrors = clearChiefdomError(validationErrors, 'name');
          }
          return { ...c, customName: value, validationErrors: nextErrors };
        }

        return { ...c, [field]: value };
      }),
    }));
  };

  const handleFertilizerChange = (
    chiefdomId,
    fertilizerId,
    field,
    value,
  ) => {
    setFormData((prev) => ({
      ...prev,
      chiefdoms: prev.chiefdoms.map((c) => {
        if (c.id !== chiefdomId) return c;

        const validationErrors = c.validationErrors || resetChiefdomValEr(c);
        const fertilizerErrors = validationErrors.fertilizers[fertilizerId] || crFertValSt();

        // Clear validation errors for the field being changed
        if (field === 'name' || field === 'customName') {
          delete fertilizerErrors.name;
        } else if (field === 'dealership') {
          delete fertilizerErrors.dealership;
        } else if (field === 'bag25kg' || field === 'bag50kg') {
          delete fertilizerErrors.bagSizes;
          delete fertilizerErrors[field];
        }

        const nextFertilizers = c.fertilizers.map((f) => {
          if (f.id !== fertilizerId) return f;

          const updatedFertilizer = { ...f, [field]: value };
          if (field === 'name') {
            updatedFertilizer.useCustomName = value === 'custom';
            if (value !== 'custom') updatedFertilizer.customName = '';
          }
          return updatedFertilizer;
        });

        return {
          ...c,
          fertilizers: nextFertilizers,
          validationErrors: {
            ...validationErrors,
            fertilizers: {
              ...validationErrors.fertilizers,
              [fertilizerId]: fertilizerErrors,
            },
          },
        };
      }),
    }));
  };

  const addChiefdom = () => {
    setFormData((prev) => ({
      ...prev,
      chiefdoms: [...prev.chiefdoms, createChiefdomEntry()],
    }));
  };

  const removeChiefdom = (id) => {
    setFormData((prev) => ({
      ...prev,
      chiefdoms: prev.chiefdoms.filter((c) => c.id !== id),
    }));
  };

  const addFertilizer = (chiefdomId) => {
    setFormData((prev) => ({
      ...prev,
      chiefdoms: prev.chiefdoms.map((c) => {
        if (c.id !== chiefdomId) return c;
        const newFert = createFertilizerEntry();
        const nextValidationErrors = addFertilizerValidationError(
          c.validationErrors || resetChiefdomValEr(c),
          newFert.id,
        );
        return {
          ...c,
          fertilizers: [...c.fertilizers, newFert],
          validationErrors: nextValidationErrors,
        };
      }),
    }));
  };

  const removeFertilizer = (chiefdomId, fertilizerId) => {
    setFormData((prev) => ({
      ...prev,
      chiefdoms: prev.chiefdoms.map((c) => {
        if (c.id !== chiefdomId) return c;
        const nextValidationErrors = removeFertilizerValidationError(
          c.validationErrors || resetChiefdomValEr(c),
          fertilizerId,
        );
        return {
          ...c,
          fertilizers: c.fertilizers.filter((f) => f.id !== fertilizerId),
          validationErrors: nextValidationErrors,
        };
      }),
    }));
  };

  const handleSave = () => {
    setFormError('');

    // 1. Basic district validation
    if (!formData.district || (formData.district === 'custom' && !formData.customDistrict)) {
      setFormError('Please select a district or enter a custom district name.');
      return;
    }

    // 2. Chiefdom and Fertilizer validation
    const invalidChiefdoms = formData.chiefdoms
      .map((chiefdom) => {
        const validation = validateChiefdomEntry(chiefdom, chiefdoms);
        return validation.isValid ? null : { id: chiefdom.id, validationErrors: validation.errors };
      })
      .filter(Boolean);

    if (invalidChiefdoms.length > 0) {
      setFormData((prev) => ({
        ...prev,
        chiefdoms: prev.chiefdoms.map((chiefdom) => {
          const invalid = invalidChiefdoms.find((item) => item.id === chiefdom.id);
          if (!invalid) {
            return chiefdom;
          }
          return {
            ...chiefdom,
            validationErrors: invalid.validationErrors,
            isCollapsed: false, // Expand to show errors
          };
        }),
      }));
      setFormError('Please resolve the errors highlighted below.');
      return;
    }

    const districtLabel = districtOptions.find(
      (d) => d.value === formData.district,
    )?.label || formData.customDistrict;

    const preparedChiefdoms = formData.chiefdoms.map((chiefdom) => {
      let chiefdomLabel = '';
      if (chiefdom.useCustomName) {
        chiefdomLabel = (chiefdom.customName || '').trim();
      } else {
        const found = getChiefdomOptions(chiefdoms, formData.district)
          .find((c) => c.value === chiefdom.name);
        chiefdomLabel = found?.label || '';
      }

      const fertEntries = chiefdom.fertilizers.map((fert) => {
        const fertLabel = getfertNameValue(fert);

        // Aggregate both bag sizes into a single object
        return {
          id: uniqueId('fert'),
          name: fertLabel,
          dealership: (fert.dealership || '').trim(),
          bag25kg: Number(fert.bag25kg) || 0,
          bag50kg: Number(fert.bag50kg) || 0,
        };
      }).filter(Boolean);

      return {
        name: chiefdomLabel,
        fertilizers: fertEntries,
      };
    }).filter(Boolean);

    const updatedDistrictData = {
      id: district.id, // Preserve established ID
      name: districtLabel,
      district: districtLabel,
      chiefdoms: preparedChiefdoms,
      totals: modalBagTotals,
      createdAt: district.createdAt || new Date().toISOString(),
    };

    // 2. Prepare full draft data for backend save
    const currentDistricts = districtForm.data?.districts || [];
    const updatedDistricts = currentDistricts.map((d) => (
      d.id === district.id ? { ...d, ...updatedDistrictData } : d
    ));

    // If for some reason the district wasn't in the list (shouldn't happen for Edit),
    // ensure it's at least present? No, Edit implies it exists.

    const draftData = {
      title: districtForm.title || `Draft - ${new Date().toLocaleDateString()}`,
      data: {
        ...districtForm.data,
        districts: updatedDistricts,
      },
      status: 'draft',
    };

    setIsSaving(true);
    // 3. Persist to backend and wait for success
    dispatch(saveDraft({ draftData, draftId: districtForm.id }))
      .unwrap()
      .then(() => {
        // 4. Note: state is updated automatically via saveDraft.fulfilled extraReducer
        dispatch(triggerSuccessMessage());
        onClose();
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to save district:', err);
        setFormError(err.message || 'Failed to save changes. Please try again.');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (!district) return null;

  /* ------------------ RENDER ------------------ */

  return (
    <div className="district-modal-overlay">
      <div className="district-modal">
        <div className="district-modal-header">
          <div>
            <h3>Edit District Data</h3>
            <p>Update district details below.</p>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="district-modal-body">
          {isLoading ? (
            <div
              className="loading-state-container"
              style={{
                padding: '40px', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div className="loading-spinner" />
              <p className="loading-text" style={{ marginTop: '16px', color: '#6b7280' }}>Loading district data...</p>
            </div>
          ) : (
            <>
              <section className="modal-section">
                <div className="form-field">
                  <FormLabel htmlFor="district-select" label="District Name">
                    <select
                      id="district-select"
                      value={formData.district}
                      onChange={handleDistrictChange}
                    >
                      <option value="">Select district</option>
                      {districtOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                      <option value="custom">Other</option>
                    </select>
                  </FormLabel>
                </div>

                {formData.district === 'custom' && (
                  <div className="form-field">
                    <FormLabel htmlFor="district-custom" label="Custom District">
                      <input
                        id="district-custom"
                        type="text"
                        placeholder="Enter custom district"
                        value={formData.customDistrict}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          customDistrict: e.target.value,
                        }))}
                      />
                    </FormLabel>
                  </div>
                )}
              </section>

              <section className="modal-section">
                <div className="modal-section-header">
                  <h4>Chiefdoms</h4>
                  <button type="button" className="add-row-btn" onClick={addChiefdom}>
                    + Add Chiefdom
                  </button>
                </div>

                <div className="chiefdom-grid">
                  {formData.chiefdoms.map((chiefdom, index) => {
                    const currentChiefdomOptions = getChiefdomOptions(
                      chiefdoms,
                      formData.district,
                    );

                    return (
                      <div key={chiefdom.id} className="chiefdom-card">
                        <div className="chiefdom-card-header">
                          <h5>
                            Chiefdom
                            {index + 1}
                          </h5>
                          {formData.chiefdoms.length > 1 && (
                            <button type="button" className="remove-row-btn" onClick={() => removeChiefdom(chiefdom.id)}>
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="form-field">
                          <FormLabel htmlFor={`c-select-${chiefdom.id}`} label="Chiefdom">
                            <select
                              id={`c-select-${chiefdom.id}`}
                              value={chiefdom.useCustomName ? 'custom' : chiefdom.name}
                              onChange={(e) => handleChiefdomChange(
                                chiefdom.id,
                                e.target.value === 'custom' ? 'useCustomName' : 'name',
                                e.target.value === 'custom' ? true : e.target.value,
                              )}
                            >
                              <option value="">Select chiefdom</option>
                              {currentChiefdomOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                              <option value="custom">Other</option>
                            </select>
                            <FieldError
                              id={`c-name-err-${chiefdom.id}`}
                              message={chiefdom.validationErrors?.name}
                            />
                          </FormLabel>
                        </div>

                        {chiefdom.useCustomName && (
                          <div className="form-field">
                            <FormLabel htmlFor={`c-custom-${chiefdom.id}`} label="Custom Name">
                              <input
                                id={`c-custom-${chiefdom.id}`}
                                type="text"
                                placeholder="Custom chiefdom name"
                                value={chiefdom.customName}
                                onChange={(e) => handleChiefdomChange(
                                  chiefdom.id,
                                  'customName',
                                  e.target.value,
                                )}
                              />
                              <FieldError
                                id={`c-custom-err-${chiefdom.id}`}
                                message={chiefdom.validationErrors?.name}
                              />
                            </FormLabel>
                          </div>
                        )}

                        <div className="chiefdom-card-subheader">
                          <h6>Fertilizers</h6>
                          <button type="button" className="link-btn" onClick={() => addFertilizer(chiefdom.id)}>
                            + Add Fertilizer
                          </button>
                        </div>

                        <div className="fertilizer-list">
                          {chiefdom.fertilizers.map((fert) => (
                            <div key={fert.id} className="fertilizer-row">
                              <div className="fertilizer-field">
                                <FormLabel htmlFor={`f-name-${fert.id}`} label="Fertilizer">
                                  <select
                                    id={`f-name-${fert.id}`}
                                    value={fert.useCustomName ? 'custom' : fert.name}
                                    onChange={(e) => handleFertilizerChange(
                                      chiefdom.id,
                                      fert.id,
                                      e.target.value === 'custom' ? 'useCustomName' : 'name',
                                      e.target.value === 'custom' ? true : e.target.value,
                                    )}
                                  >
                                    <option value="">Select fertilizer</option>
                                    {fertilizerOptions.map((name) => (
                                      <option key={name} value={name}>
                                        {name}
                                      </option>
                                    ))}
                                    <option value="custom">Other</option>
                                  </select>
                                  <FieldError
                                    id={`f-name-err-${fert.id}`}
                                    message={chiefdom.validationErrors?.fertilizers[fert.id]?.name}
                                  />
                                </FormLabel>
                              </div>

                              {fert.useCustomName && (
                                <div className="form-field">
                                  <FormLabel htmlFor={`f-custom-${fert.id}`} label="Custom Fertilizer">
                                    <input
                                      id={`f-custom-${fert.id}`}
                                      type="text"
                                      placeholder="Custom fertilizer"
                                      value={fert.customName}
                                      onChange={(e) => handleFertilizerChange(
                                        chiefdom.id,
                                        fert.id,
                                        'customName',
                                        e.target.value,
                                      )}
                                    />
                                    <FieldError
                                      id={`f-custom-err-${fert.id}`}
                                      message={
                                        chiefdom.validationErrors?.fertilizers[fert.id]?.name
                                      }
                                    />
                                  </FormLabel>
                                </div>
                              )}

                              <div className="form-field">
                                <FormLabel htmlFor={`f-dealer-${fert.id}`} label="Dealership">
                                  <select
                                    id={`f-dealer-${fert.id}`}
                                    value={fert.dealership}
                                    onChange={(e) => handleFertilizerChange(
                                      chiefdom.id,
                                      fert.id,
                                      'dealership',
                                      e.target.value,
                                    )}
                                  >
                                    <option value="">Select a dealer</option>
                                    {dealerOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                        {' '}
                                        (
                                        {opt.licenseNumber}
                                        )
                                      </option>
                                    ))}
                                  </select>
                                  <FieldError
                                    id={`f-dealer-err-${fert.id}`}
                                    message={
                                      chiefdom.validationErrors?.fertilizers[fert.id]?.dealership
                                    }
                                  />
                                </FormLabel>
                              </div>

                              <div className="bag-sizes-section">
                                <h6>Bag Sizes</h6>
                                <div className="bag-size-row">
                                  <div className="form-field">
                                    <FormLabel htmlFor={`bag25-${fert.id}`} label="25kg Bags">
                                      <input
                                        id={`bag25-${fert.id}`}
                                        type="number"
                                        placeholder="0"
                                        value={fert.bag25kg}
                                        onChange={(e) => handleFertilizerChange(
                                          chiefdom.id,
                                          fert.id,
                                          'bag25kg',
                                          e.target.value,
                                        )}
                                      />
                                      <FieldError
                                        id={`bag25-err-${fert.id}`}
                                        message={
                                          chiefdom.validationErrors?.fertilizers[fert.id]?.bag25kg
                                        }
                                      />
                                    </FormLabel>
                                  </div>
                                  <div className="form-field">
                                    <FormLabel htmlFor={`bag50-${fert.id}`} label="50kg Bags">
                                      <input
                                        id={`bag50-${fert.id}`}
                                        type="number"
                                        placeholder="0"
                                        value={fert.bag50kg}
                                        onChange={(e) => handleFertilizerChange(
                                          chiefdom.id,
                                          fert.id,
                                          'bag50kg',
                                          e.target.value,
                                        )}
                                      />
                                      <FieldError
                                        id={`bag50-err-${fert.id}`}
                                        message={
                                          chiefdom.validationErrors?.fertilizers[fert.id]?.bag50kg
                                        }
                                      />
                                    </FormLabel>
                                  </div>
                                </div>
                                <FieldError
                                  id={`bag-sizes-err-${fert.id}`}
                                  message={
                                    chiefdom.validationErrors?.fertilizers[fert.id]?.bagSizes
                                  }
                                />
                              </div>

                              {chiefdom.fertilizers.length > 1 && (
                                <button
                                  type="button"
                                  className="remove-row-btn small"
                                  onClick={() => removeFertilizer(chiefdom.id, fert.id)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formError && <p className="modal-error">{formError}</p>}
              </section>
            </>
          )}
        </div>

        <div className="district-modal-footer">
          <div className="bag-total-row">
            <span>
              25kg Bags:
              <strong>{modalBagTotals.total25}</strong>
            </span>
            <span>
              50kg Bags:
              <strong>{modalBagTotals.total50}</strong>
            </span>
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="secondary-btn" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="button" className="primary-btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DistrictEditModal.propTypes = {
  district: PropTypes.shape({
    id: PropTypes.string.isRequired,
    district: PropTypes.string,
    customDistrict: PropTypes.string,
    chiefdoms: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      customName: PropTypes.string,
      fertilizers: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        customName: PropTypes.string,
        dealership: PropTypes.string,
        bag25kg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bag50kg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })),
    })),
    createdAt: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DistrictEditModal;
