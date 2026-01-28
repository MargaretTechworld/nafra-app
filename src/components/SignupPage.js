import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './styles/SignupPage.css';
import logo from '../img/nafra-logo.png';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons';
import isCorporateEmail from '../utils/emailValidation';
import { useAgencySetupMutation } from '../app/api/apiSlice';
import {
  setFormValues, setErrors, resetForm, toggleSuccess,
} from '../features/agency/agencySlice';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createAgency] = useAgencySetupMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { formValues, errors, showSuccess } = useSelector((state) => state.agency);

  const validateField = (field, value) => {
    switch (field) {
      case 'agencyName':
        return value.trim() ? '' : 'Agency name is required.';
      case 'projectName':
        return value.trim() ? '' : 'Project name is required.';
      case 'ministry':
        return value.trim() ? '' : 'Ministry is required.';
      case 'agencyEmail':
        return value.trim() && isCorporateEmail(value)
          ? ''
          : 'Valid corporate email is required.';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 8) return 'Password must be at least 8 characters long.';
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
          return 'Password must include at least one letter and one number.';
        }
        return '';
      case 'confirmPassword':
        return value === formValues.password ? '' : 'Passwords must match.';
      default:
        return '';
    }
  };

  const handleFieldChange = (field, value) => {
    dispatch(setFormValues({ [field]: value }));
  };

  const handleFieldBlur = (field) => {
    const message = validateField(field, formValues[field]);
    dispatch(setErrors({ [field]: message || null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationResults = Object.keys(formValues).reduce((acc, field) => {
      const message = validateField(field, formValues[field]);
      if (message) {
        acc[field] = message;
      }
      return acc;
    }, {});

    dispatch(setErrors(validationResults));

    if (Object.keys(validationResults).length > 0) return;

    try {
      await createAgency({
        name: formValues.agencyEmail.split('@')[0], // Use username based on email or any appropriate logic
        email: formValues.agencyEmail,
        password: formValues.password,
        password_confirmation: formValues.confirmPassword,
        agency_name: formValues.agencyName,
        project_name: formValues.projectName,
        ministry: formValues.ministry,
      }).unwrap();

      dispatch(toggleSuccess());
      dispatch(resetForm());
      navigate('/success'); // Navigate to success page or wherever you want
    } catch (error) {
      dispatch(setErrors({ form: error.data?.errors?.join(', ') || 'Failed to create agency.' }));
    }
  };

  const handleCloseSuccess = () => {
    dispatch(toggleSuccess());
  };

  return (
    <div className="signup-page">
      <div className="signup-page-left">
        <img className="signup-page-left-img" src={logo} alt="Logo" />
      </div>
      <div className="signup-page-right">
        <h2>Welcome to NaFRA&apos;s Data Portal!</h2>
        <form onSubmit={handleSubmit} noValidate>
          {errors.form && <p className="input-error">{errors.form}</p>}
          {['agencyName', 'projectName', 'ministry', 'agencyEmail'].map((field) => (
            <div className="form-field" key={field}>
              <input
                className={`login-input ${errors[field] ? 'login-input-invalid' : ''}`}
                type={field === 'agencyEmail' ? 'email' : 'text'}
                placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                value={formValues[field]}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                onBlur={() => handleFieldBlur(field)}
                aria-invalid={Boolean(errors[field])}
                required
              />
              {errors[field] && <p className="input-error">{errors[field]}</p>}
            </div>
          ))}
          {['password', 'confirmPassword'].map((field) => {
            const getInputType = () => {
              if (field === 'password') {
                return showPassword ? 'text' : 'password';
              }
              return showConfirmPassword ? 'text' : 'password';
            };

            const getToggleIcon = () => {
              if (field === 'password') {
                return showPassword ? <EyeOffIcon /> : <EyeIcon />;
              }
              return showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />;
            };

            return (
              <div className="form-field" key={field}>
                <div className="password-input-wrapper">
                  <input
                    className={`login-input password-input ${errors[field] ? 'login-input-invalid' : ''}`}
                    type={getInputType()}
                    placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                    value={formValues[field]}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    onBlur={() => handleFieldBlur(field)}
                    aria-invalid={Boolean(errors[field])}
                    required
                  />
                  <button
                    className="password-toggle-btn"
                    type="button"
                    onClick={() => {
                      if (field === 'password') {
                        setShowPassword(!showPassword);
                      } else {
                        setShowConfirmPassword(!showConfirmPassword);
                      }
                    }}
                  >
                    {getToggleIcon()}
                  </button>
                </div>
                {errors[field] && <p className="input-error">{errors[field]}</p>}
              </div>
            );
          })}
          <button className="login-page-button" type="submit">Sign Up</button>
        </form>
        <button className="signup-page-button" type="button" onClick={() => navigate('/login')}>Login</button>

        {showSuccess && (
          <div className="signup-success-overlay" role="dialog" aria-modal="true">
            <div className="signup-success-content">
              <h3>Thank you!</h3>
              <p>
                Your signup request was submitted successfully.
                Our onboarding team will reach out with next steps shortly.
              </p>
              <div className="signup-success-actions">
                <button type="button" onClick={handleCloseSuccess}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
