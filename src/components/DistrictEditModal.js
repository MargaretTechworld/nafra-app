import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateDistrict } from '../features/district/districtSlice';
import { logout } from '../features/auth/authSlice';
import './styles/DistrictEditModal.css';

const DistrictEditModal = ({ district, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    chiefdoms: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (district) {
      const updatedChiefdoms = (district.chiefdoms || []).map((chiefdom) => ({
        ...chiefdom,
        fertilizers: (chiefdom.fertilizers || []).map((fertilizer) => ({
          ...fertilizer,
          bag25kg: fertilizer.bag25kg || (fertilizer.bagSize === '25' ? fertilizer.bagCount : ''),
          bag50kg: fertilizer.bag50kg || (fertilizer.bagSize === '50' ? fertilizer.bagCount : ''),
        })),
      }));

      setFormData({
        name: district.name,
        chiefdoms: updatedChiefdoms,
      });
    }
  }, [district]);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(logout());
      navigate('/login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleChiefdomChange = (chiefdomId, field, value) => {
    setFormData((prev) => {
      const updatedChiefdoms = prev.chiefdoms.map((chiefdom) => {
        if (chiefdom.id === chiefdomId) {
          return {
            ...chiefdom,
            [field]: value,
          };
        }
        return chiefdom;
      });
      return {
        ...prev,
        chiefdoms: updatedChiefdoms,
      };
    });
  };

  const handleFertilizerChange = (chiefdomId, fertilizerId, field, value) => {
    setFormData((prev) => {
      const updatedChiefdoms = prev.chiefdoms.map((chiefdom) => {
        if (chiefdom.id !== chiefdomId) {
          return chiefdom;
        }

        const updatedFertilizers = chiefdom.fertilizers.map((fertilizer) => {
          if (fertilizer.id === fertilizerId) {
            return {
              ...fertilizer,
              [field]: value,
            };
          }
          return fertilizer;
        });

        return {
          ...chiefdom,
          fertilizers: updatedFertilizers,
        };
      });

      return {
        ...prev,
        chiefdoms: updatedChiefdoms,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'District name is required';
    }

    formData.chiefdoms.forEach((chiefdom) => {
      const chiefdomName = chiefdom.name || chiefdom.customName;
      if (!chiefdomName || !chiefdomName.trim()) {
        newErrors[`chiefdom_${chiefdom.id}`] = 'Chiefdom name is required';
      }

      chiefdom.fertilizers.forEach((fertilizer) => {
        const fertilizerName = fertilizer.name || fertilizer.customName;
        if (!fertilizerName || !fertilizerName.trim()) {
          newErrors[`fertilizer_${fertilizer.id}`] = 'Fertilizer name is required';
        }
        if (!fertilizer.dealership || !fertilizer.dealership.trim()) {
          newErrors[`dealership_${fertilizer.id}`] = 'Dealership is required';
        }

        // Check if 25kg bags have a valid count
        const has25kg = fertilizer.bag25kg
          && String(fertilizer.bag25kg).trim()
          && Number(fertilizer.bag25kg) > 0;
        // Check if 50kg bags have a valid count
        const has50kg = fertilizer.bag50kg
          && String(fertilizer.bag50kg).trim()
          && Number(fertilizer.bag50kg) > 0;

        if (!has25kg && !has50kg) {
          newErrors[`bagSizes_${fertilizer.id}`] = 'At least one bag size (25kg or 50kg) must be specified.';
        } else {
          delete newErrors[`bagSizes_${fertilizer.id}`];
        }

        // Validate 25kg bag count
        if (fertilizer.bag25kg
            && String(fertilizer.bag25kg).trim()
            && Number(fertilizer.bag25kg) <= 0) {
          newErrors[`bag25kg_${fertilizer.id}`] = 'Enter valid bag count for 25kg bags.';
        }

        // Validate 50kg bag count
        if (fertilizer.bag50kg
            && String(fertilizer.bag50kg).trim()
            && Number(fertilizer.bag50kg) <= 0) {
          newErrors[`bag50kg_${fertilizer.id}`] = 'Enter valid bag count for 50kg bags.';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const preparedData = {
        ...formData,
        chiefdoms: formData.chiefdoms.map((chiefdom) => ({
          ...chiefdom,
          fertilizers: chiefdom.fertilizers
            .map((fertilizer) => {
              const fName = fertilizer.name || fertilizer.customName;
              if (!fName) {
                return null;
              }

              const entries = [];
              if (fertilizer.bag25kg && Number(fertilizer.bag25kg) > 0) {
                entries.push({
                  ...fertilizer,
                  bagSize: '25',
                  bagCount: Number(fertilizer.bag25kg) || 0,
                });
              }
              if (fertilizer.bag50kg && Number(fertilizer.bag50kg) > 0) {
                entries.push({
                  ...fertilizer,
                  bagSize: '50',
                  bagCount: Number(fertilizer.bag50kg) || 0,
                });
              }
              return entries;
            })
            .flat()
            .filter(Boolean),
        })),
      };

      dispatch(updateDistrict({ id: district.id, updatedData: preparedData }));
      onClose();
    }
  };

  if (!district) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="district-edit-modal">
        <div className="modal-header">
          <h2>Edit District</h2>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="form-field">
            <label htmlFor="district-name">
              District Name
              <input
                id="district-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                }}
                className={errors.name ? 'error' : ''}
                aria-describedby={errors.name ? 'district-name-error' : undefined}
              />
            </label>
            {errors.name && (
              <span id="district-name-error" className="error-message">
                {errors.name}
              </span>
            )}
          </div>

          {formData.chiefdoms.map((chiefdom) => (
            <div key={chiefdom.id} className="chiefdom-edit-card">
              <h4>Chiefdom</h4>

              <div className="form-field">
                <label htmlFor={`chiefdom-name-${chiefdom.id}`}>
                  Name
                  <input
                    id={`chiefdom-name-${chiefdom.id}`}
                    type="text"
                    value={chiefdom.name || chiefdom.customName || ''}
                    onChange={(e) => {
                      handleChiefdomChange(chiefdom.id, 'name', e.target.value);
                    }}
                    className={errors[`chiefdom_${chiefdom.id}`] ? 'error' : ''}
                  />
                </label>
                {errors[`chiefdom_${chiefdom.id}`] && (
                  <span id={`chiefdom-error-${chiefdom.id}`} className="error-message">
                    {errors[`chiefdom_${chiefdom.id}`]}
                  </span>
                )}
              </div>

              <div className="fertilizer-list">
                {(() => {
                  const groupedFertilizers = chiefdom.fertilizers.reduce((acc, fertilizer) => {
                    const name = fertilizer.name || fertilizer.customName || '';
                    const dealership = fertilizer.dealership || '';
                    const key = `${name}-${dealership}`;
                    if (!acc[key]) {
                      acc[key] = {
                        name: fertilizer.name || fertilizer.customName,
                        dealership: fertilizer.dealership,
                        bag25kg: 0,
                        bag50kg: 0,
                        originalFertilizers: [],
                      };
                    }

                    if (fertilizer.bagSize === '25') {
                      acc[key].bag25kg += Number(fertilizer.bagCount) || 0;
                    } else if (fertilizer.bagSize === '50') {
                      acc[key].bag50kg += Number(fertilizer.bagCount) || 0;
                    }

                    if (fertilizer.bag25kg) {
                      acc[key].bag25kg += Number(fertilizer.bag25kg) || 0;
                    }
                    if (fertilizer.bag50kg) {
                      acc[key].bag50kg += Number(fertilizer.bag50kg) || 0;
                    }

                    acc[key].originalFertilizers.push(fertilizer);
                    return acc;
                  }, {});

                  return Object.entries(groupedFertilizers).map(([key, groupedFert]) => (
                    <div key={key} className="fertilizer-edit-item">
                      <div className="form-field">
                        <label htmlFor={`fertilizer-${groupedFert.originalFertilizers[0]?.id}`}>
                          Fertilizer Name
                          <input
                            id={`fertilizer-${groupedFert.originalFertilizers[0]?.id}`}
                            type="text"
                            value={groupedFert.name || ''}
                            onChange={(e) => {
                              groupedFert.originalFertilizers.forEach((fert) => {
                                handleFertilizerChange(chiefdom.id, fert.id, 'name', e.target.value);
                              });
                            }}
                            className={errors[`fertilizer_${groupedFert.originalFertilizers[0]?.id}`] ? 'error' : ''}
                            aria-describedby={errors[`fertilizer_${groupedFert.originalFertilizers[0]?.id}`] ? `fertilizer-error-${groupedFert.originalFertilizers[0]?.id}` : undefined}
                          />
                        </label>
                        {errors[`fertilizer_${groupedFert.originalFertilizers[0]?.id}`] && (
                          <span id={`fertilizer-error-${groupedFert.originalFertilizers[0]?.id}`} className="error-message">
                            {errors[`fertilizer_${groupedFert.originalFertilizers[0]?.id}`]}
                          </span>
                        )}
                      </div>

                      <div className="form-field">
                        <label htmlFor={`dealership-${groupedFert.originalFertilizers[0]?.id}`}>
                          Dealership
                          <input
                            id={`dealership-${groupedFert.originalFertilizers[0]?.id}`}
                            type="text"
                            value={groupedFert.dealership || ''}
                            onChange={(e) => {
                              groupedFert.originalFertilizers.forEach((fert) => {
                                handleFertilizerChange(chiefdom.id, fert.id, 'dealership', e.target.value);
                              });
                            }}
                            className={errors[`dealership_${groupedFert.originalFertilizers[0]?.id}`] ? 'error' : ''}
                            aria-describedby={errors[`dealership_${groupedFert.originalFertilizers[0]?.id}`] ? `dealership-error-${groupedFert.originalFertilizers[0]?.id}` : undefined}
                          />
                        </label>
                        {errors[`dealership_${groupedFert.originalFertilizers[0]?.id}`] && (
                          <span id={`dealership-error-${groupedFert.originalFertilizers[0]?.id}`} className="error-message">
                            {errors[`dealership_${groupedFert.originalFertilizers[0]?.id}`]}
                          </span>
                        )}
                      </div>

                      <div className="bag-sizes-section">
                        <h6>Bag Sizes</h6>
                        <div className="bag-size-row">
                          <div className="form-field">
                            <label htmlFor={`bag-25kg-${groupedFert.originalFertilizers[0]?.id}`}>
                              25kg Bags
                              <input
                                id={`bag-25kg-${groupedFert.originalFertilizers[0]?.id}`}
                                type="number"
                                min="0"
                                placeholder="0"
                                value={groupedFert.bag25kg || ''}
                                onChange={(e) => {
                                  groupedFert.originalFertilizers.forEach((fert) => {
                                    handleFertilizerChange(chiefdom.id, fert.id, 'bag25kg', e.target.value);
                                  });
                                }}
                                className={errors[`bag25kg_${groupedFert.originalFertilizers[0]?.id}`] ? 'error' : ''}
                                aria-describedby={errors[`bag25kg_${groupedFert.originalFertilizers[0]?.id}`] ? `bag25kg-error-${groupedFert.originalFertilizers[0]?.id}` : undefined}
                              />
                            </label>
                            {errors[`bag25kg_${groupedFert.originalFertilizers[0]?.id}`] && (
                              <span id={`bag25kg-error-${groupedFert.originalFertilizers[0]?.id}`} className="error-message">
                                {errors[`bag25kg_${groupedFert.originalFertilizers[0]?.id}`]}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bag-size-row">
                          <div className="form-field">
                            <label htmlFor={`bag-50kg-${groupedFert.originalFertilizers[0]?.id}`}>
                              50kg Bags
                              <input
                                id={`bag-50kg-${groupedFert.originalFertilizers[0]?.id}`}
                                type="number"
                                min="0"
                                placeholder="0"
                                value={groupedFert.bag50kg || ''}
                                onChange={(e) => {
                                  groupedFert.originalFertilizers.forEach((fert) => {
                                    handleFertilizerChange(chiefdom.id, fert.id, 'bag50kg', e.target.value);
                                  });
                                }}
                                className={errors[`bag50kg_${groupedFert.originalFertilizers[0]?.id}`] ? 'error' : ''}
                                aria-describedby={errors[`bag50kg_${groupedFert.originalFertilizers[0]?.id}`] ? `bag50kg-error-${groupedFert.originalFertilizers[0]?.id}` : undefined}
                              />
                            </label>
                            {errors[`bag50kg_${groupedFert.originalFertilizers[0]?.id}`] && (
                              <span id={`bag50kg-error-${groupedFert.originalFertilizers[0]?.id}`} className="error-message">
                                {errors[`bag50kg_${groupedFert.originalFertilizers[0]?.id}`]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {errors[`bagSizes_${groupedFert.originalFertilizers[0]?.id}`] && (
                        <span id={`bagsizes-error-${groupedFert.originalFertilizers[0]?.id}`} className="error-message">
                          {errors[`bagSizes_${groupedFert.originalFertilizers[0]?.id}`]}
                        </span>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          ))}

        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

DistrictEditModal.propTypes = {
  district: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    chiefdoms: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        customName: PropTypes.string,
        fertilizers: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            customName: PropTypes.string,
            dealership: PropTypes.string,
            bagCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            bagSize: PropTypes.string,
          }),
        ).isRequired,
      }),
    ),
  }),
  onClose: PropTypes.func.isRequired,
};

DistrictEditModal.defaultProps = {
  district: null,
};

export default DistrictEditModal;
