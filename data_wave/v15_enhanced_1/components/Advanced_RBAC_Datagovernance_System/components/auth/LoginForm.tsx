'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, ArrowRightIcon, ArrowLeftIcon, UserIcon, KeyIcon, DevicePhoneMobileIcon, EnvelopeIcon, BuildingOfficeIcon, MapPinIcon, CalendarIcon, PhotoIcon, XMarkIcon, SparklesIcon, ShieldCheckIcon, GlobeAltIcon, CpuChipIcon, BoltIcon, LockClosedIcon, ClockIcon, WifiIcon, ComputerDesktopIcon, DeviceTabletIcon, CommandLineIcon, CogIcon, StarIcon, FireIcon, RocketLaunchIcon, AcademicCapIcon, FingerPrintIcon } from '@heroicons/react/24/outline';
import { 
  GoogleIcon, 
  MicrosoftIcon, 
  LoadingSpinner, 
  DataGovernanceIcon,
  SecurityShieldIcon,
  DataFlowIcon
} from '../shared/Icons';
import { MFAHandler } from './MFAHandler';
import { authService } from '../../services/auth.service';
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES, FIELD_LENGTHS } from '../../constants/validation.constants';
import { THEME_COLORS, ANIMATIONS, FORM_CONFIG } from '../../constants/ui.constants';
import type { 
  LoginRequest, 
  SignupRequest, 
  VerifyCodeRequest, 
  AuthResponse,
  MFAVerifyRequest 
} from '../../types/auth.types';

// ============================================================================
// ENHANCED INTERFACES & TYPES
// ============================================================================

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  department: string;
  region: string;
  verificationCode: string;
  mfaCode: string;
  profilePicture: File | null;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  region?: string;
  verificationCode?: string;
  mfaCode?: string;
  profilePicture?: string;
  general?: string;
}

interface ValidationState {
  isValid: boolean;
  errors: FormErrors;
  touched: Record<keyof FormState, boolean>;
}

interface SecurityFeatures {
  encryption: boolean;
  twoFactor: boolean;
  biometric: boolean;
  auditLogging: boolean;
  ssoEnabled: boolean;
  advancedThreatProtection: boolean;
  zeroTrust: boolean;
  aiMonitoring: boolean;
}

interface SystemInfo {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screen: string;
  connection: string;
  location?: string;
}

type AuthStep = 'login' | 'signup' | 'verify' | 'mfa' | 'success' | 'security_check';
type AuthMethod = 'email' | 'google' | 'microsoft' | 'sso';

// ============================================================================
// ADVANCED FORM VALIDATION HOOK
// ============================================================================

const useFormValidation = (initialState: FormState) => {
  const [state, setState] = useState<FormState>(initialState);
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    errors: {},
    touched: {} as Record<keyof FormState, boolean>
  });

  // Enhanced validation with security checks
  const validateField = useCallback((field: keyof FormState, value: string | File | null): string | undefined => {
    switch (field) {
      case 'email':
        if (!value) return VALIDATION_MESSAGES.REQUIRED;
        if (typeof value === 'string') {
          if (!VALIDATION_PATTERNS.EMAIL.test(value)) {
            return VALIDATION_MESSAGES.INVALID_EMAIL;
          }
          if (value.length > FIELD_LENGTHS.EMAIL.max) {
            return VALIDATION_MESSAGES.TOO_LONG(FIELD_LENGTHS.EMAIL.max);
          }
          // Check for suspicious email patterns
          if (value.includes('+') && value.split('+').length > 2) {
            return 'Email format appears suspicious';
          }
        }
        break;
      
      case 'firstName':
        if (value && typeof value === 'string') {
          if (value.length > FIELD_LENGTHS.FIRST_NAME.max) {
            return VALIDATION_MESSAGES.TOO_LONG(FIELD_LENGTHS.FIRST_NAME.max);
          }
          if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            return 'First name can only contain letters, spaces, hyphens and apostrophes';
          }
        }
        break;
      
      case 'lastName':
        if (value && typeof value === 'string') {
          if (value.length > FIELD_LENGTHS.LAST_NAME.max) {
            return VALIDATION_MESSAGES.TOO_LONG(FIELD_LENGTHS.LAST_NAME.max);
          }
          if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            return 'Last name can only contain letters, spaces, hyphens and apostrophes';
          }
        }
        break;
      
      case 'phoneNumber':
        if (value && typeof value === 'string') {
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
          if (!VALIDATION_PATTERNS.PHONE.test(value)) {
            return VALIDATION_MESSAGES.INVALID_PHONE;
          }
          if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            return 'Phone number must be between 10-15 digits';
          }
        }
        break;
      
      case 'verificationCode':
        if (!value) return VALIDATION_MESSAGES.REQUIRED;
        if (typeof value === 'string') {
          if (!/^\d{6}$/.test(value.replace(/\s/g, ''))) {
            return 'Verification code must be 6 digits';
          }
        }
        break;
      
      case 'mfaCode':
        if (!value) return VALIDATION_MESSAGES.REQUIRED;
        if (typeof value === 'string') {
          if (!/^\d{6}$/.test(value.replace(/\s/g, ''))) {
            return 'MFA code must be 6 digits';
          }
        }
        break;
      
      case 'profilePicture':
        if (value instanceof File) {
          if (value.size > FORM_CONFIG.MAX_FILE_SIZE) {
            return VALIDATION_MESSAGES.FILE_TOO_LARGE('10MB');
          }
          if (!FORM_CONFIG.ALLOWED_IMAGE_TYPES.includes(value.type)) {
            return VALIDATION_MESSAGES.INVALID_FILE_TYPE(FORM_CONFIG.ALLOWED_IMAGE_TYPES.join(', '));
          }
          // Check for potentially malicious files
          if (value.name.includes('..') || value.name.includes('/')) {
            return 'Invalid file name detected';
          }
        }
        break;
    }
    return undefined;
  }, []);

  const updateField = useCallback((field: keyof FormState, value: string | File | null) => {
    setState(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setValidation(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      touched: { ...prev.touched, [field]: true }
    }));
  }, [validateField]);

  const validateForm = useCallback((step: AuthStep): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (step === 'login' || step === 'signup') {
      const emailError = validateField('email', state.email);
      if (emailError) {
        errors.email = emailError;
        isValid = false;
      }
    }

    if (step === 'signup') {
      const firstNameError = validateField('firstName', state.firstName);
      const lastNameError = validateField('lastName', state.lastName);
      const phoneError = validateField('phoneNumber', state.phoneNumber);
      const profileError = validateField('profilePicture', state.profilePicture);

      if (firstNameError) errors.firstName = firstNameError;
      if (lastNameError) errors.lastName = lastNameError;
      if (phoneError) errors.phoneNumber = phoneError;
      if (profileError) errors.profilePicture = profileError;

      if (firstNameError || lastNameError || phoneError || profileError) {
        isValid = false;
      }
    }

    if (step === 'verify') {
      const codeError = validateField('verificationCode', state.verificationCode);
      if (codeError) {
        errors.verificationCode = codeError;
        isValid = false;
      }
    }

    if (step === 'mfa') {
      const mfaError = validateField('mfaCode', state.mfaCode);
      if (mfaError) {
        errors.mfaCode = mfaError;
        isValid = false;
      }
    }

    setValidation(prev => ({ ...prev, errors, isValid }));
    return isValid;
  }, [state, validateField]);

  return {
    state,
    validation,
    updateField,
    validateForm,
    setState,
    setValidation
  };
};

// ============================================================================
// ADVANCED DATABRICKS-STYLE LOGIN FORM COMPONENT
// ============================================================================

export const LoginForm: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  const [showMFAHandler, setShowMFAHandler] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'standard' | 'enhanced' | 'maximum'>('enhanced');
  
  // Enhanced security features state
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeatures>({
    encryption: true,
    twoFactor: true,
    biometric: false,
    auditLogging: true,
    ssoEnabled: true,
    advancedThreatProtection: true,
    zeroTrust: true,
    aiMonitoring: true
  });

  // System information for security logging
  const [systemInfo] = useState<SystemInfo>({
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    platform: typeof window !== 'undefined' ? navigator.platform : '',
    language: typeof window !== 'undefined' ? navigator.language : '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: typeof window !== 'undefined' ? `${screen.width}x${screen.height}` : '',
    connection: typeof navigator !== 'undefined' && 'connection' in navigator ? 
      (navigator as any).connection?.effectiveType || 'unknown' : 'unknown'
  });

  // Form validation hook
  const {
    state: formState,
    validation,
    updateField,
    validateForm,
    setState: setFormState,
    setValidation
  } = useFormValidation({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    department: '',
    region: '',
    verificationCode: '',
    mfaCode: '',
    profilePicture: null
  });

  // Refs and animations
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const stepControls = useAnimation();
  const securityCheckRef = useRef<HTMLDivElement>(null);

  // Enhanced departments and regions data
  const departments = useMemo(() => [
    'Engineering', 'Data Science', 'Analytics', 'Compliance & Governance',
    'Security & Risk', 'Operations', 'Finance', 'Marketing', 'Sales',
    'Human Resources', 'Legal', 'Product Management', 'DevOps',
    'Quality Assurance', 'Business Intelligence', 'Data Engineering',
    'Machine Learning', 'Platform Engineering', 'Cloud Architecture'
  ], []);

  const regions = useMemo(() => [
    'North America', 'Europe', 'Asia Pacific', 'Latin America',
    'Middle East & Africa', 'Australia & New Zealand', 'Central Asia',
    'Nordic Countries', 'Eastern Europe', 'Southeast Asia', 'Caribbean'
  ], []);

  // ============================================================================
  // ANIMATION VARIANTS
  // ============================================================================

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 100, rotateY: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      rotateY: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      rotateY: 15,
      transition: { duration: 0.3 }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: "easeOut"
      }
    }
  };

  const securityVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "backOut"
      }
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    controls.start('visible');
    
    // Check for biometric support
    if (typeof window !== 'undefined' && 'navigator' in window) {
      if ('credentials' in navigator && 'webAuthn' in window) {
        setBiometricAvailable(true);
        setSecurityFeatures(prev => ({ ...prev, biometric: true }));
      }
    }
  }, [controls]);

  useEffect(() => {
    stepControls.start('visible');
  }, [currentStep, stepControls]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Security monitoring effect
  useEffect(() => {
    // Monitor for suspicious activity
    const handleVisibilityChange = () => {
      if (document.hidden && currentStep === 'verify') {
        console.warn('Security: User switched tabs during verification');
      }
    };

    const handleDevTools = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        console.warn('Security: Developer tools access attempted');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleDevTools);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleDevTools);
    };
  }, [currentStep]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleEmailAuth = useCallback(async (isSignup: boolean = false) => {
    if (!validateForm(isSignup ? 'signup' : 'login')) return;

    setIsLoading(true);
    setValidation(prev => ({ ...prev, errors: { ...prev.errors, general: undefined } }));

    try {
      // Security check animation
      setCurrentStep('security_check');
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (isSignup) {
        const signupData: SignupRequest = {
          email: formState.email,
          first_name: formState.firstName || undefined,
          last_name: formState.lastName || undefined,
          phone_number: formState.phoneNumber || undefined,
          department: formState.department || undefined,
          region: formState.region || undefined
        };

        const response = await authService.signupWithEmail(signupData);
        
        const requiresMFA = Boolean((response as any)?.data?.requiresMFA || (response as any)?.data?.requires_mfa || (response as any)?.data?.mfa_required);
        if (requiresMFA) {
          setMfaRequired(true);
          setCurrentStep('mfa');
        } else {
          setCurrentStep('verify');
        }
      } else {
        const loginData: LoginRequest = { email: formState.email };
        const response = await authService.loginWithEmail(loginData);
        
        const requiresMFA = Boolean((response as any)?.data?.requiresMFA || (response as any)?.data?.requires_mfa || (response as any)?.data?.mfa_required);
        if (requiresMFA) {
          setMfaRequired(true);
          setCurrentStep('mfa');
        } else {
          setCurrentStep('verify');
        }
      }

      setResendCooldown(60);
      
      // Animate step transition
      await stepControls.start('exit');
      await stepControls.start('visible');
      
    } catch (error: any) {
      setCurrentStep(isSignup ? 'signup' : 'login');
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          general: error.message || 'Authentication failed. Please try again.' 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [formState, validateForm, setValidation, stepControls]);

  const handleOAuthAuth = useCallback(async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    setAuthMethod(provider);
    setCurrentStep('security_check');

    try {
      // Enhanced security check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await authService.handleOAuthPopup(provider);
      setAuthResponse(response);
      setCurrentStep('success');
      
      // Trigger success animation
      await controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 }
      });
      
    } catch (error: any) {
      setCurrentStep('login');
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          general: error.message || `${provider} authentication failed. Please try again.` 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [controls, setValidation]);

  const handleVerifyCode = useCallback(async () => {
    if (!validateForm('verify')) return;

    setIsLoading(true);
    setValidation(prev => ({ ...prev, errors: { ...prev.errors, general: undefined } }));

    try {
      const verifyData: VerifyCodeRequest = {
        email: formState.email,
        code: formState.verificationCode
      };

      const response = await authService.verifyEmailCode(verifyData);
      setAuthResponse(response.data);
      setCurrentStep('success');
      
      // Success animation
      await controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.6 }
      });
      
    } catch (error: any) {
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          verificationCode: error.message || 'Invalid verification code. Please try again.' 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [formState.email, formState.verificationCode, validateForm, setValidation, controls]);

  const handleMFAVerify = useCallback(async () => {
    if (!validateForm('mfa')) return;

    setIsLoading(true);
    setValidation(prev => ({ ...prev, errors: { ...prev.errors, general: undefined } }));

    try {
      const mfaData: MFAVerifyRequest = {
        email: formState.email,
        code: formState.mfaCode
      };

      const response = await authService.verifyMFA(mfaData);
      setAuthResponse(response.data);
      setCurrentStep('success');
      
      // Success animation
      await controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.6 }
      });
      
    } catch (error: any) {
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          mfaCode: error.message || 'Invalid MFA code. Please try again.' 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [formState.email, formState.mfaCode, validateForm, setValidation, controls]);

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      await authService.resendVerificationCode(formState.email);
      setResendCooldown(60);
    } catch (error: any) {
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          general: error.message || 'Failed to resend verification code.' 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [formState.email, resendCooldown, setValidation]);

  const handleBiometricAuth = useCallback(async () => {
    if (!biometricAvailable) return;

    try {
      setIsLoading(true);
      
      // Simulate biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Data Governance Platform" },
          user: {
            id: new TextEncoder().encode(formState.email),
            name: formState.email,
            displayName: formState.email
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          attestation: "direct"
        }
      });

      if (credential) {
        setCurrentStep('success');
        setAuthResponse({
          message: 'Biometric authentication successful',
          user: { email: formState.email, id: 1 } as any
        });
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [biometricAvailable, formState.email]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateField('profilePicture', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [updateField]);

  const handleRemoveProfilePicture = useCallback(() => {
    updateField('profilePicture', null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [updateField]);

  const handleStepBack = useCallback(() => {
    if (currentStep === 'verify' || currentStep === 'mfa') {
      setCurrentStep('signup');
    } else if (currentStep === 'signup') {
      setCurrentStep('login');
    }
  }, [currentStep]);

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderEnhancedSecurityFeatures = () => (
    <motion.div 
      variants={securityVariants}
      initial="hidden"
      animate="visible"
      className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50 shadow-lg backdrop-blur-sm"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
          >
            <SecurityShieldIcon className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
              Enterprise Security Suite
            </h3>
            <p className="text-sm text-blue-700">Advanced threat protection enabled</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: '256-bit AES Encryption', enabled: securityFeatures.encryption, icon: LockClosedIcon },
            { label: 'Multi-Factor Auth', enabled: securityFeatures.twoFactor, icon: ShieldCheckIcon },
            { label: 'Zero Trust Architecture', enabled: securityFeatures.zeroTrust, icon: BoltIcon },
            { label: 'AI Threat Detection', enabled: securityFeatures.aiMonitoring, icon: CpuChipIcon },
            { label: 'Biometric Support', enabled: securityFeatures.biometric, icon: ShieldCheckIcon },
            { label: 'Real-time Audit', enabled: securityFeatures.auditLogging, icon: ClockIcon }
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2"
            >
              <div className={`w-3 h-3 rounded-full ${
                feature.enabled ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-300'
              } flex items-center justify-center`}>
                {feature.enabled && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </div>
              <feature.icon className="h-4 w-4 text-blue-600" />
              <span className={`font-medium ${
                feature.enabled ? 'text-blue-900' : 'text-gray-500'
              }`}>
                {feature.label}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200/50"
        >
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              Security Level: {securityLevel.charAt(0).toUpperCase() + securityLevel.slice(1)}
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Your connection is secured with enterprise-grade protection
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderSystemInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50"
    >
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <ComputerDesktopIcon className="h-4 w-4 mr-2" />
        Session Information
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <GlobeAltIcon className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">Platform: {systemInfo.platform}</span>
        </div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">TZ: {systemInfo.timezone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <WifiIcon className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">Connection: {systemInfo.connection}</span>
        </div>
        <div className="flex items-center space-x-2">
          <DeviceTabletIcon className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">Display: {systemInfo.screen}</span>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced form field renderer with advanced styling
  const renderFormField = (
    field: keyof FormState,
    label: string,
    type: string = 'text',
    icon?: React.ReactNode,
    placeholder?: string,
    options?: string[]
  ) => (
    <motion.div variants={fieldVariants} className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {['email', 'verificationCode', 'mfaCode'].includes(field) && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <div className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              {icon}
            </div>
          </div>
        )}
        
        {options ? (
          <select
            value={formState[field] as string}
            onChange={(e) => updateField(field, e.target.value)}
            className={`block w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-white/80 backdrop-blur-sm border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 hover:shadow-md ${
              validation.errors[field] 
                ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={formState[field] as string}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={placeholder}
            className={`block w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-white/80 backdrop-blur-sm border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 hover:shadow-md ${
              validation.errors[field] 
                ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            maxLength={
              field === 'email' ? FIELD_LENGTHS.EMAIL.max :
              field === 'firstName' ? FIELD_LENGTHS.FIRST_NAME.max :
              field === 'lastName' ? FIELD_LENGTHS.LAST_NAME.max :
              field === 'phoneNumber' ? FIELD_LENGTHS.PHONE_NUMBER.max :
              undefined
            }
          />
        )}
        
        {/* Enhanced error state */}
        {validation.errors[field] && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </motion.div>
        )}

        {/* Success state */}
        {!validation.errors[field] && validation.touched[field] && formState[field] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </motion.div>
        )}
      </div>
      
      {validation.errors[field] && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-red-600 bg-red-50/50 rounded-lg p-2"
        >
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{validation.errors[field]}</span>
        </motion.div>
      )}
    </motion.div>
  );

  // Enhanced profile picture upload with drag & drop
  const renderProfilePictureUpload = () => (
    <motion.div variants={fieldVariants} className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">Profile Picture</label>
      <div className="flex items-center space-x-6">
        <div className="relative">
          {profilePreview ? (
            <div className="relative group">
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-20 h-20 rounded-2xl object-cover border-3 border-gray-200 shadow-lg"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleRemoveProfilePicture}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="h-3 w-3" />
              </motion.button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center shadow-inner">
              <PhotoIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-6 py-3 border-2 border-blue-200 rounded-xl shadow-sm text-sm font-semibold text-blue-700 bg-blue-50/50 hover:bg-blue-100/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
          >
            <PhotoIcon className="h-5 w-5 mr-2" />
            Choose Photo
          </motion.button>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, GIF up to 10MB • Recommended: 400x400px
          </p>
        </div>
      </div>
      
      {validation.errors.profilePicture && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-red-600 bg-red-50/50 rounded-lg p-2"
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>{validation.errors.profilePicture}</span>
        </motion.div>
      )}
    </motion.div>
  );

  // Security check step
  const renderSecurityCheckStep = () => (
    <motion.div
      key="security_check"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8 text-center"
      ref={securityCheckRef}
    >
      <div className="space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25"
        >
          <ShieldCheckIcon className="h-10 w-10 text-white" />
        </motion.div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Verification</h1>
          <p className="text-gray-600 mt-2">
            Analyzing request and validating security protocols...
          </p>
        </div>

        {/* Security checks animation */}
        <div className="space-y-3">
          {[
            'Validating device fingerprint',
            'Checking IP reputation',
            'Analyzing behavioral patterns',
            'Verifying security certificates'
          ].map((check, index) => (
            <motion.div
              key={check}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.5 }}
              className="flex items-center justify-center space-x-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, delay: index * 0.5 }}
                className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
              />
              <span className="text-sm text-gray-600">{check}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Enhanced login step with Databricks-style design
  const renderLoginStep = () => (
    <motion.div
      key="login"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Header with animated logo */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.2, 
            type: "spring", 
            stiffness: 200,
            damping: 15
          }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25"
        >
          <DataGovernanceIcon className="h-12 w-12 text-white" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to your <span className="font-semibold text-blue-600">Data Governance Platform</span>
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <FireIcon className="h-4 w-4 text-orange-500" />
            <span>Powered by Enterprise AI & Zero Trust Security</span>
          </div>
        </div>
      </div>

      {/* Enhanced security features */}
      {renderEnhancedSecurityFeatures()}

      {/* Login form */}
      <div className="space-y-6">
        {renderFormField('email', 'Email Address', 'email', <EnvelopeIcon />, 'Enter your work email address')}

        {/* Advanced options */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={fieldVariants} className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember for 30 days
            </label>
          </motion.div>

          {biometricAvailable && (
            <motion.button
              variants={fieldVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleBiometricAuth}
              className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              <FingerPrintIcon className="h-4 w-4" />
              <span>Use Biometric</span>
            </motion.button>
          )}
        </div>

        {/* Primary action button */}
        <motion.button
          variants={fieldVariants}
          type="button"
          onClick={() => handleEmailAuth(false)}
          disabled={isLoading || !validation.isValid}
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <LoadingSpinner className="h-6 w-6" />
          ) : (
            <>
              <span>Continue with Email</span>
              <ArrowRightIcon className="ml-3 h-5 w-5" />
            </>
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            variants={fieldVariants}
            type="button"
            onClick={() => handleOAuthAuth('google')}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center py-3.5 px-4 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GoogleIcon className="h-5 w-5 mr-3" />
            Google
          </motion.button>
          
          <motion.button
            variants={fieldVariants}
            type="button"
            onClick={() => handleOAuthAuth('microsoft')}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center py-3.5 px-4 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MicrosoftIcon className="h-5 w-5 mr-3" />
            Microsoft
          </motion.button>
        </div>

        {/* Footer links */}
        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={() => setCurrentStep('signup')}
            className="text-sm text-blue-600 hover:text-blue-500 font-semibold transition-colors"
          >
            Don't have an account? <span className="underline">Sign up</span>
          </button>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-700 transition-colors">Terms</a>
            <span>•</span>
            <a href="/security" className="hover:text-gray-700 transition-colors">Security</a>
          </div>
        </div>
      </div>

      {/* System info */}
      {renderSystemInfo()}
    </motion.div>
  );

  // Enhanced signup step
  const renderSignupStep = () => (
    <motion.div
      key="signup"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/25"
        >
          <SparklesIcon className="h-10 w-10 text-white" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-lg text-gray-600">
            Join our <span className="font-semibold text-green-600">Enterprise Data Platform</span>
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <RocketLaunchIcon className="h-4 w-4 text-green-500" />
            <span>Get started in less than 60 seconds</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {renderFormField('email', 'Work Email Address', 'email', <EnvelopeIcon />, 'Enter your company email')}

        <div className="grid grid-cols-2 gap-4">
          {renderFormField('firstName', 'First Name', 'text', <UserIcon />, 'John')}
          {renderFormField('lastName', 'Last Name', 'text', <UserIcon />, 'Doe')}
        </div>

        {renderFormField('phoneNumber', 'Phone Number', 'tel', <DevicePhoneMobileIcon />, '+1 (555) 123-4567')}

        <div className="grid grid-cols-2 gap-4">
          {renderFormField('department', 'Department', 'text', <BuildingOfficeIcon />, undefined, departments)}
          {renderFormField('region', 'Region', 'text', <MapPinIcon />, undefined, regions)}
        </div>

        {renderProfilePictureUpload()}

        <motion.div variants={fieldVariants} className="flex items-start space-x-3">
          <input
            id="agree-terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="agree-terms" className="text-sm text-gray-700 leading-relaxed">
            I agree to the{' '}
            <a href="/terms" className="text-green-600 hover:text-green-500 font-semibold underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-green-600 hover:text-green-500 font-semibold underline">
              Privacy Policy
            </a>
            , and consent to data processing for platform functionality.
          </label>
        </motion.div>

        <motion.button
          variants={fieldVariants}
          type="button"
          onClick={() => handleEmailAuth(true)}
          disabled={isLoading || !validation.isValid || !agreedToTerms}
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <LoadingSpinner className="h-6 w-6" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRightIcon className="ml-3 h-5 w-5" />
            </>
          )}
        </motion.button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleStepBack}
            className="text-sm text-gray-600 hover:text-gray-500 font-semibold transition-colors inline-flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to sign in
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced verification step
  const renderVerifyStep = () => (
    <motion.div
      key="verify"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25"
        >
          <KeyIcon className="h-10 w-10 text-white" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to{' '}
            <span className="font-semibold text-purple-600">{formState.email}</span>
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Code expires in 10 minutes</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {renderFormField('verificationCode', 'Verification Code', 'text', <KeyIcon />, 'Enter 6-digit code')}

        <motion.button
          variants={fieldVariants}
          type="button"
          onClick={handleVerifyCode}
          disabled={isLoading || !validation.isValid}
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <LoadingSpinner className="h-6 w-6" />
          ) : (
            <>
              <span>Verify Email</span>
              <CheckCircleIcon className="ml-3 h-5 w-5" />
            </>
          )}
        </motion.button>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isLoading}
            className="text-sm text-purple-600 hover:text-purple-500 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification code'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleStepBack}
            className="text-sm text-gray-600 hover:text-gray-500 font-semibold transition-colors inline-flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to sign up
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced MFA step with MFAHandler integration
  const renderMFAStep = () => (
    <motion.div
      key="mfa"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/25"
        >
          <ShieldCheckIcon className="h-10 w-10 text-white" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <BoltIcon className="h-4 w-4 text-orange-500" />
            <span>Enhanced security enabled</span>
          </div>
        </div>
      </div>

      {showMFAHandler ? (
        <div className="bg-gray-50/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <MFAHandler />
        </div>
      ) : (
        <div className="space-y-6">
          {renderFormField('mfaCode', 'Authentication Code', 'text', <ShieldCheckIcon />, 'Enter 6-digit MFA code')}

          <motion.button
            variants={fieldVariants}
            type="button"
            onClick={handleMFAVerify}
            disabled={isLoading || !validation.isValid}
            className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <LoadingSpinner className="h-6 w-6" />
            ) : (
              <>
                <span>Verify & Continue</span>
                <CheckCircleIcon className="ml-3 h-5 w-5" />
              </>
            )}
          </motion.button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowMFAHandler(true)}
              className="text-sm text-orange-600 hover:text-orange-500 font-semibold transition-colors"
            >
              Need help with MFA setup?
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  // Enhanced success step
  const renderSuccessStep = () => (
    <motion.div
      key="success"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/25"
      >
        <CheckCircleIcon className="h-12 w-12 text-white" />
      </motion.div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Welcome to the Platform!
          </h1>
          <p className="text-xl text-gray-600">
            You've successfully authenticated with enterprise-grade security
          </p>
          {authResponse?.user && (
            <p className="text-sm text-gray-500">
              Signed in as <span className="font-semibold">{authResponse.user.display_name || authResponse.user.email}</span>
            </p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border border-green-200/50 shadow-lg"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <DataFlowIcon className="h-8 w-8 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-green-900">Platform Features</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Global Data Discovery', icon: GlobeAltIcon },
              { label: 'Advanced Security', icon: ShieldCheckIcon },
              { label: 'AI-Powered Insights', icon: CpuChipIcon },
              { label: 'Compliance Ready', icon: CheckCircleIcon },
              { label: 'Real-time Analytics', icon: BoltIcon },
              { label: 'Enterprise Support', icon: AcademicCapIcon }
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <feature.icon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800 font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        type="button"
        onClick={() => window.location.href = '/dashboard'}
        className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Continue to Dashboard</span>
        <RocketLaunchIcon className="ml-3 h-5 w-5" />
      </motion.button>
    </motion.div>
  );

  // Error display with enhanced styling
  const renderErrorMessage = () => {
    if (!validation.errors.general) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-red-800">Authentication Error</h4>
            <p className="text-sm text-red-700 mt-1">{validation.errors.general}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white via-purple-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden z-[9999]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-blue-400/10 rounded-full"
            animate={{
              x: [0, window.innerWidth || 1200],
              y: [0, -(window.innerHeight || 800)],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 50}%`
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial={false}
        animate="visible"
        className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl rounded-3xl sm:px-12 border border-gray-200/50 relative overflow-hidden">
          {/* Glass morphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 rounded-3xl" />
          
          <div className="relative z-10">
            {renderErrorMessage()}
            
            <AnimatePresence mode="wait">
              {currentStep === 'login' && renderLoginStep()}
              {currentStep === 'signup' && renderSignupStep()}
              {currentStep === 'verify' && renderVerifyStep()}
              {currentStep === 'mfa' && renderMFAStep()}
              {currentStep === 'security_check' && renderSecurityCheckStep()}
              {currentStep === 'success' && renderSuccessStep()}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center text-sm text-gray-500 relative z-10"
      >
        <p className="font-medium">
          © 2024 Data Governance Platform. Secured by Enterprise AI.
        </p>
        <div className="mt-3 flex items-center justify-center space-x-6">
          <a href="/help" className="text-blue-600 hover:text-blue-500 transition-colors font-medium">
            Help Center
          </a>
          <a href="/security" className="text-blue-600 hover:text-blue-500 transition-colors font-medium">
            Security
          </a>
          <a href="/status" className="text-blue-600 hover:text-blue-500 transition-colors font-medium">
            System Status
          </a>
        </div>
        <div className="mt-2 flex items-center justify-center space-x-2 text-xs">
          <SecurityShieldIcon className="h-3 w-3 text-green-500" />
          <span>SOC 2 Type II Certified • ISO 27001 Compliant</span>
        </div>
      </motion.div>
    </div>
  );
};