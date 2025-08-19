/**
 * EnterpriseAuthenticationCenter.tsx
 * ==================================
 * 
 * Advanced Enterprise Authentication Management Component
 * 
 * Features:
 * - Multi-Factor Authentication (MFA) management and setup
 * - Enterprise Single Sign-On (SSO) integration and configuration
 * - Advanced password policies and security requirements
 * - Identity provider integration (LDAP, Active Directory, SAML, OAuth)
 * - Device trust and management
 * - Session management and security monitoring
 * - Backup codes and recovery options
 * - Authentication audit logs and compliance
 * - Risk-based authentication and adaptive security
 * - Biometric authentication support
 * - API authentication and token management
 * - Enterprise identity federation
 * 
 * Design:
 * - Modern enterprise-grade security interface
 * - Step-by-step authentication setup wizards
 * - Real-time security status indicators
 * - Advanced configuration panels
 * - Responsive design for all devices
 * - Accessibility compliance and keyboard navigation
 * - Dark/light theme support with security themes
 * 
 * Backend Integration:
 * - Maps to AuthenticationService, SecurityService, IdentityService
 * - Real-time WebSocket security alerts and monitoring
 * - Integration with enterprise identity providers
 * - Advanced security audit logging
 * - Cross-SPA authentication coordination
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Key,
  KeyRound,
  Lock,
  LockKeyhole,
  Unlock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Tablet,
  Fingerprint,
  Scan,
  ScanFace,
  QrCode,
  CreditCard,
  Usb,
  Wifi,
  WifiOff,
  Globe,
  Building,
  Server,
  Database,
  Cloud,
  Network,
  Settings,
  Cog,
  User,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Clock,
  Calendar,
  MapPin,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Bell,
  BellOff,
  Download,
  Upload,
  Copy,
  RefreshCw,
  RotateCcw,
  Loader2,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Link,
  Unlink,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Edit,
  Trash2,
  Save,
  Zap,
  Activity,
  BarChart3,
  TrendingUp,
  Target,
  Flag,
  Star,
  History,
  FileText,
  Download as DownloadIcon,
  Share2
} from 'lucide-react';

// Form validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Date handling
import { format, parseISO, isValid, addDays, addHours } from 'date-fns';

// Animations
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Toast notifications
import { toast } from 'sonner';

// QR Code generation
import QRCode from 'qrcode';

// OTP generation and validation
import { authenticator } from 'otplib';

// Racine hooks and services
import { useUserManagement } from '../../hooks/useUserManagement';
import { useRBACSystem } from '../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';

// Racine types
import {
  UserProfile,
  UserSession,
  SecurityAuditResponse,
  MFASetupResponse,
  UUID,
  ISODateString,
  OperationStatus
} from '../../types/racine-core.types';

// Racine utilities
import { 
  formatDate,
  formatTime,
  formatRelativeTime,
  validatePassword,
  generateSecureId,
  sanitizeInput
} from '../../utils/validation-utils';
import {
  generateQRCode,
  validateTOTP,
  generateBackupCodes,
  encryptData,
  decryptData
} from '../../utils/security-utils';
import {
  trackSecurityEvent,
  analyzeAuthenticationRisk,
  generateSecurityReport
} from '../../utils/analytics-utils';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface EnterpriseAuthenticationCenterProps {
  userId?: UUID;
  embedded?: boolean;
  onAuthUpdate?: (authData: AuthenticationState) => void;
  className?: string;
}

interface AuthenticationState {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  deviceTrustEnabled: boolean;
  ssoConfigured: boolean;
  passwordPolicy: PasswordPolicy;
  mfaDevices: MFADevice[];
  trustedDevices: TrustedDevice[];
  ssoProviders: SSOProvider[];
  securityScore: number;
  lastSecurityReview: ISODateString;
}

interface MFADevice {
  id: UUID;
  type: 'totp' | 'sms' | 'email' | 'hardware' | 'biometric';
  name: string;
  isActive: boolean;
  isPrimary: boolean;
  addedAt: ISODateString;
  lastUsed?: ISODateString;
  metadata: Record<string, any>;
}

interface TrustedDevice {
  id: UUID;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  platform: string;
  browser: string;
  location: string;
  ipAddress: string;
  fingerprint: string;
  addedAt: ISODateString;
  lastUsed: ISODateString;
  isActive: boolean;
  trustLevel: 'high' | 'medium' | 'low';
}

interface SSOProvider {
  id: UUID;
  name: string;
  type: 'saml' | 'oauth' | 'oidc' | 'ldap' | 'ad';
  domain: string;
  isActive: boolean;
  configuredAt: ISODateString;
  lastSync?: ISODateString;
  userCount: number;
  metadata: Record<string, any>;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  maxAge: number;
  requireMFA: boolean;
  lockoutThreshold: number;
  lockoutDuration: number;
}

interface SecurityEvent {
  id: UUID;
  type: 'login' | 'logout' | 'mfa_setup' | 'password_change' | 'device_trust' | 'sso_config' | 'security_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId: UUID;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: ISODateString;
  metadata: Record<string, any>;
}

interface AuthenticationRisk {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendations: string[];
}

interface RiskFactor {
  type: string;
  description: string;
  impact: number;
  details: Record<string, any>;
}

// =============================================================================
// FORM VALIDATION SCHEMAS
// =============================================================================

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const mfaSetupSchema = z.object({
  deviceName: z.string().min(1, 'Device name is required').max(50, 'Device name too long'),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  backupCodes: z.boolean().optional()
});

const ssoConfigSchema = z.object({
  providerName: z.string().min(1, 'Provider name is required'),
  providerType: z.enum(['saml', 'oauth', 'oidc', 'ldap', 'ad']),
  domain: z.string().min(1, 'Domain is required'),
  metadataUrl: z.string().url().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  issuerUrl: z.string().url().optional(),
  jwksUrl: z.string().url().optional()
});

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideInFromRightVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const staggerChildrenVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// =============================================================================
// CONSTANTS
// =============================================================================

const MFA_DEVICE_TYPES = [
  {
    type: 'totp',
    name: 'Authenticator App',
    description: 'Use Google Authenticator, Authy, or similar apps',
    icon: Smartphone,
    recommended: true
  },
  {
    type: 'sms',
    name: 'SMS/Text Message',
    description: 'Receive codes via text message',
    icon: MessageSquare,
    recommended: false
  },
  {
    type: 'email',
    name: 'Email',
    description: 'Receive codes via email',
    icon: Mail,
    recommended: false
  },
  {
    type: 'hardware',
    name: 'Hardware Token',
    description: 'Use YubiKey or similar hardware tokens',
    icon: Usb,
    recommended: true
  },
  {
    type: 'biometric',
    name: 'Biometric',
    description: 'Use fingerprint or face recognition',
    icon: Fingerprint,
    recommended: true
  }
];

const SSO_PROVIDER_TYPES = [
  {
    type: 'saml',
    name: 'SAML 2.0',
    description: 'Security Assertion Markup Language',
    icon: Shield,
    enterprise: true
  },
  {
    type: 'oauth',
    name: 'OAuth 2.0',
    description: 'Open Authorization',
    icon: Key,
    enterprise: false
  },
  {
    type: 'oidc',
    name: 'OpenID Connect',
    description: 'Built on OAuth 2.0',
    icon: Globe,
    enterprise: true
  },
  {
    type: 'ldap',
    name: 'LDAP',
    description: 'Lightweight Directory Access Protocol',
    icon: Database,
    enterprise: true
  },
  {
    type: 'ad',
    name: 'Active Directory',
    description: 'Microsoft Active Directory',
    icon: Building,
    enterprise: true
  }
];

const SECURITY_RISK_LEVELS = {
  low: { color: 'green', icon: CheckCircle, threshold: 25 },
  medium: { color: 'yellow', icon: AlertCircle, threshold: 50 },
  high: { color: 'orange', icon: AlertTriangle, threshold: 75 },
  critical: { color: 'red', icon: XCircle, threshold: 100 }
};

const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventReuse: 5,
  maxAge: 90,
  requireMFA: true,
  lockoutThreshold: 5,
  lockoutDuration: 30
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EnterpriseAuthenticationCenter: React.FC<EnterpriseAuthenticationCenterProps> = ({
  userId,
  embedded = false,
  onAuthUpdate,
  className = ''
}) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================

  const {
    userProfile,
    setupMFA,
    disableMFA,
    generateBackupCodes: generateBackupCodesAPI,
    changePassword,
    getSecurityEvents,
    getAuthenticationRisk,
    loading,
    error
  } = useUserManagement(userId);

  const {
    currentUser,
    hasPermission
  } = useRBACSystem();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  // Form management
  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const mfaForm = useForm({
    resolver: zodResolver(mfaSetupSchema),
    defaultValues: {
      deviceName: '',
      phoneNumber: '',
      email: '',
      backupCodes: true
    }
  });

  const ssoForm = useForm({
    resolver: zodResolver(ssoConfigSchema),
    defaultValues: {
      providerName: '',
      providerType: 'saml',
      domain: '',
      metadataUrl: '',
      clientId: '',
      clientSecret: '',
      issuerUrl: '',
      jwksUrl: ''
    }
  });

  // Component state
  const [activeTab, setActiveTab] = useState('overview');
  const [authState, setAuthState] = useState<AuthenticationState>({
    twoFactorEnabled: false,
    biometricEnabled: false,
    deviceTrustEnabled: false,
    ssoConfigured: false,
    passwordPolicy: DEFAULT_PASSWORD_POLICY,
    mfaDevices: [],
    trustedDevices: [],
    ssoProviders: [],
    securityScore: 0,
    lastSecurityReview: new Date().toISOString()
  });

  // MFA setup state
  const [mfaSetupStep, setMfaSetupStep] = useState(0);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQRCode, setMfaQRCode] = useState('');
  const [mfaBackupCodes, setMfaBackupCodes] = useState<string[]>([]);
  const [mfaVerificationCode, setMfaVerificationCode] = useState('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [selectedMfaType, setSelectedMfaType] = useState<string>('totp');

  // SSO configuration state
  const [showSsoSetup, setShowSsoSetup] = useState(false);
  const [ssoTestResults, setSsoTestResults] = useState<any>(null);

  // Security monitoring state
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [authRisk, setAuthRisk] = useState<AuthenticationRisk | null>(null);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  // Device management state
  const [showDeviceManager, setShowDeviceManager] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<TrustedDevice | null>(null);

  // Password policy state
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const [passwordPolicyChanges, setPasswordPolicyChanges] = useState<Partial<PasswordPolicy>>({});

  // UI state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Animation controls
  const controls = useAnimation();

  // Refs
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canManageAuth = useMemo(() => {
    return hasPermission('auth.manage') || hasPermission('user.manage');
  }, [hasPermission]);

  const securityScoreColor = useMemo(() => {
    const score = authState.securityScore;
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  }, [authState.securityScore]);

  const riskLevel = useMemo(() => {
    if (!authRisk) return 'low';
    return authRisk.level;
  }, [authRisk]);

  const mfaDeviceCount = useMemo(() => {
    return authState.mfaDevices.filter(device => device.isActive).length;
  }, [authState.mfaDevices]);

  const trustedDeviceCount = useMemo(() => {
    return authState.trustedDevices.filter(device => device.isActive).length;
  }, [authState.trustedDevices]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize authentication state
  useEffect(() => {
    const loadAuthenticationData = async () => {
      if (!userProfile) return;

      try {
        const [events, risk] = await Promise.all([
          getSecurityEvents(userProfile.id),
          getAuthenticationRisk(userProfile.id)
        ]);

        setSecurityEvents(events);
        setAuthRisk(risk);

        // Load current auth state from user profile
        const newAuthState: AuthenticationState = {
          twoFactorEnabled: userProfile.twoFactorEnabled || false,
          biometricEnabled: false, // TODO: Load from profile
          deviceTrustEnabled: false, // TODO: Load from profile
          ssoConfigured: false, // TODO: Load from profile
          passwordPolicy: DEFAULT_PASSWORD_POLICY, // TODO: Load from settings
          mfaDevices: [], // TODO: Load from API
          trustedDevices: [], // TODO: Load from API
          ssoProviders: [], // TODO: Load from API
          securityScore: risk?.score || 0,
          lastSecurityReview: new Date().toISOString()
        };

        setAuthState(newAuthState);

        if (onAuthUpdate) {
          onAuthUpdate(newAuthState);
        }

      } catch (error) {
        console.error('Failed to load authentication data:', error);
      }
    };

    loadAuthenticationData();
  }, [userProfile, getSecurityEvents, getAuthenticationRisk, onAuthUpdate]);

  // Animate component entrance
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handlePasswordChange = useCallback(async (data: any) => {
    if (!userProfile) return;

    try {
      await changePassword(userProfile.id, data.currentPassword, data.newPassword);
      
      toast.success('Password changed successfully');
      passwordForm.reset();
      setShowPasswordForm(false);

      // Track security event
      trackSecurityEvent({
        type: 'password_change',
        severity: 'medium',
        description: 'User changed password',
        userId: userProfile.id
      });

    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error.message || 'Failed to change password');
    }
  }, [userProfile, changePassword, passwordForm]);

  const handleMFASetup = useCallback(async () => {
    if (!userProfile) return;

    try {
      setIsGeneratingQR(true);

      // Generate MFA secret and QR code
      const secret = authenticator.generateSecret();
      const service = 'DataGovernancePlatform';
      const account = userProfile.email;
      const issuer = 'Enterprise Data Platform';

      const otpauth = authenticator.keyuri(account, issuer, secret);
      const qrCodeDataURL = await QRCode.toDataURL(otpauth);

      setMfaSecret(secret);
      setMfaQRCode(qrCodeDataURL);
      setMfaSetupStep(1);

    } catch (error) {
      console.error('Failed to generate MFA setup:', error);
      toast.error('Failed to generate MFA setup');
    } finally {
      setIsGeneratingQR(false);
    }
  }, [userProfile]);

  const handleMFAVerification = useCallback(async () => {
    if (!userProfile || !mfaSecret || !mfaVerificationCode) return;

    try {
      // Verify the TOTP code
      const isValid = authenticator.verify({
        token: mfaVerificationCode,
        secret: mfaSecret
      });

      if (!isValid) {
        toast.error('Invalid verification code. Please try again.');
        return;
      }

      // Setup MFA on the backend
      const formData = mfaForm.getValues();
      await setupMFA(userProfile.id, {
        type: selectedMfaType,
        secret: mfaSecret,
        deviceName: formData.deviceName || 'Default Device',
        generateBackupCodes: formData.backupCodes
      });

      // Generate backup codes if requested
      if (formData.backupCodes) {
        const backupCodes = await generateBackupCodesAPI(userProfile.id);
        setMfaBackupCodes(backupCodes);
        setMfaSetupStep(2);
      } else {
        setShowMfaSetup(false);
        setMfaSetupStep(0);
      }

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        twoFactorEnabled: true,
        mfaDevices: [
          ...prev.mfaDevices,
          {
            id: generateSecureId(),
            type: selectedMfaType as any,
            name: formData.deviceName || 'Default Device',
            isActive: true,
            isPrimary: prev.mfaDevices.length === 0,
            addedAt: new Date().toISOString(),
            metadata: { secret: mfaSecret }
          }
        ]
      }));

      toast.success('Two-factor authentication enabled successfully');

      // Track security event
      trackSecurityEvent({
        type: 'mfa_setup',
        severity: 'low',
        description: 'User enabled two-factor authentication',
        userId: userProfile.id
      });

    } catch (error: any) {
      console.error('Failed to verify MFA:', error);
      toast.error(error.message || 'Failed to enable two-factor authentication');
    }
  }, [userProfile, mfaSecret, mfaVerificationCode, selectedMfaType, mfaForm, setupMFA, generateBackupCodesAPI]);

  const handleMFADisable = useCallback(async (deviceId: UUID) => {
    if (!userProfile) return;

    try {
      await disableMFA(userProfile.id, deviceId);

      setAuthState(prev => ({
        ...prev,
        twoFactorEnabled: prev.mfaDevices.filter(d => d.id !== deviceId && d.isActive).length > 0,
        mfaDevices: prev.mfaDevices.map(device => 
          device.id === deviceId ? { ...device, isActive: false } : device
        )
      }));

      toast.success('MFA device disabled successfully');

      // Track security event
      trackSecurityEvent({
        type: 'mfa_setup',
        severity: 'medium',
        description: 'User disabled MFA device',
        userId: userProfile.id
      });

    } catch (error: any) {
      console.error('Failed to disable MFA:', error);
      toast.error(error.message || 'Failed to disable MFA device');
    }
  }, [userProfile, disableMFA]);

  const handleSSO配置 = useCallback(async (data: any) => {
    if (!userProfile) return;

    try {
      // TODO: Implement SSO configuration API call
      console.log('SSO Configuration:', data);

      // Simulate SSO setup
      const newProvider: SSOProvider = {
        id: generateSecureId(),
        name: data.providerName,
        type: data.providerType,
        domain: data.domain,
        isActive: true,
        configuredAt: new Date().toISOString(),
        userCount: 0,
        metadata: {
          metadataUrl: data.metadataUrl,
          clientId: data.clientId,
          issuerUrl: data.issuerUrl,
          jwksUrl: data.jwksUrl
        }
      };

      setAuthState(prev => ({
        ...prev,
        ssoConfigured: true,
        ssoProviders: [...prev.ssoProviders, newProvider]
      }));

      toast.success('SSO provider configured successfully');
      setShowSsoSetup(false);
      ssoForm.reset();

      // Track security event
      trackSecurityEvent({
        type: 'sso_config',
        severity: 'low',
        description: `SSO provider ${data.providerName} configured`,
        userId: userProfile.id
      });

    } catch (error: any) {
      console.error('Failed to configure SSO:', error);
      toast.error(error.message || 'Failed to configure SSO provider');
    }
  }, [userProfile, ssoForm]);

  const handleDeviceTrust = useCallback(async (deviceId: UUID, trust: boolean) => {
    if (!userProfile) return;

    try {
      // TODO: Implement device trust API call
      console.log('Device Trust:', deviceId, trust);

      setAuthState(prev => ({
        ...prev,
        trustedDevices: prev.trustedDevices.map(device =>
          device.id === deviceId ? { ...device, isActive: trust } : device
        )
      }));

      toast.success(`Device ${trust ? 'trusted' : 'untrusted'} successfully`);

      // Track security event
      trackSecurityEvent({
        type: 'device_trust',
        severity: 'low',
        description: `Device ${trust ? 'trusted' : 'untrusted'}`,
        userId: userProfile.id
      });

    } catch (error: any) {
      console.error('Failed to update device trust:', error);
      toast.error(error.message || 'Failed to update device trust');
    }
  }, [userProfile]);

  const handleDownloadBackupCodes = useCallback(() => {
    if (mfaBackupCodes.length === 0) return;

    const codesText = mfaBackupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Backup codes downloaded successfully');
  }, [mfaBackupCodes]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderSecurityOverview = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Security Score Card */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Score</span>
            </CardTitle>
            <CardDescription>
              Overall security assessment based on your authentication configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-4xl font-bold text-${securityScoreColor}-600`}>
                  {authState.securityScore}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Security Score</p>
              </div>
              
              <div className="flex-1">
                <Progress 
                  value={authState.securityScore} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>

            {authRisk && (
              <div className="mt-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  {React.createElement(SECURITY_RISK_LEVELS[authRisk.level].icon, {
                    className: `w-4 h-4 text-${SECURITY_RISK_LEVELS[authRisk.level].color}-600`
                  })}
                  <span className="font-medium capitalize">{authRisk.level} Risk Level</span>
                </div>
                <div className="space-y-1">
                  {authRisk.recommendations.slice(0, 3).map((rec, index) => (
                    <p key={index} className="text-sm text-gray-600 dark:text-gray-300">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Authentication Methods Grid */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${authState.twoFactorEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <ShieldCheck className={`w-5 h-5 ${authState.twoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-medium">Two-Factor Auth</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {authState.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {mfaDeviceCount} devices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${authState.ssoConfigured ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Building className={`w-5 h-5 ${authState.ssoConfigured ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-medium">Single Sign-On</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {authState.ssoConfigured ? 'Configured' : 'Not configured'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {authState.ssoProviders.length} providers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${authState.deviceTrustEnabled ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Monitor className={`w-5 h-5 ${authState.deviceTrustEnabled ? 'text-purple-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-medium">Device Trust</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {authState.deviceTrustEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {trustedDeviceCount} trusted
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${authState.biometricEnabled ? 'bg-teal-100 dark:bg-teal-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Fingerprint className={`w-5 h-5 ${authState.biometricEnabled ? 'text-teal-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-medium">Biometric Auth</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {authState.biometricEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your authentication settings and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex items-center space-x-2 h-auto p-4"
                onClick={() => setShowPasswordForm(true)}
              >
                <Key className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-500">Update your password</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 h-auto p-4"
                onClick={() => setShowMfaSetup(true)}
              >
                <ShieldCheck className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Setup 2FA</p>
                  <p className="text-sm text-gray-500">Enable two-factor auth</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 h-auto p-4"
                onClick={() => setShowDeviceManager(true)}
              >
                <Monitor className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Manage Devices</p>
                  <p className="text-sm text-gray-500">View trusted devices</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderMFAManagement = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* MFA Status */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Two-Factor Authentication</span>
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${authState.twoFactorEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">
                    Two-factor authentication is {authState.twoFactorEnabled ? 'enabled' : 'disabled'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {authState.twoFactorEnabled 
                      ? `${mfaDeviceCount} active devices configured`
                      : 'No MFA devices configured'
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowMfaSetup(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Device</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* MFA Devices List */}
      {authState.mfaDevices.length > 0 && (
        <motion.div variants={fadeInUpVariants}>
          <Card>
            <CardHeader>
              <CardTitle>MFA Devices</CardTitle>
              <CardDescription>
                Manage your two-factor authentication devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authState.mfaDevices.map((device) => {
                  const deviceType = MFA_DEVICE_TYPES.find(t => t.type === device.type);
                  const DeviceIcon = deviceType?.icon || Smartphone;
                  
                  return (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${device.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <DeviceIcon className={`w-5 h-5 ${device.isActive ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{device.name}</p>
                            {device.isPrimary && (
                              <Badge variant="secondary">Primary</Badge>
                            )}
                            {!device.isActive && (
                              <Badge variant="destructive">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {deviceType?.name} • Added {formatRelativeTime(device.addedAt)}
                          </p>
                          {device.lastUsed && (
                            <p className="text-xs text-gray-400">
                              Last used {formatRelativeTime(device.lastUsed)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {device.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMFADisable(device.id)}
                          >
                            Disable
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reset
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Backup Codes */}
      {authState.twoFactorEnabled && (
        <motion.div variants={fadeInUpVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Backup Codes</span>
              </CardTitle>
              <CardDescription>
                Use these codes to access your account if you lose your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recovery Codes</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keep these codes safe and accessible
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                    View Codes
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  const renderSSOConfiguration = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* SSO Status */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Single Sign-On</span>
            </CardTitle>
            <CardDescription>
              Configure enterprise identity providers for seamless authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${authState.ssoConfigured ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div>
                  <p className="font-medium">
                    SSO is {authState.ssoConfigured ? 'configured' : 'not configured'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {authState.ssoProviders.length} providers configured
                  </p>
                </div>
              </div>
              {canManageAuth && (
                <Button
                  onClick={() => setShowSsoSetup(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Provider</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SSO Providers */}
      {authState.ssoProviders.length > 0 && (
        <motion.div variants={fadeInUpVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Identity Providers</CardTitle>
              <CardDescription>
                Manage your enterprise identity provider integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authState.ssoProviders.map((provider) => {
                  const providerType = SSO_PROVIDER_TYPES.find(t => t.type === provider.type);
                  const ProviderIcon = providerType?.icon || Globe;
                  
                  return (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${provider.isActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <ProviderIcon className={`w-5 h-5 ${provider.isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{provider.name}</p>
                            {providerType?.enterprise && (
                              <Badge variant="secondary">Enterprise</Badge>
                            )}
                            {!provider.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {providerType?.name} • {provider.domain}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                            <span>{provider.userCount} users</span>
                            <span>Configured {formatRelativeTime(provider.configuredAt)}</span>
                            {provider.lastSync && (
                              <span>Last sync {formatRelativeTime(provider.lastSync)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Activity className="w-4 h-4 mr-2" />
                              View Logs
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Provider Types Guide */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Supported Providers</CardTitle>
            <CardDescription>
              Choose from enterprise-grade identity providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SSO_PROVIDER_TYPES.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <div key={type.type} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <TypeIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{type.name}</p>
                        {type.enterprise && (
                          <Badge variant="secondary" className="text-xs">Enterprise</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderSecurityMonitoring = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Security Events */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Security Events</span>
            </CardTitle>
            <CardDescription>
              Monitor authentication activities and security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {securityEvents.slice(0, 20).map((event) => {
                  const severityColor = {
                    low: 'green',
                    medium: 'yellow',
                    high: 'orange',
                    critical: 'red'
                  }[event.severity];

                  return (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 bg-${severityColor}-100 dark:bg-${severityColor}-900 rounded-lg`}>
                        <Shield className={`w-4 h-4 text-${severityColor}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{event.description}</p>
                          <Badge variant="outline" className={`text-${severityColor}-600`}>
                            {event.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span>{formatRelativeTime(event.timestamp)}</span>
                          <span>•</span>
                          <span>{event.ipAddress}</span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Assessment */}
      {authRisk && (
        <motion.div variants={fadeInUpVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Risk Assessment</span>
              </CardTitle>
              <CardDescription>
                Current security risk factors and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Overall Risk Level</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Based on {authRisk.factors.length} risk factors
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-${SECURITY_RISK_LEVELS[authRisk.level].color}-600 capitalize`}
                  >
                    {authRisk.level} Risk
                  </Badge>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Risk Factors</h4>
                  <div className="space-y-3">
                    {authRisk.factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{factor.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {factor.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Impact: {factor.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {authRisk.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  // =============================================================================
  // DIALOGS AND MODALS
  // =============================================================================

  const renderPasswordChangeDialog = () => (
    <Dialog open={showPasswordForm} onOpenChange={setShowPasswordForm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new secure password
          </DialogDescription>
        </DialogHeader>
        
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const renderMFASetupDialog = () => (
    <Dialog open={showMfaSetup} onOpenChange={(open) => {
      setShowMfaSetup(open);
      if (!open) {
        setMfaSetupStep(0);
        setMfaSecret('');
        setMfaQRCode('');
        setMfaVerificationCode('');
        mfaForm.reset();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Step {mfaSetupStep + 1} of 3: Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {mfaSetupStep === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Choose Authentication Method</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {MFA_DEVICE_TYPES.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() => setSelectedMfaType(type.type)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedMfaType === type.type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <TypeIcon className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{type.name}</p>
                            {type.recommended && (
                              <Badge variant="secondary" className="text-xs">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Form {...mfaForm}>
              <FormField
                control={mfaForm.control}
                name="deviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., iPhone Authenticator" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </div>
        )}

        {mfaSetupStep === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Scan QR Code</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Scan this QR code with your authenticator app
              </p>
              
              {mfaQRCode && (
                <div className="flex justify-center mb-4">
                  <img src={mfaQRCode} alt="MFA QR Code" className="w-48 h-48" />
                </div>
              )}

              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={mfaVerificationCode}
                  onChange={(e) => setMfaVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center font-mono text-lg"
                />
              </div>
            </div>
          </div>
        )}

        {mfaSetupStep === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Backup Codes Generated</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Save these codes in a safe place. You can use them to access your account if you lose your device.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {mfaBackupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-white dark:bg-gray-700 rounded border">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleDownloadBackupCodes}
              className="w-full flex items-center space-x-2"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download Backup Codes</span>
            </Button>
          </div>
        )}

        <DialogFooter>
          {mfaSetupStep === 0 && (
            <>
              <Button variant="outline" onClick={() => setShowMfaSetup(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMFASetup}
                disabled={!selectedMfaType || isGeneratingQR}
              >
                {isGeneratingQR && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Continue
              </Button>
            </>
          )}

          {mfaSetupStep === 1 && (
            <>
              <Button variant="outline" onClick={() => setMfaSetupStep(0)}>
                Back
              </Button>
              <Button 
                onClick={handleMFAVerification}
                disabled={mfaVerificationCode.length !== 6}
              >
                Verify & Enable
              </Button>
            </>
          )}

          {mfaSetupStep === 2 && (
            <Button onClick={() => setShowMfaSetup(false)} className="w-full">
              Complete Setup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderSSOSetupDialog = () => (
    <Dialog open={showSsoSetup} onOpenChange={setShowSsoSetup}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure SSO Provider</DialogTitle>
          <DialogDescription>
            Add a new enterprise identity provider for single sign-on
          </DialogDescription>
        </DialogHeader>

        <Form {...ssoForm}>
          <form onSubmit={ssoForm.handleSubmit(handleSSO配置)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={ssoForm.control}
                name="providerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Company SAML" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ssoForm.control}
                name="providerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SSO_PROVIDER_TYPES.map((type) => (
                          <SelectItem key={type.type} value={type.type}>
                            <div className="flex items-center space-x-2">
                              <type.icon className="w-4 h-4" />
                              <span>{type.name}</span>
                              {type.enterprise && (
                                <Badge variant="secondary" className="text-xs">Enterprise</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={ssoForm.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., company.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Users with this email domain will be able to use SSO
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {ssoForm.watch('providerType') === 'saml' && (
              <FormField
                control={ssoForm.control}
                name="metadataUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SAML Metadata URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(ssoForm.watch('providerType') === 'oauth' || ssoForm.watch('providerType') === 'oidc') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={ssoForm.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input placeholder="OAuth Client ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ssoForm.control}
                  name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="OAuth Client Secret" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSsoSetup(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Configure Provider
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading authentication settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate={controls}
        variants={fadeInUpVariants}
        className={`enterprise-authentication-center ${className}`}
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div variants={fadeInUpVariants}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Enterprise Authentication</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage security settings, MFA, SSO, and authentication policies
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`text-${securityScoreColor}-600`}>
                  Security Score: {authState.securityScore}
                </Badge>
                {authRisk && (
                  <Badge variant="outline" className={`text-${SECURITY_RISK_LEVELS[authRisk.level].color}-600`}>
                    {authRisk.level} Risk
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="mfa" className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Two-Factor Auth</span>
                    </TabsTrigger>
                    <TabsTrigger value="sso" className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Single Sign-On</span>
                    </TabsTrigger>
                    <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Security Monitoring</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="overview">
                    {renderSecurityOverview()}
                  </TabsContent>

                  <TabsContent value="mfa">
                    {renderMFAManagement()}
                  </TabsContent>

                  <TabsContent value="sso">
                    {renderSSOConfiguration()}
                  </TabsContent>

                  <TabsContent value="monitoring">
                    {renderSecurityMonitoring()}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        {renderPasswordChangeDialog()}
        {renderMFASetupDialog()}
        {renderSSOSetupDialog()}
      </motion.div>
    </TooltipProvider>
  );
};

export default EnterpriseAuthenticationCenter;