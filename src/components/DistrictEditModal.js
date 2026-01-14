/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateDistrict } from '../features/district/districtSlice';
import './styles/DistrictEditModal.css';

const DistrictEditModal = ({ district, onClose }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    chiefdoms: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (district) {
      setFormData({
        name: district.name,
        chiefdoms: district.chiefdoms || [],
      });
    }
  }, [district]);

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

      if (!chiefdom.dealership || !chiefdom.dealership.trim()) {
        newErrors[`dealership_${chiefdom.id}`] = 'Dealership is required';
      }

      chiefdom.fertilizers.forEach((fertilizer) => {
        const fertilizerName = fertilizer.name || fertilizer.customName;

        if (!fertilizerName || !fertilizerName.trim()) {
          newErrors[`fertilizer_${fertilizer.id}`] = 'Fertilizer name is required';
        }

        if (!Number(fertilizer.bagCount) || Number(fertilizer.bagCount) <= 0) {
          newErrors[`bags_${fertilizer.id}`] = 'Valid bag count is required';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      dispatch(updateDistrict({ id: district.id, updatedData: formData }));
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
            <label id="district-name-label">District Name</label>
            <input
              id="district-name"
              aria-labelledby="district-name-label"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                });
              }}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          {formData.chiefdoms.map((chiefdom) => (
            <div key={chiefdom.id} className="chiefdom-edit-card">
              <h4>Chiefdom</h4>

              <div className="form-field">
                <label id={`chiefdom-name-label-${chiefdom.id}`}>Name</label>
                <input
                  id={`chiefdom-name-${chiefdom.id}`}
                  aria-labelledby={`chiefdom-name-label-${chiefdom.id}`}
                  type="text"
                  value={chiefdom.name || chiefdom.customName || ''}
                  onChange={(e) => {
                    handleChiefdomChange(
                      chiefdom.id,
                      'name',
                      e.target.value,
                    );
                  }}
                  className={
                    errors[`chiefdom_${chiefdom.id}`] ? 'error' : ''
                  }
                />
                {errors[`chiefdom_${chiefdom.id}`] && (
                  <span className="error-message">{errors[`chiefdom_${chiefdom.id}`]}</span>
                )}
              </div>

              <div className="form-field">
                <label id={`dealership-label-${chiefdom.id}`}>Dealership</label>
                <input
                  id={`dealership-${chiefdom.id}`}
                  aria-labelledby={`dealership-label-${chiefdom.id}`}
                  type="text"
                  value={chiefdom.dealership || ''}
                  onChange={(e) => {
                    handleChiefdomChange(
                      chiefdom.id,
                      'dealership',
                      e.target.value,
                    );
                  }}
                  className={
                    errors[`dealership_${chiefdom.id}`] ? 'error' : ''
                  }
                />
                {errors[`dealership_${chiefdom.id}`] && (
                  <span className="error-message">{errors[`dealership_${chiefdom.id}`]}</span>
                )}
              </div>

              {chiefdom.fertilizers.map((fertilizer) => (
                <div key={fertilizer.id} className="fertilizer-edit-item">
                  <div className="form-field">
                    <label id={`fertilizer-label-${fertilizer.id}`}>
                      Fertilizer Name
                    </label>
                    <input
                      id={`fertilizer-${fertilizer.id}`}
                      aria-labelledby={`fertilizer-label-${fertilizer.id}`}
                      type="text"
                      value={
                        fertilizer.name
                        || fertilizer.customName
                        || ''
                      }
                      onChange={(e) => {
                        handleFertilizerChange(
                          chiefdom.id,
                          fertilizer.id,
                          'name',
                          e.target.value,
                        );
                      }}
                      className={
                        errors[`fertilizer_${fertilizer.id}`]
                          ? 'error'
                          : ''
                      }
                    />
                    {errors[`fertilizer_${fertilizer.id}`] && (
                      <span className="error-message">{errors[`fertilizer_${fertilizer.id}`]}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label id={`bags-label-${fertilizer.id}`}>Bag Count</label>
                    <input
                      id={`bags-${fertilizer.id}`}
                      aria-labelledby={`bags-label-${fertilizer.id}`}
                      type="number"
                      min="0"
                      value={fertilizer.bagCount || ''}
                      onChange={(e) => {
                        handleFertilizerChange(
                          chiefdom.id,
                          fertilizer.id,
                          'bagCount',
                          e.target.value,
                        );
                      }}
                      className={
                        errors[`bags_${fertilizer.id}`]
                          ? 'error'
                          : ''
                      }
                    />
                    {errors[`bags_${fertilizer.id}`] && (
                      <span className="error-message">{errors[`bags_${fertilizer.id}`]}</span>
                    )}
                  </div>
                </div>
              ))}
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
        dealership: PropTypes.string,
        fertilizers: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            customName: PropTypes.string,
            bagCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
