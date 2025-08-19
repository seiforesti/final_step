export interface User {
  email: string;
  isActive: boolean;
  isVerified: boolean;
  mfaEnabled: boolean;
}

export interface Session {
  sessionToken: string;
  expiresAt: string;
  userEmail: string;
}

export interface EmailLoginRequest {
  email: string;
}

export interface EmailVerifyRequest {
  email: string;
  code: string;
}

export interface MfaVerifyRequest {
  email: string;
  code: string;
}
