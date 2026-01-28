import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './styles/LoginPage.css';
import logo from '../img/nafra-logo.png';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons';
import { useLoginMutation } from '../app/api/apiSlice';
import { setCredentials } from '../features/auth/authSlice';
import isCorporateEmail from '../utils/emailValidation';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, role, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [login] = useLoginMutation(); // Use the login mutation from API slice

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/portal');
      }
    }
  }, [isAuthenticated, role, navigate]);

  const validateEmail = (value) => {
    if (!value?.trim()) {
      return 'Email is required.';
    }
    if (!isCorporateEmail(value)) {
      return 'Please use your official (e.g. user@nafra.gov).';
    }
    return '';
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (!value) {
      setEmailError('');
      return;
    }
    setEmailError(isCorporateEmail(value) ? '' : 'Only corporate emails are allowed.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validateEmail(email);
    if (validationMessage) {
      setEmailError(validationMessage);
      return;
    }
    setEmailError('');

    try {
      const result = await login({ email, password }).unwrap();

      // Handle the response structure from Rails backend
      if (result) {
        const { token, role, user_id: userId } = result;
        const user = { id: userId };

        dispatch(setCredentials({
          token, role, userId: user?.id, user,
        }));
      }
    } catch (err) {
      setEmailError(err.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-page-left">
        <img className="login-page-left-img" src={logo} alt="Logo" />
      </div>
      <div className="login-page-right">
        <hr className="login-page-hr" />
        <h2>Welcome Back!</h2>
        <form onSubmit={handleSubmit}>
          <input
            className={`login-input ${emailError ? 'login-input-invalid' : ''}`}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            aria-invalid={Boolean(emailError)}
            required
          />
          {emailError ? <p className="input-error">{emailError}</p> : null}
          <div className="password-input-wrapper">
            <input
              className="login-input password-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="password-toggle-btn"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon className="eye-icon" /> : <EyeIcon className="eye-icon" />}
            </button>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="login-page-button" type="submit">Login</button>
        </form>
        <Link className="signup-page-button" to="/signup">
          Sign up
        </Link>
        <p>Don&apos;t have an account?</p>
      </div>
    </div>
  );
}
