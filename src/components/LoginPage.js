import './styles/LoginPage.css';
import logo from '../img/nafra-logo.png';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page-left">
        <img className="login-page-left-img" src={logo} alt="Logo" />
      </div>
      <div className="login-page-right">
        <hr />
        <h2>Welcome Back !</h2>
        <input className="login-input" type="text" placeholder="Email" />
        <input className="login-input" type="password" placeholder="Password" />
        <button className="login-page-button" type="button">Login</button>
        <button className="signup-page-button" type="button">
          Sign up
        </button>
        <p>Don&apos;t have an account?</p>
      </div>
    </div>
  );
}
