import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/SignupPage.css';
import './styles/LoginPage.css';
import logo from '../img/nafra-logo.png';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons';
import isCorporateEmail from '../utils/emailValidation';

const initialFormValues = {
  agencyName: '',
  projectName: '',
  ministry: '',
  agencyEmail: '',
  password: '',
  confirmPassword: '',
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateField = (field, value, values = formValues) => {
    switch (field) {
      case 'agencyName':
        if (!value?.trim()) return 'Agency name is required.';
        return '';
      case 'projectName':
        if (!value?.trim()) return 'Project name is required.';
        return '';
      case 'ministry':
        if (!value?.trim()) return 'Ministry is required.';
        return '';
      case 'agencyEmail':
        if (!value?.trim()) return 'Agency email is required.';
        if (!isCorporateEmail(value)) {
          return 'Only corporate emails (no personal domains) are allowed.';
        }
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 8) return 'Password must be at least 8 characters long.';
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
          return 'Password must include at least one letter and one number.';
        }
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== values.password) return 'Passwords must match.';
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field, value) => {
    const message = validateField(field, value, { ...formValues, [field]: value });
    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (message) {
        nextErrors[field] = message;
      } else {
        delete nextErrors[field];
      }
      if (field === 'password' || field === 'confirmPassword') {
        const confirmMessage = validateField(
          'confirmPassword',
          field === 'confirmPassword' ? value : formValues.confirmPassword,
          { ...formValues, [field]: value },
        );
        if (confirmMessage) {
          nextErrors.confirmPassword = confirmMessage;
        } else {
          delete nextErrors.confirmPassword;
        }
      }
      return nextErrors;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const fields = Object.keys(initialFormValues);
    const validationResults = fields.reduce((acc, field) => {
      const message = validateField(field, formValues[field], formValues);
      if (message) {
        acc[field] = message;
      }
      return acc;
    }, {});

    setErrors(validationResults);
    if (Object.keys(validationResults).length > 0) {
      return;
    }

    setShowSuccess(true);
    setFormValues(initialFormValues);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="signup-page-left">
        <img className="signup-page-left-img" src={logo} alt="Logo" />
      </div>
      <div className="login-page-right">
        <hr className="signup-page-hr" />
        <h2>Welcome to NaFRA&apos;s Data Portal !</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <input
              className={`login-input ${errors.agencyName ? 'login-input-invalid' : ''}`}
              type="text"
              placeholder="Agency Name"
              value={formValues.agencyName}
              onChange={(event) => handleFieldChange('agencyName', event.target.value)}
              onBlur={(event) => handleFieldBlur('agencyName', event.target.value)}
              aria-invalid={Boolean(errors.agencyName)}
              required
            />
            {errors.agencyName ? <p className="input-error">{errors.agencyName}</p> : null}
          </div>
          <div className="form-field">
            <input
              className={`login-input ${errors.projectName ? 'login-input-invalid' : ''}`}
              type="text"
              placeholder="Project Name"
              value={formValues.projectName}
              onChange={(event) => handleFieldChange('projectName', event.target.value)}
              onBlur={(event) => handleFieldBlur('projectName', event.target.value)}
              aria-invalid={Boolean(errors.projectName)}
              required
            />
            {errors.projectName ? <p className="input-error">{errors.projectName}</p> : null}
          </div>
          <div className="form-field">
            <input
              className={`login-input ${errors.ministry ? 'login-input-invalid' : ''}`}
              type="text"
              placeholder="Ministry"
              value={formValues.ministry}
              onChange={(event) => handleFieldChange('ministry', event.target.value)}
              onBlur={(event) => handleFieldBlur('ministry', event.target.value)}
              aria-invalid={Boolean(errors.ministry)}
              required
            />
            {errors.ministry ? <p className="input-error">{errors.ministry}</p> : null}
          </div>
          <div className="form-field">
            <input
              className={`login-input ${errors.agencyEmail ? 'login-input-invalid' : ''}`}
              type="email"
              placeholder="Agency Email"
              value={formValues.agencyEmail}
              onChange={(event) => handleFieldChange('agencyEmail', event.target.value)}
              onBlur={(event) => handleFieldBlur('agencyEmail', event.target.value)}
              aria-invalid={Boolean(errors.agencyEmail)}
              required
            />
            {errors.agencyEmail ? <p className="input-error">{errors.agencyEmail}</p> : null}
          </div>
          <div className="form-field">
            <div className="password-input-wrapper">
              <input
                className={`login-input password-input ${errors.password ? 'login-input-invalid' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formValues.password}
                onChange={(event) => handleFieldChange('password', event.target.value)}
                onBlur={(event) => handleFieldBlur('password', event.target.value)}
                aria-invalid={Boolean(errors.password)}
                required
              />
              <button
                className="password-toggle-btn"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password ? <p className="input-error">{errors.password}</p> : null}
          </div>
          <div className="form-field">
            <div className="password-input-wrapper">
              <input
                className={`login-input password-input ${
                  errors.confirmPassword ? 'login-input-invalid' : ''
                }`}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formValues.confirmPassword}
                onChange={(event) => handleFieldChange('confirmPassword', event.target.value)}
                onBlur={(event) => handleFieldBlur('confirmPassword', event.target.value)}
                aria-invalid={Boolean(errors.confirmPassword)}
                required
              />
              <button
                className="password-toggle-btn"
                type="button"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="input-error">{errors.confirmPassword}</p>
            ) : null}
          </div>
          <button className="login-page-button" type="submit">Sign Up</button>
        </form>
        <button
          className="signup-page-button"
          type="button"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <p>If you have an account</p>
      </div>
      {showSuccess ? (
        <div className="signup-success-overlay" role="dialog" aria-modal="true">
          <div className="signup-success-content">
            <h3>Thank you!</h3>
            <p>
              Your signup request was submitted successfully. Our onboarding team will reach out
              with next steps shortly.
            </p>
            <div className="signup-success-actions">
              <button type="button" onClick={handleCloseSuccess}>
                Close
              </button>
              <button type="button" onClick={() => navigate('/login')}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
