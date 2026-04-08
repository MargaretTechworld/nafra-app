import React from 'react';
import PropTypes from 'prop-types';

export const FieldError = ({ id = undefined, message = '' }) => {
  if (!message) return null;

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

export const FormLabel = ({ children, htmlFor, label }) => (
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
