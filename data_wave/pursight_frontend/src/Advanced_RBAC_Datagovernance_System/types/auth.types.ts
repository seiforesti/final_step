// Authentication and Session Types - Maps to backend auth_models.py and auth_service.py

export interface Session {
  id: number;
  user_id: number;
  session_token: string;
  created_at: string;
  expires_at: string;
}

export interface EmailVerificationCode {
  id: number;
  email: string;
  code: string;
  created_at: string;
  expires_at: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  session_token?: string;
}

export interface LoginRequest {
  email: string;
}

export interface SignupRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  department?: string;
  region?: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface MFAVerifyRequest {
  email: string;
  code: string;
}

export interface RegisterWithInviteRequest {
  email: string;
  invite_token?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  birthday?: string;
  mail?: string;
  userPrincipalName?: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
}

export interface OAuthState {
  state: string;
  timestamp: number;
  provider: 'google' | 'microsoft';
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface MFASetupResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export interface AuthenticationContext {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export interface MFAMethod {
  id: number;
  type: 'totp' | 'sms' | 'email' | 'backup_codes' | 'biometric';
  enabled: boolean;
  created_at: string;
  last_used?: string;
  metadata?: any;
}

export interface BackupCode {
  id: number;
  code: string;
  used: boolean;
  used_at?: string;
  created_at: string;
}

export interface BiometricCredential {
  id: number;
  credential_id: string;
  type: 'fingerprint' | 'face' | 'touch';
  created_at: string;
  last_used?: string;
  metadata?: any;
}

export interface MFAChallenge {
  id: string;
  method: string;
  expires_at: string;
  attempts: number;
  max_attempts: number;
}

export interface SecurityEvent {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user_id: number;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
}

// Re-import User type from user.types.ts to avoid circular dependencies
import type { User } from './user.types';