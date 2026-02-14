import { useEffect, useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../img/nafra-logo.png';
import loginImg from '../img/login-img.jpg';
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
  const [login, { isLoading }] = useLoginMutation();

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
      return 'Please use your official email (e.g. user@nafra.gov).';
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
      if (result) {
        const { token: authToken, role: userRole, user_id: userId } = result;
        const user = { id: userId };
        dispatch(setCredentials({
          token: authToken, role: userRole, userId: user?.id, user,
        }));
      }
    } catch (err) {
      setEmailError(err.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginImg})` }}
        />
        <div className="absolute top-12 left-12 z-10">
          <img src={logo} alt="NaFRA Logo" className="h-24 w-auto drop-shadow-lg" />
        </div>
        {/* Optional: Overlay gradient for better text readability if we add text later */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src={logo} alt="NaFRA Logo" className="h-20 w-auto" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome Back!
            </h2>
            <div className="mt-2 text-sm text-gray-500">
              Please enter your details to sign in
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`block w-full rounded-lg border ${emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600 animate-in slide-in-from-top-1">
                      {emailError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Login failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-500">Don&apos;t have an account? </span>
              <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
