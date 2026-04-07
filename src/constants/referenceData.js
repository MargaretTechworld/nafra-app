// This file will be populated dynamically from the API
// Keeping the structure for backward compatibility during migration

export const DISTRICT_OPTIONS = [];
export const DISTRICT_CHIEFDOMS = {};
export const FERTILIZER_OPTIONS = [];

// Helper functions to get options from Redux state
export const getDistrictOptions = (districts) => {
  if (!districts || !Array.isArray(districts)) return [];
  return districts.map((district) => ({
    value: district.id.toString(),
    label: district.name,
  }));
};

export const getChiefdomOptions = (chiefdoms, districtId) => {
  if (!chiefdoms || !Array.isArray(chiefdoms) || !districtId) return [];

  // Only show chiefdoms when a district is selected
  return chiefdoms
    .filter((chiefdom) => chiefdom.district_id.toString() === districtId.toString())
    .map((chiefdom) => ({
      value: chiefdom.id.toString(),
      label: chiefdom.name,
      districtId: chiefdom.district_id,
    }));
};

export const getFertilizerOptions = (fertilizers) => {
  if (!fertilizers || !Array.isArray(fertilizers)) return [];
  return fertilizers.map((fertilizer) => fertilizer.name);
};

export const getDealerOptions = (dealers) => {
  if (!dealers || !Array.isArray(dealers)) return [];
  return dealers.map((dealer) => ({
    value: dealer.id.toString(),
    label: dealer.name,
    licenseNumber: dealer.license_number,
  }));
};
