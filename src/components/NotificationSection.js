import React from 'react';
import PropTypes from 'prop-types';

const NotificationSection = ({
  isSuccessMessageVisible,
  formError,
  draftsError,
  onHideSuccess,
}) => {
  if (!isSuccessMessageVisible && !formError && !draftsError) return null;

  return (
    <div className="notifications-container">
      {/* Success Message */}
      {isSuccessMessageVisible && (
        <div className="success-message">
          <p>Action completed successfully!</p>
          <button
            type="button"
            className="close-btn"
            onClick={onHideSuccess}
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {(formError || draftsError) && (
        <div className="error-message-global" role="alert">
          <span className="error-icon">⚠</span>
          <span className="error-text">{formError || draftsError}</span>
        </div>
      )}
    </div>
  );
};

NotificationSection.propTypes = {
  isSuccessMessageVisible: PropTypes.bool.isRequired,
  formError: PropTypes.string,
  draftsError: PropTypes.string,
  onHideSuccess: PropTypes.func.isRequired,
};

NotificationSection.defaultProps = {
  formError: '',
  draftsError: '',
};

export default NotificationSection;
