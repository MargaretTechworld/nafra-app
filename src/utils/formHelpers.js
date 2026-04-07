export const INITIAL_DISTRICT_ERRORS = {
  district: '',
  customDistrict: '',
};

export const DUPLICATE_ERRORS = {
  chiefdom: 'This chiefdom already exists in the current district entry.',
  fertilizer: 'This fertilizer already exists for this chiefdom.',
};

export const uniqueId = (prefix) => `${prefix}-${Date.now()
}-${Math.random().toString(16).slice(2, 8)
}`;

export const normalizeText = (value = '') => value.trim().toLowerCase();

export const createFertilizerValidationState = () => ({
  name: '',
  dealership: '',
  bag25kg: '',
  bag50kg: '',
});

export const createChiefdomValidationState = (fertilizers = []) => ({
  name: '',
  fertilizers: fertilizers.reduce((acc, fertilizer) => {
    acc[fertilizer.id] = createFertilizerValidationState();
    return acc;
  }, {}),
});

export const resetChiefdomValidationErrors = (
  chiefdom,
) => createChiefdomValidationState(chiefdom.fertilizers);

export const clearChiefdomError = (validationErrors, field) => ({
  ...validationErrors,
  [field]: '',
});

export const setChiefdomError = (validationErrors, field, message) => ({
  ...validationErrors,
  [field]: message,
});

export const clearFertilizerError = (validationErrors, fertilizerId, field) => {
  const fertilizerErrors = validationErrors.fertilizers[fertilizerId]
    || createFertilizerValidationState();
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

export const addFertilizerValidationError = (validationErrors, fertilizerId) => ({
  ...validationErrors,
  fertilizers: {
    ...validationErrors.fertilizers,
    [fertilizerId]: createFertilizerValidationState(),
  },
});

export const removeFertilizerValidationError = (validationErrors, fertilizerId) => {
  const { [fertilizerId]: _removed, ...rest } = validationErrors.fertilizers;
  return {
    ...validationErrors,
    fertilizers: rest,
  };
};

export const setFertilizerError = (validationErrors, fertilizerId, field, message) => {
  const fertilizerErrors = validationErrors.fertilizers[fertilizerId]
    || createFertilizerValidationState();
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

export const validateDistrictSelection = (districtForm) => {
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

export const createFertilizerEntry = () => ({
  id: uniqueId('fert'),
  name: '',
  useCustomName: false,
  customName: '',
  dealership: '',
  bag25kg: '',
  bag50kg: '',
});

export const createChiefdomEntry = () => {
  const initialFertilizer = createFertilizerEntry();
  return {
    id: uniqueId('chiefdom'),
    name: '',
    useCustomName: false,
    customName: '',
    fertilizers: [initialFertilizer],
    isCollapsed: false,
    validationErrors: createChiefdomValidationState([initialFertilizer]),
  };
};

export const getChiefdomNameValue = (chiefdom, referenceChiefdoms = []) => {
  if (!chiefdom) {
    return '';
  }
  if (chiefdom.useCustomName) {
    return chiefdom.customName.trim();
  }
  // Look up the actual chiefdom name from reference data using the ID
  const foundChiefdom = referenceChiefdoms.find((c) => c.id.toString() === chiefdom.name);
  return foundChiefdom ? foundChiefdom.name : '';
};

export const getChiefdomDisplayName = (
  chiefdom,
  referenceChiefdoms = [],
) => getChiefdomNameValue(chiefdom, referenceChiefdoms) || 'Not specified';

export const getFertilizerNameValue = (fertilizer) => {
  if (!fertilizer) {
    return '';
  }
  if (fertilizer.useCustomName) {
    return fertilizer.customName.trim();
  }
  return fertilizer.name;
};

export const hasDuplicateChiefdomName = (
  chiefdoms,
  targetId,
  candidateName,
  referenceChiefdoms = [],
) => {
  const normalizedCandidate = normalizeText(candidateName);
  if (!normalizedCandidate) {
    return false;
  }
  return chiefdoms.some(
    (chiefdom) => chiefdom.id !== targetId
      && normalizeText(getChiefdomNameValue(chiefdom, referenceChiefdoms)) === normalizedCandidate,
  );
};

export const hasDuplicateFertilizerName = (fertilizers, targetId, candidateName) => {
  const normalizedCandidate = normalizeText(candidateName);
  if (!normalizedCandidate) {
    return false;
  }
  return fertilizers.some(
    (fertilizer) => fertilizer.id !== targetId
      && normalizeText(getFertilizerNameValue(fertilizer)) === normalizedCandidate,
  );
};

export const getChiefdomFertilizerSummary = (chiefdom) => {
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

export const validateChiefdomEntry = (chiefdom, referenceChiefdoms = []) => {
  const errors = createChiefdomValidationState(chiefdom.fertilizers);
  const nameValue = getChiefdomNameValue(chiefdom, referenceChiefdoms);

  if (!nameValue) {
    errors.name = 'Select or enter a chiefdom name.';
  }

  chiefdom.fertilizers.forEach((fertilizer) => {
    const fertilizerErrors = errors.fertilizers[fertilizer.id]
      || createFertilizerValidationState();
    const fertName = fertilizer.useCustomName ? fertilizer.customName.trim() : fertilizer.name;
    if (!fertName) {
      fertilizerErrors.name = 'Select or enter a fertilizer name.';
    }
    if (!fertilizer.dealership.trim()) {
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
