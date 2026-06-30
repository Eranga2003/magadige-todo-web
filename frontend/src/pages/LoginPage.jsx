import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { signInWithGoogle, signInWithFacebook } from '../services/firebase';
import { Mail, Lock, Check } from 'lucide-react';

export const LoginPage = ({ onNavigateToRegister }) => {
  const { login, socialLogin, error: authError, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email.trim()) {
      setValidationError('Email address is required.');
      return;
    }

    if (!password.trim()) {
      setValidationError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setValidationError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setValidationError(null);
    clearError();
    setIsSubmitting(true);

    try {
      // Call Firebase Auth popup in the browser
      const { token, name, email } = provider === 'GOOGLE' 
        ? await signInWithGoogle() 
        : await signInWithFacebook();

      await socialLogin({
        provider,
        token,
        name,
        email,
      });
    } catch (err) {
      console.error(err);
      setValidationError(err.message || `Social login via ${provider} failed`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google SVG Icon
  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );

  // Facebook SVG Icon
  const FacebookIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Shield Check logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 mb-4 animate-bounce-slow">
          <Check size={32} className="stroke-[3]" />
        </div>
        <h2 className="text-3xl font-extrabold text-black tracking-tight">
          Welcome back to Magadige
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          New here?{' '}
          <button 
            onClick={onNavigateToRegister} 
            className="font-bold text-orange-600 hover:text-orange-500 underline transition-colors cursor-pointer"
          >
            Create an account & start onboarding
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              icon={<Mail size={20} />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              icon={<Lock size={20} />}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4.5 w-4.5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-semibold text-gray-900 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-orange-600 hover:text-orange-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" loading={isSubmitting}>
                Sign In
              </Button>
            </div>
          </form>

          {/* Social Sign-in Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">Or sign in with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="social" 
              onClick={() => handleSocialLogin('GOOGLE')}
              icon={<GoogleIcon />}
              disabled={isSubmitting}
            >
              Google
            </Button>
            <Button 
              type="button" 
              variant="social" 
              onClick={() => handleSocialLogin('FACEBOOK')}
              icon={<FacebookIcon />}
              disabled={isSubmitting}
            >
              Facebook
            </Button>
          </div>

          {/* Error Banner */}
          {(validationError || authError) && (
            <div className="mt-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
              <p>{validationError || authError}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
