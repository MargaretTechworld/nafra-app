import React from 'react';
import PropTypes from 'prop-types';
import { FormLabel, FieldError } from './ui/FormElements';

const FertilizerRow = ({
  chiefdomId,
  fertilizer,
  fertilizerOptions,
  dealerOptions,
  validationErrors,
  onSelect,
  onFieldChange,
  onRemove,
  canRemove,
}) => {
  const FNameErrorId = `fert-name-error-${fertilizer.id}`;
  const bag25ErrorId = `fert-bag25-error-${fertilizer.id}`;
  const bag50ErrorId = `fert-bag50-error-${fertilizer.id}`;
  const dealerErrorId = `fert-dealer-error-${fertilizer.id}`;

  return (
    <div className="fertilizer-row">
      <div className="fertilizer-field">
        <FormLabel htmlFor={`fert-${fertilizer.id}`} label="Fertilizer Name">
          <select
            id={`fert-${fertilizer.id}`}
            value={fertilizer.useCustomName ? 'custom' : fertilizer.name}
            onChange={(event) => onSelect(chiefdomId, fertilizer.id, event.target.value)}
            aria-invalid={Boolean(validationErrors.name)}
            aria-describedby={validationErrors.name ? FNameErrorId : undefined}
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
        <FieldError id={FNameErrorId} message={validationErrors.name} />
      </div>

      {fertilizer.useCustomName && (
        <div className="fertilizer-field">
          <FormLabel htmlFor={`fert-custom-${fertilizer.id}`} label="Custom Name">
            <input
              id={`fert-custom-${fertilizer.id}`}
              type="text"
              placeholder="e.g. NPK 15-15-15"
              value={fertilizer.customName}
              onChange={(event) => onFieldChange(chiefdomId, fertilizer.id, 'customName', event.target.value)}
              required
            />
          </FormLabel>
        </div>
      )}

      <div className="fertilizer-field bags-field">
        <FormLabel htmlFor={`bag25-${fertilizer.id}`} label="25kg Bags">
          <input
            id={`bag25-${fertilizer.id}`}
            type="number"
            min="0"
            placeholder="0"
            value={fertilizer.bag25kg}
            onChange={(event) => onFieldChange(chiefdomId, fertilizer.id, 'bag25kg', event.target.value)}
          />
        </FormLabel>
        <FieldError id={bag25ErrorId} message={validationErrors.bag25kg} />
      </div>

      <div className="fertilizer-field bags-field">
        <FormLabel htmlFor={`bag50-${fertilizer.id}`} label="50kg Bags">
          <input
            id={`bag50-${fertilizer.id}`}
            type="number"
            min="0"
            placeholder="0"
            value={fertilizer.bag50kg}
            onChange={(event) => onFieldChange(chiefdomId, fertilizer.id, 'bag50kg', event.target.value)}
          />
        </FormLabel>
        <FieldError id={bag50ErrorId} message={validationErrors.bag50kg} />
      </div>

      <div className="fertilizer-field dealer-field">
        <FormLabel htmlFor={`dealer-${fertilizer.id}`} label="Dealer/Center">
          <select
            id={`dealer-${fertilizer.id}`}
            value={fertilizer.dealership}
            onChange={(event) => onFieldChange(chiefdomId, fertilizer.id, 'dealership', event.target.value)}
          >
            <option value="">Select dealer</option>
            {dealerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormLabel>
        <FieldError id={dealerErrorId} message={validationErrors.dealership} />
      </div>

      {canRemove && (
        <button
          type="button"
          className="remove-fert-btn"
          onClick={() => onRemove(chiefdomId, fertilizer.id)}
          title="Remove fertilizer"
        >
          ×
        </button>
      )}
    </div>
  );
};

FertilizerRow.propTypes = {
  chiefdomId: PropTypes.string.isRequired,
  fertilizer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    useCustomName: PropTypes.bool,
    customName: PropTypes.string,
    dealership: PropTypes.string,
    bag25kg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bag50kg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  fertilizerOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  dealerOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  })).isRequired,
  validationErrors: PropTypes.shape({
    name: PropTypes.string,
    dealership: PropTypes.string,
    bag25kg: PropTypes.string,
    bag50kg: PropTypes.string,
    bagSizes: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  canRemove: PropTypes.bool.isRequired,
};

export default FertilizerRow;
