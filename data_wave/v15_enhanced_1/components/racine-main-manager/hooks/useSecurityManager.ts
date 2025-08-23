'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import security APIs
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis'
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis'

// Import types
import {
  SecurityPolicy,
  ValidationResult,
  EncryptionConfig,
  SecurityValidation,
  EncryptedCredentials,
  SecurityVulnerability,
  AuthenticationMethod,
  AuditLog
} from '../types/racine-core.types'

interface UseSecurityManagerOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTimeAlerts?: boolean
}

interface SecurityManagerOperations {
  // Encryption operations
  encryptSensitiveData: (data: any) => Promise<any>
  decryptSensitiveData: (encryptedData: any) => Promise<any>
  rotateEncryptionKeys: () => Promise<void>
  
  // Security validation
  validateSecurityCompliance: (policy: SecurityPolicy) => Promise<ValidationResult>
  checkDataSourceSecurity: (dataSourceId: string) => Promise<SecurityValidation>
  performSecurityAudit: (resourceId: string, resourceType: string) => Promise<AuditLog[]>
  
  // Authentication and authorization
  validateCredentials: (credentials: any) => Promise<ValidationResult>
  generateSecureToken: (payload: any, expiresIn?: number) => Promise<string>
  validateToken: (token: string) => Promise<ValidationResult>
  
  // Security policies
  createSecurityPolicy: (policy: Partial<SecurityPolicy>) => Promise<SecurityPolicy>
  updateSecurityPolicy: (policyId: string, updates: Partial<SecurityPolicy>) => Promise<SecurityPolicy>
  getSecurityPolicies: () => Promise<SecurityPolicy[]>
  
  // Vulnerability management
  scanForVulnerabilities: (resourceId: string) => Promise<SecurityVulnerability[]>
  getSecurityRecommendations: (resourceType: string) => Promise<string[]>
  
  // Audit and compliance
  getAuditLogs: (filters?: any) => Promise<AuditLog[]>
  exportAuditReport: (filters?: any) => Promise<Blob>
  
  // Real-time security monitoring
  startSecurityMonitoring: (resourceId: string) => Promise<void>
  stopSecurityMonitoring: (resourceId: string) => Promise<void>
}

export const useSecurityManager = (options: UseSecurityManagerOptions = {}) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [securityAlerts, setSecurityAlerts] = useState<SecurityVulnerability[]>([])

  // Query for security policies
  const {
    data: securityPolicies = [],
    isLoading: policiesLoading,
    refetch: refetchPolicies
  } = useQuery({
    queryKey: ['securityPolicies'],
    queryFn: () => racineOrchestrationAPI.makeRequest('/api/v1/security/policies', { method: 'GET' }),
    enabled: true,
    refetchInterval: options.autoRefresh ? (options.refreshInterval || 60000) : false,
    staleTime: 30000
  })

  // Query for audit logs
  const {
    data: auditLogs = [],
    isLoading: auditLoading,
    refetch: refetchAuditLogs
  } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => racineOrchestrationAPI.makeRequest('/api/v1/security/audit-logs', { method: 'GET' }),
    enabled: true,
    staleTime: 10000
  })

  // Encrypt sensitive data mutation
  const encryptDataMutation = useMutation({
    mutationFn: (data: any) => racineOrchestrationAPI.makeRequest('/api/v1/security/encrypt', {
      method: 'POST',
      data
    }),
    onError: (error: any) => {
      setError(`Encryption failed: ${error.message}`)
    }
  })

  // Security validation mutation
  const validateSecurityMutation = useMutation({
    mutationFn: (policy: SecurityPolicy) => racineOrchestrationAPI.makeRequest('/api/v1/security/validate', {
      method: 'POST',
      data: policy
    }),
    onError: (error: any) => {
      setError(`Security validation failed: ${error.message}`)
    }
  })

  // Security audit mutation
  const performAuditMutation = useMutation({
    mutationFn: ({ resourceId, resourceType }: { resourceId: string; resourceType: string }) =>
      racineOrchestrationAPI.makeRequest('/api/v1/security/audit', {
        method: 'POST',
        data: { resourceId, resourceType }
      }),
    onError: (error: any) => {
      setError(`Security audit failed: ${error.message}`)
    }
  })

  // Vulnerability scan mutation
  const scanVulnerabilitiesMutation = useMutation({
    mutationFn: (resourceId: string) => racineOrchestrationAPI.makeRequest(`/api/v1/security/vulnerabilities/${resourceId}`, {
      method: 'POST'
    }),
    onSuccess: (vulnerabilities) => {
      if (vulnerabilities && vulnerabilities.length > 0) {
        setSecurityAlerts(vulnerabilities)
        
        // Track security event
        crossGroupIntegrationAPI.trackEvent('security_vulnerabilities_detected', {
          resourceId: vulnerabilities[0].resourceId,
          count: vulnerabilities.length,
          severity: vulnerabilities[0].severity
        })
      }
    },
    onError: (error: any) => {
      setError(`Vulnerability scan failed: ${error.message}`)
    }
  })

  // Encrypt sensitive data
  const encryptSensitiveData = useCallback(async (data: any): Promise<any> => {
    try {
      const result = await encryptDataMutation.mutateAsync(data)
      
      // Track encryption event
      crossGroupIntegrationAPI.trackEvent('data_encrypted', {
        dataType: typeof data,
        algorithm: 'AES-256',
        timestamp: Date.now()
      })
      
      return result
    } catch (error) {
      console.error('Error encrypting data:', error)
      throw error
    }
  }, [encryptDataMutation])

  // Decrypt sensitive data
  const decryptSensitiveData = useCallback(async (encryptedData: any): Promise<any> => {
    try {
      const result = await racineOrchestrationAPI.makeRequest('/api/v1/security/decrypt', {
        method: 'POST',
        data: encryptedData
      })
      
      // Track decryption event
      crossGroupIntegrationAPI.trackEvent('data_decrypted', {
        timestamp: Date.now()
      })
      
      return result
    } catch (error) {
      console.error('Error decrypting data:', error)
      throw error
    }
  }, [])

  // Validate security compliance
  const validateSecurityCompliance = useCallback(async (policy: SecurityPolicy): Promise<ValidationResult> => {
    try {
      return await validateSecurityMutation.mutateAsync(policy)
    } catch (error) {
      console.error('Error validating security compliance:', error)
      return {
        isValid: false,
        errors: [`Security validation failed: ${(error as Error).message}`],
        warnings: [],
        suggestions: []
      }
    }
  }, [validateSecurityMutation])

  // Check data source security
  const checkDataSourceSecurity = useCallback(async (dataSourceId: string): Promise<SecurityValidation> => {
    try {
      return await racineOrchestrationAPI.makeRequest(`/api/v1/security/data-sources/${dataSourceId}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('Error checking data source security:', error)
      throw error
    }
  }, [])

  // Perform security audit
  const performSecurityAudit = useCallback(async (resourceId: string, resourceType: string): Promise<AuditLog[]> => {
    try {
      return await performAuditMutation.mutateAsync({ resourceId, resourceType })
    } catch (error) {
      console.error('Error performing security audit:', error)
      throw error
    }
  }, [performAuditMutation])

  // Validate credentials
  const validateCredentials = useCallback(async (credentials: any): Promise<ValidationResult> => {
    try {
      return await racineOrchestrationAPI.makeRequest('/api/v1/security/validate-credentials', {
        method: 'POST',
        data: credentials
      })
    } catch (error) {
      console.error('Error validating credentials:', error)
      return {
        isValid: false,
        errors: [`Credential validation failed: ${(error as Error).message}`],
        warnings: [],
        suggestions: []
      }
    }
  }, [])

  // Generate secure token
  const generateSecureToken = useCallback(async (payload: any, expiresIn: number = 3600): Promise<string> => {
    try {
      const result = await racineOrchestrationAPI.makeRequest('/api/v1/security/generate-token', {
        method: 'POST',
        data: { payload, expiresIn }
      })
      
      // Track token generation
      crossGroupIntegrationAPI.trackEvent('secure_token_generated', {
        payload: Object.keys(payload),
        expiresIn,
        timestamp: Date.now()
      })
      
      return result.token
    } catch (error) {
      console.error('Error generating secure token:', error)
      throw error
    }
  }, [])

  // Validate token
  const validateToken = useCallback(async (token: string): Promise<ValidationResult> => {
    try {
      return await racineOrchestrationAPI.makeRequest('/api/v1/security/validate-token', {
        method: 'POST',
        data: { token }
      })
    } catch (error) {
      console.error('Error validating token:', error)
      return {
        isValid: false,
        errors: [`Token validation failed: ${(error as Error).message}`],
        warnings: [],
        suggestions: []
      }
    }
  }, [])

  // Rotate encryption keys
  const rotateEncryptionKeys = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      await racineOrchestrationAPI.makeRequest('/api/v1/security/rotate-keys', {
        method: 'POST'
      })
      
      // Track key rotation
      crossGroupIntegrationAPI.trackEvent('encryption_keys_rotated', {
        timestamp: Date.now()
      })
      
      // Refresh security policies after key rotation
      queryClient.invalidateQueries({ queryKey: ['securityPolicies'] })
    } catch (error) {
      console.error('Error rotating encryption keys:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [queryClient])

  // Create security policy
  const createSecurityPolicy = useCallback(async (policy: Partial<SecurityPolicy>): Promise<SecurityPolicy> => {
    try {
      const result = await racineOrchestrationAPI.makeRequest('/api/v1/security/policies', {
        method: 'POST',
        data: policy
      })
      
      queryClient.invalidateQueries({ queryKey: ['securityPolicies'] })
      
      // Track policy creation
      crossGroupIntegrationAPI.trackEvent('security_policy_created', {
        policyId: result.id,
        encryption: policy.encryption,
        accessControl: policy.accessControl
      })
      
      return result
    } catch (error) {
      console.error('Error creating security policy:', error)
      throw error
    }
  }, [queryClient])

  // Update security policy
  const updateSecurityPolicy = useCallback(async (policyId: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy> => {
    try {
      const result = await racineOrchestrationAPI.makeRequest(`/api/v1/security/policies/${policyId}`, {
        method: 'PUT',
        data: updates
      })
      
      queryClient.invalidateQueries({ queryKey: ['securityPolicies'] })
      
      // Track policy update
      crossGroupIntegrationAPI.trackEvent('security_policy_updated', {
        policyId,
        changes: Object.keys(updates)
      })
      
      return result
    } catch (error) {
      console.error('Error updating security policy:', error)
      throw error
    }
  }, [queryClient])

  // Get security policies
  const getSecurityPolicies = useCallback(async (): Promise<SecurityPolicy[]> => {
    try {
      return await racineOrchestrationAPI.makeRequest('/api/v1/security/policies', {
        method: 'GET'
      })
    } catch (error) {
      console.error('Error getting security policies:', error)
      return []
    }
  }, [])

  // Scan for vulnerabilities
  const scanForVulnerabilities = useCallback(async (resourceId: string): Promise<SecurityVulnerability[]> => {
    try {
      return await scanVulnerabilitiesMutation.mutateAsync(resourceId)
    } catch (error) {
      console.error('Error scanning for vulnerabilities:', error)
      return []
    }
  }, [scanVulnerabilitiesMutation])

  // Get security recommendations
  const getSecurityRecommendations = useCallback(async (resourceType: string): Promise<string[]> => {
    try {
      const result = await racineOrchestrationAPI.makeRequest(`/api/v1/security/recommendations/${resourceType}`, {
        method: 'GET'
      })
      return result.recommendations || []
    } catch (error) {
      console.error('Error getting security recommendations:', error)
      return []
    }
  }, [])

  // Get audit logs
  const getAuditLogs = useCallback(async (filters?: any): Promise<AuditLog[]> => {
    try {
      return await racineOrchestrationAPI.makeRequest('/api/v1/security/audit-logs', {
        method: 'GET',
        params: filters
      })
    } catch (error) {
      console.error('Error getting audit logs:', error)
      return []
    }
  }, [])

  // Export audit report
  const exportAuditReport = useCallback(async (filters?: any): Promise<Blob> => {
    try {
      const response = await racineOrchestrationAPI.makeRequest('/api/v1/security/audit-report/export', {
        method: 'POST',
        data: filters,
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('Error exporting audit report:', error)
      throw error
    }
  }, [])

  // Start real-time security monitoring
  const startSecurityMonitoring = useCallback(async (resourceId: string): Promise<void> => {
    try {
      await racineOrchestrationAPI.makeRequest(`/api/v1/security/monitoring/${resourceId}/start`, {
        method: 'POST'
      })
      
      // Track monitoring start
      crossGroupIntegrationAPI.trackEvent('security_monitoring_started', {
        resourceId,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Error starting security monitoring:', error)
      throw error
    }
  }, [])

  // Stop real-time security monitoring
  const stopSecurityMonitoring = useCallback(async (resourceId: string): Promise<void> => {
    try {
      await racineOrchestrationAPI.makeRequest(`/api/v1/security/monitoring/${resourceId}/stop`, {
        method: 'POST'
      })
      
      // Track monitoring stop
      crossGroupIntegrationAPI.trackEvent('security_monitoring_stopped', {
        resourceId,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Error stopping security monitoring:', error)
      throw error
    }
  }, [])

  // Security manager operations object
  const operations: SecurityManagerOperations = useMemo(() => ({
    // Encryption operations
    encryptSensitiveData,
    decryptSensitiveData,
    rotateEncryptionKeys,
    
    // Security validation
    validateSecurityCompliance,
    checkDataSourceSecurity,
    performSecurityAudit,
    
    // Authentication and authorization
    validateCredentials,
    generateSecureToken,
    validateToken,
    
    // Security policies
    createSecurityPolicy,
    updateSecurityPolicy,
    getSecurityPolicies,
    
    // Vulnerability management
    scanForVulnerabilities,
    getSecurityRecommendations,
    
    // Audit and compliance
    getAuditLogs,
    exportAuditReport,
    
    // Real-time security monitoring
    startSecurityMonitoring,
    stopSecurityMonitoring
  }), [
    encryptSensitiveData,
    decryptSensitiveData,
    rotateEncryptionKeys,
    validateSecurityCompliance,
    checkDataSourceSecurity,
    performSecurityAudit,
    validateCredentials,
    generateSecureToken,
    validateToken,
    createSecurityPolicy,
    updateSecurityPolicy,
    getSecurityPolicies,
    scanForVulnerabilities,
    getSecurityRecommendations,
    getAuditLogs,
    exportAuditReport,
    startSecurityMonitoring,
    stopSecurityMonitoring
  ])

  // Clear error when operations succeed
  useEffect(() => {
    if (
      encryptDataMutation.isSuccess || 
      validateSecurityMutation.isSuccess || 
      performAuditMutation.isSuccess ||
      scanVulnerabilitiesMutation.isSuccess
    ) {
      setError(null)
    }
  }, [
    encryptDataMutation.isSuccess,
    validateSecurityMutation.isSuccess,
    performAuditMutation.isSuccess,
    scanVulnerabilitiesMutation.isSuccess
  ])

  return {
    // Data
    securityPolicies,
    auditLogs,
    securityAlerts,
    
    // Loading states
    loading: loading || policiesLoading || auditLoading,
    isEncrypting: encryptDataMutation.isPending,
    isValidating: validateSecurityMutation.isPending,
    isAuditing: performAuditMutation.isPending,
    isScanning: scanVulnerabilitiesMutation.isPending,
    
    // Error states
    error,
    
    // Operations
    ...operations,
    
    // Utility functions
    refetchPolicies,
    refetchAuditLogs,
    clearError: () => setError(null),
    clearAlerts: () => setSecurityAlerts([])
  }
}

export default useSecurityManager