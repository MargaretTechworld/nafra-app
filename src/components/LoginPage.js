import { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/LoginPage.css';
import logo from '../img/nafra-logo.png';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="login-page-left">
        <img className="login-page-left-img" src={logo} alt="Logo" />
      </div>
      <div className="login-page-right">
        <hr className="login-page-hr" />
        <h2>Welcome Back !</h2>
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
        <button className="login-page-button" type="button">Login</button>
        <Link className="signup-page-button" to="/signup">
          Sign up
        </Link>
        <p>Don&apos;t have an account?</p>
      </div>
    </div>
  );
}
