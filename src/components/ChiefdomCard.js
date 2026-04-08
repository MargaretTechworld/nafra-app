import React from 'react';
import PropTypes from 'prop-types';
import FertilizerRow from './FertilizerRow';
import { FormLabel, FieldError } from './ui/FormElements';
import {
  getChiefdomDisplayName,
  getChiefdomFertilizerSummary,
} from '../utils/formHelpers';
import { getChiefdomOptions } from '../constants/referenceData';

const ChiefdomCard = ({
  chiefdom,
  index,
  districtForm,
  referenceChiefdoms,
  fertilizerOptions,
  dealerOptions,
  onRemoveChiefdom,
  onToggleCollapse,
  onChiefdomSelect,
  onFieldChange,
  onAddFertilizer,
  onFertilizerSelect,
  onFertilizerFieldChange,
  onRemoveFertilizer,
}) => {
  const chiefdomOptions = getChiefdomOptions(
    referenceChiefdoms,
    districtForm.district,
  );

  const cdomEr = chiefdom.validationErrors || { fertilizers: {} };
  const chiefdomNameErrorId = `chiefdom-name-error-${chiefdom.id}`;

  return (
    <div className="chiefdom-card" aria-expanded={!chiefdom.isCollapsed}>
      <div className="chiefdom-card-header">
        <div className="chiefdom-card-header-info">
          <button
            type="button"
            className="collapse-toggle-btn"
            aria-label={chiefdom.isCollapsed ? 'Expand chiefdom' : 'Collapse chiefdom'}
            onClick={() => onToggleCollapse(chiefdom.id)}
          >
            <span className={`collapse-arrow ${chiefdom.isCollapsed ? '' : 'open'}`} />
          </button>
          <h5>
            Chiefdom
            {' '}
            {index + 1}
          </h5>
        </div>
        {districtForm.chiefdoms.length > 1 && (
          <button
            type="button"
            className="remove-row-btn"
            onClick={() => onRemoveChiefdom(chiefdom.id)}
          >
            Remove
          </button>
        )}
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
                onChange={(event) => onChiefdomSelect(chiefdom.id, event.target.value)}
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
            {!chiefdom.useCustomName && (
              <FieldError id={chiefdomNameErrorId} message={cdomEr.name} />
            )}
          </div>

          {chiefdom.useCustomName && (
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
                  onChange={(event) => onFieldChange(
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
          )}

          <div className="chiefdom-card-subheader">
            <h6>Fertilizer Information</h6>
            <button
              type="button"
              className="link-btn"
              onClick={() => onAddFertilizer(chiefdom.id)}
            >
              + Add Fertilizer Type
            </button>
          </div>

          <div className="fertilizer-list">
            {(chiefdom.fertilizers || []).map((fertilizer) => (
              <FertilizerRow
                key={fertilizer.id}
                chiefdomId={chiefdom.id}
                fertilizer={fertilizer}
                fertilizerOptions={fertilizerOptions}
                dealerOptions={dealerOptions}
                validationErrors={cdomEr.fertilizers[fertilizer.id] || {}}
                onSelect={onFertilizerSelect}
                onFieldChange={onFertilizerFieldChange}
                onRemove={onRemoveFertilizer}
                canRemove={chiefdom.fertilizers.length > 1}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

ChiefdomCard.propTypes = {
  chiefdom: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    useCustomName: PropTypes.bool,
    customName: PropTypes.string,
    isCollapsed: PropTypes.bool,
    validationErrors: PropTypes.shape({
      name: PropTypes.string,
      fertilizers: PropTypes.shape({}),
    }),
    fertilizers: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  index: PropTypes.number.isRequired,
  districtForm: PropTypes.shape({
    district: PropTypes.string,
    chiefdoms: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  referenceChiefdoms: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  fertilizerOptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  dealerOptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onRemoveChiefdom: PropTypes.func.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  onChiefdomSelect: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onAddFertilizer: PropTypes.func.isRequired,
  onFertilizerSelect: PropTypes.func.isRequired,
  onFertilizerFieldChange: PropTypes.func.isRequired,
  onRemoveFertilizer: PropTypes.func.isRequired,
};

export default ChiefdomCard;
