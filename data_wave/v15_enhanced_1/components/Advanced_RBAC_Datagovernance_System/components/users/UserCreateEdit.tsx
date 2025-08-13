'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  KeyIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  CogIcon,
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { roleService } from '../../services/role.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { validateUserEmail, validateUserPassword, validateUserProfile } from '../../utils/validation.utils';
import { formatDate, formatUserName } from '../../utils/format.utils';
import { hasPermission, getUserDisplayName } from '../../utils/rbac.utils';
import { generateSecurePassword, validatePasswordStrength } from '../../utils/security.utils';
import type {
  User,
  UserCreate,
  UserUpdate,
  Role,
  Department,
  Region,
  ValidationResult
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UserCreateEditProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  mode: 'create' | 'edit';
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  display_name: string;
  phone_number: string;
  department: string;
  region: string;
  profile_picture: string | null;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  role_ids: number[];
  metadata: Record<string, any>;
}

interface FormErrors {
  [key: string]: string[];
}

interface SecuritySettings {
  requirePasswordChange: boolean;
  accountLocked: boolean;
  sessionTimeout: number;
  allowMultipleSessions: boolean;
  requireMFA: boolean;
  allowedIpRanges: string[];
}

interface ProfilePictureUpload {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  error: string | null;
}

// ============================================================================
// ADVANCED USER CREATE/EDIT COMPONENT
// ============================================================================

export const UserCreateEdit: React.FC<UserCreateEditProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  mode
}) => {
  // State Management
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    display_name: '',
    phone_number: '',
    department: '',
    region: '',
    profile_picture: null,
    is_active: true,
    is_verified: false,
    mfa_enabled: false,
    role_ids: [],
    metadata: {}
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'roles' | 'advanced'>('basic');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requirePasswordChange: false,
    accountLocked: false,
    sessionTimeout: 3600,
    allowMultipleSessions: true,
    requireMFA: false,
    allowedIpRanges: []
  });
  const [profilePicture, setProfilePicture] = useState<ProfilePictureUpload>({
    file: null,
    preview: null,
    uploading: false,
    error: null
  });
  const [passwordGenerated, setPasswordGenerated] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});

  // Hooks
  const { currentUser } = useCurrentUser();

  // Permission checks
  const canCreateUser = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.create', '*'), [currentUser]);
  const canEditUser = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.edit', user?.id?.toString() || '*'), [currentUser, user]);
  const canAssignRoles = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.roles.assign', user?.id?.toString() || '*'), [currentUser, user]);
  const canManageSecurity = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.security.manage', user?.id?.toString() || '*'), [currentUser, user]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchFormData = useCallback(async () => {
    try {
      // Fetch available roles, departments, and regions
      const [rolesResponse, departmentsResponse, regionsResponse] = await Promise.all([
        roleService.listRoles({ page: 1, limit: 1000 }),
        userService.getDepartments(),
        userService.getRegions()
      ]);

      setAvailableRoles(rolesResponse.data.items || []);
      setDepartments(departmentsResponse.data || []);
      setRegions(regionsResponse.data || []);

      // If editing, populate form with user data
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email || '',
          password: '',
          confirmPassword: '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          display_name: user.display_name || '',
          phone_number: user.phone_number || '',
          department: user.department || '',
          region: user.region || '',
          profile_picture: user.profile_picture || null,
          is_active: user.is_active ?? true,
          is_verified: user.is_verified ?? false,
          mfa_enabled: user.mfa_enabled ?? false,
          role_ids: user.roles?.map(role => role.id) || [],
          metadata: user.metadata || {}
        });

        // Set profile picture preview if exists
        if (user.profile_picture) {
          setProfilePicture(prev => ({
            ...prev,
            preview: user.profile_picture
          }));
        }

        // Fetch user security settings if allowed
        if (canManageSecurity) {
          try {
            const securityResponse = await userService.getUserSecuritySettings(user.id);
            setSecuritySettings(securityResponse.data);
          } catch (error) {
            console.error('Failed to fetch security settings:', error);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch form data:', error);
      setFormErrors({ general: [error.message || 'Failed to load form data'] });
    }
  }, [mode, user, canManageSecurity]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      fetchFormData();
    }
  }, [isOpen, fetchFormData]);

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================

  const validateField = useCallback(async (field: string, value: any) => {
    const errors: string[] = [];
    let result: ValidationResult = { valid: true, errors: [] };

    switch (field) {
      case 'email':
        result = validateUserEmail(value);
        break;
      case 'password':
        if (mode === 'create' || value) {
          result = validatePasswordStrength(value);
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          result = { valid: false, errors: ['Passwords do not match'] };
        }
        break;
      case 'first_name':
      case 'last_name':
        if (!value || value.trim().length === 0) {
          result = { valid: false, errors: [`${field.replace('_', ' ')} is required`] };
        } else if (value.length > 50) {
          result = { valid: false, errors: [`${field.replace('_', ' ')} cannot exceed 50 characters`] };
        }
        break;
      case 'phone_number':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          result = { valid: false, errors: ['Invalid phone number format'] };
        }
        break;
      default:
        break;
    }

    setValidationResults(prev => ({
      ...prev,
      [field]: result
    }));

    setFormErrors(prev => ({
      ...prev,
      [field]: result.errors
    }));

    return result.valid;
  }, [formData.password, mode]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldsToValidate = [
      'email',
      'first_name',
      'last_name',
      'phone_number'
    ];

    if (mode === 'create' || formData.password) {
      fieldsToValidate.push('password', 'confirmPassword');
    }

    const validationPromises = fieldsToValidate.map(field => 
      validateField(field, formData[field as keyof FormData])
    );

    const results = await Promise.all(validationPromises);
    return results.every(result => result);
  }, [formData, mode, validateField]);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors for this field
    setFormErrors(prev => ({
      ...prev,
      [field]: []
    }));

    // Validate field after a delay
    const timeoutId = setTimeout(() => {
      validateField(field, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [validateField]);

  const handleRoleToggle = useCallback((roleId: number) => {
    if (!canAssignRoles) return;

    setFormData(prev => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId]
    }));
  }, [canAssignRoles]);

  const handleProfilePictureUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setProfilePicture(prev => ({
        ...prev,
        error: 'Please select a valid image file'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setProfilePicture(prev => ({
        ...prev,
        error: 'File size must be less than 5MB'
      }));
      return;
    }

    setProfilePicture(prev => ({
      ...prev,
      file,
      uploading: true,
      error: null,
      preview: URL.createObjectURL(file)
    }));

    try {
      const uploadResponse = await userService.uploadProfilePicture(file);
      setFormData(prev => ({
        ...prev,
        profile_picture: uploadResponse.data.url
      }));

      setProfilePicture(prev => ({
        ...prev,
        uploading: false
      }));
    } catch (error: any) {
      setProfilePicture(prev => ({
        ...prev,
        uploading: false,
        error: error.message || 'Failed to upload profile picture'
      }));
    }
  }, []);

  const generatePassword = useCallback(() => {
    const password = generateSecurePassword(12, {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    });

    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));

    setPasswordGenerated(true);
    validateField('password', password);
  }, [validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateUser && mode === 'create') {
      setFormErrors({ general: ['You do not have permission to create users'] });
      return;
    }

    if (!canEditUser && mode === 'edit') {
      setFormErrors({ general: ['You do not have permission to edit this user'] });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Validate form
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Prepare user data
      const userData: UserCreate | UserUpdate = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name || `${formData.first_name} ${formData.last_name}`.trim(),
        phone_number: formData.phone_number || null,
        department: formData.department || null,
        region: formData.region || null,
        profile_picture: formData.profile_picture,
        is_active: formData.is_active,
        is_verified: formData.is_verified,
        metadata: formData.metadata
      };

      if (mode === 'create') {
        (userData as UserCreate).password = formData.password;
      } else if (formData.password) {
        (userData as UserUpdate).password = formData.password;
      }

      // Create or update user
      let savedUser: User;
      if (mode === 'create') {
        const response = await userService.createUser(userData as UserCreate);
        savedUser = response.data;
      } else {
        const response = await userService.updateUser(user!.id, userData as UserUpdate);
        savedUser = response.data;
      }

      // Assign roles if changed and user has permission
      if (canAssignRoles && formData.role_ids.length > 0) {
        await userService.assignRolesToUser(savedUser.id, formData.role_ids);
      }

      // Update security settings if changed and user has permission
      if (canManageSecurity && mode === 'edit') {
        await userService.updateUserSecuritySettings(savedUser.id, securitySettings);
      }

      onSave(savedUser);
      onClose();
    } catch (error: any) {
      setFormErrors({
        general: [error.message || `Failed to ${mode} user`]
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    mode,
    user,
    canCreateUser,
    canEditUser,
    canAssignRoles,
    canManageSecurity,
    securitySettings,
    validateForm,
    onSave,
    onClose
  ]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          {profilePicture.preview ? (
            <img
              src={profilePicture.preview}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {profilePicture.uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleProfilePictureUpload(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
          {profilePicture.error && (
            <p className="mt-1 text-sm text-red-600">{profilePicture.error}</p>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.first_name?.length ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          {formErrors.first_name?.map((error, index) => (
            <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.last_name?.length ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          {formErrors.last_name?.map((error, index) => (
            <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => handleInputChange('display_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.email?.length ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {formErrors.email?.map((error, index) => (
            <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.phone_number?.length ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
          />
          {formErrors.phone_number?.map((error, index) => (
            <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.name}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Password Section */}
      {(mode === 'create' || mode === 'edit') && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            {mode === 'create' ? 'Password *' : 'Change Password'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {mode === 'create' ? '*' : ''}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.password?.length ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={mode === 'create' ? 'Enter password' : 'Enter new password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.password?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
              
              <button
                type="button"
                onClick={generatePassword}
                className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Generate Password
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password {mode === 'create' ? '*' : ''}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.confirmPassword?.length ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>
          </div>

          {passwordGenerated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    A secure password has been generated. Make sure to save it securely and share it with the user through a secure channel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Status */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Account Status</h4>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active Account
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="is_verified"
              type="checkbox"
              checked={formData.is_verified}
              onChange={(e) => handleInputChange('is_verified', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_verified" className="ml-2 block text-sm text-gray-900">
              Email Verified
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="mfa_enabled"
              type="checkbox"
              checked={formData.mfa_enabled}
              onChange={(e) => handleInputChange('mfa_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="mfa_enabled" className="ml-2 block text-sm text-gray-900">
              Multi-Factor Authentication Enabled
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => {
    if (!canManageSecurity) {
      return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to manage security settings.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="requirePasswordChange"
                type="checkbox"
                checked={securitySettings.requirePasswordChange}
                onChange={(e) => setSecuritySettings(prev => ({
                  ...prev,
                  requirePasswordChange: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requirePasswordChange" className="ml-2 block text-sm text-gray-900">
                Require password change on next login
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="accountLocked"
                type="checkbox"
                checked={securitySettings.accountLocked}
                onChange={(e) => setSecuritySettings(prev => ({
                  ...prev,
                  accountLocked: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="accountLocked" className="ml-2 block text-sm text-gray-900">
                Account locked
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="allowMultipleSessions"
                type="checkbox"
                checked={securitySettings.allowMultipleSessions}
                onChange={(e) => setSecuritySettings(prev => ({
                  ...prev,
                  allowMultipleSessions: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowMultipleSessions" className="ml-2 block text-sm text-gray-900">
                Allow multiple concurrent sessions
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="requireMFA"
                type="checkbox"
                checked={securitySettings.requireMFA}
                onChange={(e) => setSecuritySettings(prev => ({
                  ...prev,
                  requireMFA: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireMFA" className="ml-2 block text-sm text-gray-900">
                Require multi-factor authentication
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (seconds)
            </label>
            <input
              type="number"
              min="300"
              max="86400"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings(prev => ({
                ...prev,
                sessionTimeout: parseInt(e.target.value) || 3600
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed IP Ranges (one per line)
          </label>
          <textarea
            rows={4}
            value={securitySettings.allowedIpRanges.join('\n')}
            onChange={(e) => setSecuritySettings(prev => ({
              ...prev,
              allowedIpRanges: e.target.value.split('\n').filter(ip => ip.trim())
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="192.168.1.0/24&#10;10.0.0.0/8"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to allow access from any IP address. Use CIDR notation for IP ranges.
          </p>
        </div>
      </div>
    );
  };

  const renderRolesTab = () => {
    if (!canAssignRoles) {
      return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to assign roles.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Available Roles ({availableRoles.length})
          </h4>
          
          {availableRoles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.role_ids.includes(role.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.role_ids.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{role.name}</p>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {role.permissions?.length || 0} permissions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No roles available</h3>
              <p className="mt-1 text-sm text-gray-500">
                No roles are available for assignment.
              </p>
            </div>
          )}
        </div>

        {formData.role_ids.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Selected Roles ({formData.role_ids.length})
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {formData.role_ids.map((roleId) => {
                const role = availableRoles.find(r => r.id === roleId);
                if (!role) return null;
                
                return (
                  <span
                    key={roleId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {role.name}
                    <button
                      type="button"
                      onClick={() => handleRoleToggle(roleId)}
                      className="ml-2 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none focus:bg-blue-200 focus:text-blue-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Metadata</h4>
        
        <div className="space-y-4">
          <textarea
            rows={6}
            value={JSON.stringify(formData.metadata, null, 2)}
            onChange={(e) => {
              try {
                const metadata = JSON.parse(e.target.value);
                handleInputChange('metadata', metadata);
              } catch (error) {
                // Invalid JSON, don't update
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder='{"key": "value"}'
          />
          <p className="text-sm text-gray-500">
            Additional metadata in JSON format. This can be used to store custom user attributes.
          </p>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {mode === 'create' ? 'Create New User' : `Edit User: ${getUserDisplayName(user!)}`}
            </h2>
            
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'basic', name: 'Basic Info', icon: UserIcon },
              { id: 'security', name: 'Security', icon: ShieldCheckIcon },
              { id: 'roles', name: 'Roles', icon: UserGroupIcon },
              { id: 'advanced', name: 'Advanced', icon: CogIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* General Errors */}
            {formErrors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {formErrors.general.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'roles' && renderRolesTab()}
            {activeTab === 'advanced' && renderAdvancedTab()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Create User' : 'Update User'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};