import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { 
  User, 
  Users, 
  FileText, 
  Smartphone, 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Lock, 
  Check, 
  UserSquare2 
} from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register, socialLogin, error: authError, clearError } = useAuth();
  
  // Onboarding wizard steps: 1 = System Purpose, 2 = Current Method, 3 = Account Credentials
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Questionnaire choices
  const [usageType, setUsageType] = useState<'OWN' | 'TEAM' | null>(null);
  const [currentManagementMethod, setCurrentManagementMethod] = useState<'PAPER' | 'APP' | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Local error state (validation)
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Social Login Mock Flow Handler
  const handleSocialRegister = async (provider: 'GOOGLE' | 'FACEBOOK') => {
    if (!usageType || !currentManagementMethod) {
      setValidationError('Please complete the onboarding steps first.');
      return;
    }
    
    setValidationError(null);
    clearError();
    setIsSubmitting(true);
    
    try {
      // Create a mock token based on provider and choices
      const mockName = provider === 'GOOGLE' ? 'Google Explorer' : 'Facebook Member';
      const mockEmail = `${provider.toLowerCase()}_user_${Math.floor(Math.random() * 10000)}@example.com`;
      const mockToken = `mock_${provider.toLowerCase()}_auth_token_${Date.now()}`;
      
      await socialLogin({
        provider,
        token: mockToken,
        name: mockName,
        email: mockEmail,
        usageType,
        currentManagementMethod,
      });
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Social sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    setValidationError(null);
    clearError();
    if (step === 1) {
      if (!usageType) {
        setValidationError('Please select how you plan to use Magadige.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!currentManagementMethod) {
        setValidationError('Please select how you currently manage your tasks.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    clearError();
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!usageType || !currentManagementMethod) {
      setValidationError('Onboarding questionnaire incomplete.');
      setStep(1);
      return;
    }

    if (!name.trim()) {
      setValidationError('Full Name is required.');
      return;
    }

    if (!email.trim()) {
      setValidationError('Email address is required.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    // Password complexity check
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setValidationError('Password must contain at least one letter, one number, and one special character.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        usageType,
        currentManagementMethod,
      });
    } catch (err: any) {
      console.error(err);
      // Detailed validation errors from backend
      if (err.errors && Array.isArray(err.errors)) {
        setValidationError(err.errors.map((e: any) => e.message).join(' '));
      } else {
        setValidationError(err.message || 'An error occurred during registration.');
      }
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
        {/* Modern Orange/White Shield Logo Placeholder */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 mb-4 animate-bounce-slow">
          <Check size={32} className="stroke-[3]" />
        </div>
        <h2 className="text-3xl font-extrabold text-black tracking-tight">
          Create your Magadige Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Already registered?{' '}
          <button 
            onClick={onNavigateToLogin} 
            className="font-bold text-orange-600 hover:text-orange-500 underline transition-colors cursor-pointer"
          >
            Sign in here
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
          
          {/* Progress Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>1</span>
                <span className="text-xs font-bold text-black hidden sm:inline">Goal</span>
              </div>
              <div className={`flex-1 h-[2px] mx-2 transition-all duration-300 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>2</span>
                <span className="text-xs font-bold text-black hidden sm:inline">Routine</span>
              </div>
              <div className={`flex-1 h-[2px] mx-2 transition-all duration-300 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>3</span>
                <span className="text-xs font-bold text-black hidden sm:inline">Register</span>
              </div>
            </div>
          </div>

          {/* Form Content / Wizard Steps */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-black">Who is this workspace for?</h3>
                <p className="text-sm text-gray-500 mt-1">We'll customize your tasks and team features.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  onClick={() => setUsageType('OWN')}
                  className={`relative flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:border-orange-500 hover:shadow-sm ${
                    usageType === 'OWN' ? 'border-orange-500 bg-orange-50/20' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    usageType === 'OWN' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
                  }`}>
                    <User size={24} />
                  </div>
                  <span className="font-bold text-black">Own Usage</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Personal schedules & habits</span>
                  {usageType === 'OWN' && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setUsageType('TEAM')}
                  className={`relative flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:border-orange-500 hover:shadow-sm ${
                    usageType === 'TEAM' ? 'border-orange-500 bg-orange-50/20' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    usageType === 'TEAM' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
                  }`}>
                    <Users size={24} />
                  </div>
                  <span className="font-bold text-black">Team Usage</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Workspaces & task sharing</span>
                  {usageType === 'TEAM' && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleNextStep}
                  icon={<ArrowRight size={18} />}
                  disabled={!usageType}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-black">How do you manage tasks currently?</h3>
                <p className="text-sm text-gray-500 mt-1">We'll help you import or structure your list.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  onClick={() => setCurrentManagementMethod('PAPER')}
                  className={`relative flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:border-orange-500 hover:shadow-sm ${
                    currentManagementMethod === 'PAPER' ? 'border-orange-500 bg-orange-50/20' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    currentManagementMethod === 'PAPER' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
                  }`}>
                    <FileText size={24} />
                  </div>
                  <span className="font-bold text-black font-semibold">Writing on Paper</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Notebooks or sticky notes</span>
                  {currentManagementMethod === 'PAPER' && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setCurrentManagementMethod('APP')}
                  className={`relative flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:border-orange-500 hover:shadow-sm ${
                    currentManagementMethod === 'APP' ? 'border-orange-500 bg-orange-50/20' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    currentManagementMethod === 'APP' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
                  }`}>
                    <Smartphone size={24} />
                  </div>
                  <span className="font-bold text-black font-semibold">Using an App</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Calendar or list apps</span>
                  {currentManagementMethod === 'APP' && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="secondary" onClick={handlePrevStep} icon={<ArrowLeft size={18} />}>
                  Back
                </Button>
                <Button 
                  onClick={handleNextStep}
                  icon={<ArrowRight size={18} />}
                  disabled={!currentManagementMethod}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-black">Set up your credentials</h3>
                <p className="text-sm text-gray-500 mt-1">Secure your workspace and you are ready to go.</p>
              </div>

              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eranga Bandara"
                required
                icon={<UserSquare2 size={20} />}
              />

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

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={<Lock size={20} />}
              />

              <div className="flex gap-4 pt-2">
                <Button variant="secondary" type="button" onClick={handlePrevStep} icon={<ArrowLeft size={18} />}>
                  Back
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Complete Setup
                </Button>
              </div>

              {/* Social Signup Options */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">Or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  variant="social" 
                  onClick={() => handleSocialRegister('GOOGLE')}
                  icon={<GoogleIcon />}
                  disabled={isSubmitting}
                >
                  Google
                </Button>
                <Button 
                  type="button" 
                  variant="social" 
                  onClick={() => handleSocialRegister('FACEBOOK')}
                  icon={<FacebookIcon />}
                  disabled={isSubmitting}
                >
                  Facebook
                </Button>
              </div>
            </form>
          )}

          {/* Validation or API Errors */}
          {(validationError || authError) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
              <p>{validationError || authError}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
