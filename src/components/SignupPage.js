import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/SignupPage.css';
import './styles/LoginPage.css';
import logo from '../img/nafra-logo.png';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons';

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="signup-page-left">
        <img className="login-page-left-img" src={logo} alt="Logo" />
      </div>
      <div className="login-page-right">
        <hr className="login-page-hr" />
        <h2>Welcome to NaFRA&apos;s Data Portal !</h2>
        <input className="login-input" type="text" placeholder="Agency Name" />
        <input className="login-input" type="text" placeholder="Email" />
        <div className="password-input-wrapper">
          <input
            className="login-input password-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
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
        <div className="password-input-wrapper">
          <input
            className="login-input password-input"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
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
        <button className="login-page-button" type="button">Sign Up</button>
        <button
          className="signup-page-button"
          type="button"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <p>If you have an account</p>
      </div>
    </div>
  );
}
