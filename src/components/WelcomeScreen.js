import { useNavigate } from 'react-router-dom';
import './styles/WelcomePage.css';
import logo from '../img/nafra-logo.png';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <img className="logo" src={logo} alt="Logo" />
      <div className="welcome-content">
        <h1> WELCOME</h1>
        <p>To NaFRA&apos;s DATA PORTAL</p>
        <button
          className="login-button"
          type="button"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button
          className="signup-button"
          type="button"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
