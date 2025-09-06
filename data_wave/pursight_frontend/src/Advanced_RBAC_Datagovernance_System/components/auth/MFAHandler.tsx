'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ShieldCheckIcon, DevicePhoneMobileIcon, EnvelopeIcon, KeyIcon, QrCodeIcon, ExclamationTriangleIcon, CheckCircleIcon, XMarkIcon, ArrowPathIcon, ClockIcon, EyeIcon, EyeSlashIcon, DocumentDuplicateIcon, PrinterIcon, ArrowDownTrayIcon, CogIcon, FingerPrintIcon, FaceSmileIcon, LockClosedIcon, BoltIcon, InformationCircleIcon, ChevronRightIcon, ChevronDownIcon, StarIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/auth.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { formatDate, formatRelativeTime } from '../../utils/format.utils';
import { generateSecureRandom, generateSecurePassword, logSecurityEvent } from '../../utils/security.utils';
import { logRbacAction } from '../../utils/rbac.utils';
import type { 
  User, 
  MFAMethod, 
  MFASetupResponse, 
  MFAVerifyRequest,
  BackupCode,
  BiometricCredential,
  MFAChallenge,
  SecurityEvent
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface MFAState {
  isEnabled: boolean;
  methods: MFAMethod[];
  backupCodes: BackupCode[];
  biometricCredentials: BiometricCredential[];
  setupInProgress: MFAMethodType | null;
  verificationInProgress: boolean;
  isLoading: boolean;
  error: string | null;
  lastVerification: Date | null;
  securityEvents: SecurityEvent[];
}

type MFAMethodType = 'totp' | 'sms' | 'email' | 'backup_codes' | 'biometric';

interface MFASetupData {
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  phoneNumber?: string;
  email?: string;
  credentialId?: string;
}

interface MFAVerificationData {
  method: MFAMethodType;
  code?: string;
  credentialResponse?: any;
  backupCode?: string;
}

interface BiometricSupport {
  available: boolean;
  methods: string[];
  platform: string;
}

// ============================================================================
// ADVANCED MFA HANDLER COMPONENT
// ============================================================================

export const MFAHandler: React.FC = () => {
  // State Management
  const [state, setState] = useState<MFAState>({
    isEnabled: false,
    methods: [],
    backupCodes: [],
    biometricCredentials: [],
    setupInProgress: null,
    verificationInProgress: false,
    isLoading: true,
    error: null,
    lastVerification: null,
    securityEvents: []
  });

  const [setupData, setSetupData] = useState<MFASetupData>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<MFAMethodType | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showSecurityEvents, setShowSecurityEvents] = useState(false);
  const [biometricSupport, setBiometricSupport] = useState<BiometricSupport>({
    available: false,
    methods: [],
    platform: 'unknown'
  });
  const [countdown, setCountdown] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Hooks & Refs
  const { currentUser, permissions } = useCurrentUser();
  const controls = useAnimation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // DATA FETCHING & MANAGEMENT
  // ============================================================================

  const fetchMFAData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch MFA status and methods
      const mfaStatus = await authService.getMFAStatus(currentUser.id);
      
      // Fetch backup codes
      const backupCodes = await authService.getBackupCodes(currentUser.id);
      
      // Fetch biometric credentials
      const biometricCreds = await authService.getBiometricCredentials(currentUser.id);
      
      // Fetch recent security events
      const securityEvents = await authService.getSecurityEvents(currentUser.id, {
        types: ['mfa_enabled', 'mfa_disabled', 'mfa_verified', 'mfa_failed'],
        limit: 10
      });

      setState(prev => ({
        ...prev,
        isEnabled: mfaStatus.data.enabled,
        methods: mfaStatus.data.methods || [],
        backupCodes: backupCodes.data || [],
        biometricCredentials: biometricCreds.data || [],
        securityEvents: securityEvents.data || [],
        isLoading: false,
        lastVerification: mfaStatus.data.last_verification 
          ? new Date(mfaStatus.data.last_verification) 
          : null
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch MFA data',
        isLoading: false
      }));
    }
  }, [currentUser]);

  const checkBiometricSupport = useCallback(async () => {
    try {
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        const available = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "Data Governance Platform" },
            user: {
              id: new Uint8Array(16),
              name: "test",
              displayName: "Test"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 1000
          }
        }).then(() => true).catch(() => false);

        setBiometricSupport({
          available,
          methods: ['fingerprint', 'face', 'touch'],
          platform: navigator.platform
        });
      }
    } catch (error) {
      console.warn('Biometric support check failed:', error);
    }
  }, []);

  // ============================================================================
  // MFA SETUP METHODS
  // ============================================================================

  const setupTOTP = useCallback(async () => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, setupInProgress: 'totp', error: null }));

      const response = await authService.setupTOTP(currentUser.id);
      
      setSetupData({
        secret: response.data.secret,
        qrCode: response.data.qr_code
      });

      await logSecurityEvent('mfa_totp_setup_initiated', currentUser.id, {
        method: 'totp'
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to setup TOTP',
        setupInProgress: null
      }));
    }
  }, [currentUser]);

  const setupSMS = useCallback(async (phoneNumber: string) => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, setupInProgress: 'sms', error: null }));

      const response = await authService.setupSMS(currentUser.id, phoneNumber);
      
      setSetupData({ phoneNumber });
      startCountdown(60);

      await logSecurityEvent('mfa_sms_setup_initiated', currentUser.id, {
        method: 'sms',
        phone_number: phoneNumber.replace(/\d(?=\d{4})/g, '*')
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to setup SMS',
        setupInProgress: null
      }));
    }
  }, [currentUser]);

  const setupEmail = useCallback(async (email: string) => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, setupInProgress: 'email', error: null }));

      const response = await authService.setupEmailMFA(currentUser.id, email);
      
      setSetupData({ email });
      startCountdown(60);

      await logSecurityEvent('mfa_email_setup_initiated', currentUser.id, {
        method: 'email',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to setup email MFA',
        setupInProgress: null
      }));
    }
  }, [currentUser]);

  const setupBiometric = useCallback(async () => {
    if (!currentUser || !biometricSupport.available) return;

    try {
      setState(prev => ({ ...prev, setupInProgress: 'biometric', error: null }));

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "Data Governance Platform",
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(currentUser.id.toString()),
            name: currentUser.email,
            displayName: currentUser.display_name || currentUser.email
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000
        }
      }) as PublicKeyCredential;

      // Register with backend
      const response = await authService.setupBiometric(currentUser.id, {
        credentialId: credential.id,
        publicKey: credential.response,
        type: credential.type
      });

      await logSecurityEvent('mfa_biometric_setup_completed', currentUser.id, {
        method: 'biometric',
        credential_id: credential.id
      });

      await fetchMFAData();
      setState(prev => ({ ...prev, setupInProgress: null }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to setup biometric authentication',
        setupInProgress: null
      }));
    }
  }, [currentUser, biometricSupport.available, fetchMFAData]);

  const generateBackupCodes = useCallback(async () => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, setupInProgress: 'backup_codes', error: null }));

      const response = await authService.generateBackupCodes(currentUser.id);
      
      setSetupData({ backupCodes: response.data.codes });
      
      await logSecurityEvent('mfa_backup_codes_generated', currentUser.id, {
        method: 'backup_codes',
        count: response.data.codes.length
      });

      await fetchMFAData();

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to generate backup codes',
        setupInProgress: null
      }));
    }
  }, [currentUser, fetchMFAData]);

  // ============================================================================
  // MFA VERIFICATION
  // ============================================================================

  const verifyMFASetup = useCallback(async (verificationData: MFAVerificationData) => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, verificationInProgress: true, error: null }));

      const response = await authService.verifyMFASetup(currentUser.id, {
        method: verificationData.method,
        code: verificationData.code,
        backup_code: verificationData.backupCode,
        credential_response: verificationData.credentialResponse
      });

      await logRbacAction('mfa_setup_verified', currentUser.email, {
        resource_type: 'mfa',
        status: 'success',
        note: `MFA method ${verificationData.method} verified and enabled`
      });

      await fetchMFAData();
      setState(prev => ({ 
        ...prev, 
        setupInProgress: null, 
        verificationInProgress: false 
      }));
      setVerificationCode('');
      setSetupData({});

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'MFA verification failed',
        verificationInProgress: false
      }));

      await logSecurityEvent('mfa_setup_verification_failed', currentUser.id, {
        method: verificationData.method,
        error: error.message
      });
    }
  }, [currentUser, fetchMFAData]);

  const disableMFA = useCallback(async (method: MFAMethodType) => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await authService.disableMFA(currentUser.id, method);

      await logRbacAction('mfa_disabled', currentUser.email, {
        resource_type: 'mfa',
        status: 'success',
        note: `MFA method ${method} disabled`
      });

      await fetchMFAData();

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to disable MFA'
      }));
    }
  }, [currentUser, fetchMFAData]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, []);

  const downloadBackupCodes = useCallback(() => {
    if (!setupData.backupCodes) return;

    const content = [
      'Data Governance Platform - MFA Backup Codes',
      `Generated: ${new Date().toISOString()}`,
      `User: ${currentUser?.email}`,
      '',
      'IMPORTANT: Store these codes securely. Each code can only be used once.',
      '',
      ...setupData.backupCodes.map((code, index) => `${index + 1}. ${code}`)
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfa-backup-codes-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [setupData.backupCodes, currentUser?.email]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (currentUser) {
      fetchMFAData();
      checkBiometricSupport();
    }
  }, [currentUser, fetchMFAData, checkBiometricSupport]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (state.setupInProgress && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [state.setupInProgress]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getMethodIcon = (method: MFAMethodType) => {
    switch (method) {
      case 'totp': return <ShieldCheckIcon className="h-5 w-5" />;
      case 'sms': return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'email': return <EnvelopeIcon className="h-5 w-5" />;
      case 'biometric': return <FingerPrintIcon className="h-5 w-5" />;
      case 'backup_codes': return <KeyIcon className="h-5 w-5" />;
      default: return <LockClosedIcon className="h-5 w-5" />;
    }
  };

  const getMethodName = (method: MFAMethodType) => {
    switch (method) {
      case 'totp': return 'Authenticator App';
      case 'sms': return 'SMS Text Message';
      case 'email': return 'Email Code';
      case 'biometric': return 'Biometric';
      case 'backup_codes': return 'Backup Codes';
      default: return 'Unknown';
    }
  };

  const getMethodDescription = (method: MFAMethodType) => {
    switch (method) {
      case 'totp': return 'Use Google Authenticator, Authy, or similar apps';
      case 'sms': return 'Receive verification codes via text message';
      case 'email': return 'Receive verification codes via email';
      case 'biometric': return 'Use fingerprint, face, or touch authentication';
      case 'backup_codes': return 'One-time use codes for emergency access';
      default: return '';
    }
  };

  const isMethodEnabled = (method: MFAMethodType) => {
    return state.methods.some(m => m.type === method && m.enabled);
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderMFAStatus = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${
            state.isEnabled ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <ShieldCheckIcon className={`h-6 w-6 ${
              state.isEnabled ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Multi-Factor Authentication
            </h3>
            <p className={`text-sm ${
              state.isEnabled ? 'text-green-600' : 'text-red-600'
            }`}>
              {state.isEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {state.lastVerification && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Last verified</p>
              <p className="text-sm font-medium text-gray-900">
                {formatRelativeTime(state.lastVerification)}
              </p>
            </div>
          )}
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            state.isEnabled 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {state.methods.filter(m => m.enabled).length} methods active
          </div>
        </div>
      </div>

      {!state.isEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Enhanced Security Recommended
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Enable multi-factor authentication to add an extra layer of security to your account.
                This helps protect against unauthorized access even if your password is compromised.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderAvailableMethods = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Authentication Methods</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure your preferred authentication methods
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {/* TOTP Authenticator */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                {getMethodIcon('totp')}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {getMethodName('totp')}
                </h4>
                <p className="text-sm text-gray-600">
                  {getMethodDescription('totp')}
                </p>
                {isMethodEnabled('totp') && (
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isMethodEnabled('totp') ? (
                <button
                  onClick={() => disableMFA('totp')}
                  className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={setupTOTP}
                  disabled={state.setupInProgress === 'totp'}
                  className="px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {state.setupInProgress === 'totp' ? 'Setting up...' : 'Setup'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SMS */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                {getMethodIcon('sms')}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {getMethodName('sms')}
                </h4>
                <p className="text-sm text-gray-600">
                  {getMethodDescription('sms')}
                </p>
                {isMethodEnabled('sms') && (
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isMethodEnabled('sms') ? (
                <button
                  onClick={() => disableMFA('sms')}
                  className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={() => setSelectedMethod('sms')}
                  disabled={state.setupInProgress === 'sms'}
                  className="px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {state.setupInProgress === 'sms' ? 'Setting up...' : 'Setup'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                {getMethodIcon('email')}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {getMethodName('email')}
                </h4>
                <p className="text-sm text-gray-600">
                  {getMethodDescription('email')}
                </p>
                {isMethodEnabled('email') && (
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isMethodEnabled('email') ? (
                <button
                  onClick={() => disableMFA('email')}
                  className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={() => setSelectedMethod('email')}
                  disabled={state.setupInProgress === 'email'}
                  className="px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {state.setupInProgress === 'email' ? 'Setting up...' : 'Setup'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Biometric */}
        {biometricSupport.available && (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  {getMethodIcon('biometric')}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {getMethodName('biometric')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getMethodDescription('biometric')}
                  </p>
                  {isMethodEnabled('biometric') && (
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isMethodEnabled('biometric') ? (
                  <button
                    onClick={() => disableMFA('biometric')}
                    className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    onClick={setupBiometric}
                    disabled={state.setupInProgress === 'biometric'}
                    className="px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {state.setupInProgress === 'biometric' ? 'Setting up...' : 'Setup'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                {getMethodIcon('backup_codes')}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {getMethodName('backup_codes')}
                </h4>
                <p className="text-sm text-gray-600">
                  {getMethodDescription('backup_codes')}
                </p>
                {state.backupCodes.length > 0 && (
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">
                      {state.backupCodes.filter(c => !c.used).length} unused codes
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {state.backupCodes.length > 0 ? (
                <>
                  <button
                    onClick={() => setShowBackupCodes(true)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    View Codes
                  </button>
                  <button
                    onClick={generateBackupCodes}
                    className="px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Regenerate
                  </button>
                </>
              ) : (
                <button
                  onClick={generateBackupCodes}
                  disabled={state.setupInProgress === 'backup_codes'}
                  className="px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {state.setupInProgress === 'backup_codes' ? 'Generating...' : 'Generate'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSetupModal = () => {
    if (!state.setupInProgress) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setState(prev => ({ ...prev, setupInProgress: null }))}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Setup {getMethodName(state.setupInProgress)}
                </h3>
                <button
                  onClick={() => setState(prev => ({ ...prev, setupInProgress: null }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {state.setupInProgress === 'totp' && setupData.qrCode && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                      <img 
                        src={setupData.qrCode} 
                        alt="QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Manual entry key:</p>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono bg-white px-2 py-1 rounded border flex-1">
                        {setupData.secret}
                      </code>
                      <button
                        onClick={() => copyToClipboard(setupData.secret || '')}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter verification code
                    </label>
                    <input
                      ref={codeInputRef}
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={() => verifyMFASetup({ method: 'totp', code: verificationCode })}
                    disabled={!verificationCode || verificationCode.length !== 6 || state.verificationInProgress}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {state.verificationInProgress ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              )}

              {state.setupInProgress === 'backup_codes' && setupData.backupCodes && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Important: Save These Codes
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Store these backup codes in a safe place. Each code can only be used once.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.backupCodes.map((code, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 w-4">{index + 1}.</span>
                          <code className="text-sm font-mono bg-white px-2 py-1 rounded border flex-1">
                            {code}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => copyToClipboard(setupData.backupCodes?.join('\n') || '')}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={downloadBackupCodes}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>

                  <button
                    onClick={() => setState(prev => ({ ...prev, setupInProgress: null }))}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    I've Saved These Codes
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderSecurityEvents = () => {
    if (state.securityEvents.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent MFA Activity</h3>
            <button
              onClick={() => setShowSecurityEvents(!showSecurityEvents)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <span>{showSecurityEvents ? 'Hide' : 'Show'} Details</span>
              {showSecurityEvents ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {showSecurityEvents && (
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {state.securityEvents.map((event) => (
              <div key={event.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type.includes('failed') ? 'bg-red-500' :
                    event.type.includes('enabled') || event.type.includes('verified') ? 'bg-green-500' :
                    'bg-blue-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.timestamp, { format: 'medium' })}
                    </p>
                  </div>

                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    event.type.includes('failed') ? 'bg-red-100 text-red-800' :
                    event.type.includes('enabled') || event.type.includes('verified') ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {event.type.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="text-gray-600 mt-1">
            Secure your account with additional authentication methods
          </p>
        </div>
        
        <button
          onClick={fetchMFAData}
          disabled={state.isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* MFA Status */}
      {renderMFAStatus()}

      {/* Available Methods */}
      {renderAvailableMethods()}

      {/* Security Events */}
      {renderSecurityEvents()}

      {/* Setup Modal */}
      {renderSetupModal()}

      {/* Method Selection Modal */}
      <AnimatePresence>
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMethod(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Setup {getMethodName(selectedMethod)}
                  </h3>
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedMethod === 'sms' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setSetupData({ phoneNumber: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={() => setupSMS(setupData.phoneNumber || '')}
                      disabled={!setupData.phoneNumber}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Send Verification Code
                    </button>
                  </div>
                )}

                {selectedMethod === 'email' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="your-email@example.com"
                        defaultValue={currentUser?.email}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setSetupData({ email: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={() => setupEmail(setupData.email || currentUser?.email || '')}
                      disabled={!setupData.email && !currentUser?.email}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Send Verification Code
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};