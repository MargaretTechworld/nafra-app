import React from 'react';
import PropTypes from 'prop-types';

const TabNavigation = ({
  viewTab,
  setViewTab,
  onAddDistrict,
  onViewSubmissions,
}) => (
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
        onViewSubmissions();
      }}
      type="button"
    >
      History
    </button>
    <button
      className="add-row-btn"
      type="button"
      onClick={onAddDistrict}
    >
      + Add District
    </button>
  </div>
);

TabNavigation.propTypes = {
  viewTab: PropTypes.string.isRequired,
  setViewTab: PropTypes.func.isRequired,
  onAddDistrict: PropTypes.func.isRequired,
  onViewSubmissions: PropTypes.func.isRequired,
};

export default TabNavigation;
