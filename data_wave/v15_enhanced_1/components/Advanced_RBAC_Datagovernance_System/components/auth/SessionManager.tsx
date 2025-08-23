'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ClockIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, GlobeAltIcon, ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon, XMarkIcon, ArrowPathIcon, PowerIcon, EyeIcon, MapPinIcon, CalendarIcon, UserIcon, LockClosedIcon, SignalIcon, BoltIcon, CpuChipIcon, WifiIcon, DeviceTabletIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/auth.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { formatDate, formatDuration, formatRelativeTime } from '../../utils/format.utils';
import { generateSecureRandom, detectSuspiciousActivity, logSecurityEvent } from '../../utils/security.utils';
import { logRbacAction } from '../../utils/rbac.utils';
import type { 
  Session, 
  User, 
  SessionSecurity,
  SessionActivity,
  SessionDevice,
  SessionLocation,
  SecurityAlert
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface SessionManagerState {
  currentSession: Session | null;
  allSessions: Session[];
  sessionHistory: SessionActivity[];
  securityAlerts: SecurityAlert[];
  deviceInfo: SessionDevice[];
  locationHistory: SessionLocation[];
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
  sessionTimeout: number;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  uniqueDevices: number;
  uniqueLocations: number;
  securityIncidents: number;
  lastLogin: Date | null;
  sessionHealth: number;
}

interface SessionAction {
  type: 'extend' | 'terminate' | 'terminate_all' | 'refresh' | 'security_check';
  sessionId?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// ADVANCED SESSION MANAGER COMPONENT
// ============================================================================

export const SessionManager: React.FC = () => {
  // State Management
  const [state, setState] = useState<SessionManagerState>({
    currentSession: null,
    allSessions: [],
    sessionHistory: [],
    securityAlerts: [],
    deviceInfo: [],
    locationHistory: [],
    isLoading: true,
    error: null,
    lastActivity: null,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    securityLevel: 'medium'
  });

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showSecurityAlerts, setShowSecurityAlerts] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Hooks
  const { currentUser, permissions } = useCurrentUser();
  const { connected: wsConnected, lastMessage } = useRBACWebSocket();
  const controls = useAnimation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityRef = useRef<Date>(new Date());

  // ============================================================================
  // DATA FETCHING & MANAGEMENT
  // ============================================================================

  const fetchSessionData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch current session
      const currentSessionResponse = await authService.getCurrentSession();
      
      // Fetch all user sessions
      const allSessionsResponse = await authService.getUserSessions(currentUser.id);
      
      // Fetch session history
      const historyResponse = await authService.getSessionHistory(currentUser.id, {
        limit: 50,
        include_terminated: true
      });

      // Fetch security alerts
      const alertsResponse = await authService.getSecurityAlerts(currentUser.id, {
        severity: ['medium', 'high', 'critical'],
        limit: 20
      });

      // Fetch device information
      const devicesResponse = await authService.getUserDevices(currentUser.id);

      // Calculate metrics
      const metrics = calculateSessionMetrics(
        allSessionsResponse.data,
        historyResponse.data
      );

      setState(prev => ({
        ...prev,
        currentSession: currentSessionResponse.data,
        allSessions: allSessionsResponse.data,
        sessionHistory: historyResponse.data,
        securityAlerts: alertsResponse.data,
        deviceInfo: devicesResponse.data,
        isLoading: false,
        lastActivity: new Date()
      }));

      setSessionMetrics(metrics);

      // Update security level based on alerts
      const criticalAlerts = alertsResponse.data.filter(alert => alert.severity === 'critical');
      const highAlerts = alertsResponse.data.filter(alert => alert.severity === 'high');
      
      let securityLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (criticalAlerts.length > 0) securityLevel = 'critical';
      else if (highAlerts.length > 0) securityLevel = 'high';
      else if (alertsResponse.data.length > 0) securityLevel = 'medium';

      setState(prev => ({ ...prev, securityLevel }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch session data',
        isLoading: false
      }));
    }
  }, [currentUser]);

  const calculateSessionMetrics = useCallback((
    sessions: Session[],
    history: SessionActivity[]
  ): SessionMetrics => {
    const activeSessions = sessions.filter(s => s.is_active).length;
    const totalDuration = history.reduce((sum, activity) => {
      if (activity.ended_at && activity.created_at) {
        return sum + (new Date(activity.ended_at).getTime() - new Date(activity.created_at).getTime());
      }
      return sum;
    }, 0);

    const uniqueDevices = new Set(sessions.map(s => s.device_fingerprint)).size;
    const uniqueLocations = new Set(sessions.map(s => s.ip_address)).size;
    const securityIncidents = state.securityAlerts.filter(a => 
      a.severity === 'high' || a.severity === 'critical'
    ).length;

    const lastLogin = sessions.length > 0 
      ? new Date(Math.max(...sessions.map(s => new Date(s.created_at).getTime())))
      : null;

    // Calculate session health score (0-100)
    let healthScore = 100;
    healthScore -= securityIncidents * 10; // -10 per incident
    healthScore -= Math.max(0, (activeSessions - 3) * 5); // -5 per session over 3
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      totalSessions: sessions.length,
      activeSessions,
      averageSessionDuration: history.length > 0 ? totalDuration / history.length : 0,
      uniqueDevices,
      uniqueLocations,
      securityIncidents,
      lastLogin,
      sessionHealth: healthScore
    };
  }, [state.securityAlerts]);

  // ============================================================================
  // SESSION ACTIONS
  // ============================================================================

  const executeSessionAction = useCallback(async (action: SessionAction) => {
    if (!currentUser) return;

    setActionInProgress(action.sessionId || action.type);

    try {
      let result;
      const correlationId = generateSecureRandom(16);

      switch (action.type) {
        case 'extend':
          if (action.sessionId) {
            result = await authService.extendSession(action.sessionId);
            await logRbacAction('extend_session', currentUser.email, {
              resource_type: 'session',
              resource_id: action.sessionId,
              status: 'success',
              correlation_id: correlationId
            });
          }
          break;

        case 'terminate':
          if (action.sessionId) {
            result = await authService.terminateSession(action.sessionId);
            await logRbacAction('terminate_session', currentUser.email, {
              resource_type: 'session',
              resource_id: action.sessionId,
              status: 'success',
              note: action.reason,
              correlation_id: correlationId
            });
          }
          break;

        case 'terminate_all':
          result = await authService.terminateAllSessions(currentUser.id, {
            exclude_current: true,
            reason: action.reason
          });
          await logRbacAction('terminate_all_sessions', currentUser.email, {
            resource_type: 'session',
            status: 'success',
            note: action.reason,
            correlation_id: correlationId
          });
          break;

        case 'refresh':
          result = await authService.refreshSession();
          break;

        case 'security_check':
          result = await authService.performSecurityCheck(currentUser.id);
          await logSecurityEvent('security_check_performed', currentUser.id, {
            correlation_id: correlationId,
            metadata: action.metadata
          });
          break;
      }

      // Refresh data after action
      await fetchSessionData();

      return result;

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || `Failed to ${action.type} session`
      }));
      throw error;
    } finally {
      setActionInProgress(null);
    }
  }, [currentUser, fetchSessionData]);

  // ============================================================================
  // SECURITY MONITORING
  // ============================================================================

  const checkSuspiciousActivity = useCallback(async () => {
    if (!currentUser || !state.currentSession) return;

    try {
      const suspiciousActivities = await detectSuspiciousActivity({
        userId: currentUser.id,
        sessionId: state.currentSession.id,
        timeWindow: 3600000, // 1 hour
        thresholds: {
          maxFailedLogins: 5,
          maxLocationChanges: 3,
          maxDeviceChanges: 2,
          unusualTimeAccess: true
        }
      });

      if (suspiciousActivities.length > 0) {
        await logSecurityEvent('suspicious_activity_detected', currentUser.id, {
          activities: suspiciousActivities,
          session_id: state.currentSession.id
        });

        // Update security alerts
        setState(prev => ({
          ...prev,
          securityAlerts: [
            ...prev.securityAlerts,
            ...suspiciousActivities.map(activity => ({
              id: generateSecureRandom(8),
              type: 'suspicious_activity',
              severity: activity.riskLevel as 'low' | 'medium' | 'high' | 'critical',
              message: activity.description,
              timestamp: new Date(),
              metadata: activity
            }))
          ]
        }));
      }
    } catch (error) {
      console.error('Failed to check suspicious activity:', error);
    }
  }, [currentUser, state.currentSession]);

  // ============================================================================
  // EFFECTS & LIFECYCLE
  // ============================================================================

  useEffect(() => {
    if (currentUser) {
      fetchSessionData();
    }
  }, [currentUser, fetchSessionData]);

  useEffect(() => {
    if (autoRefresh && !state.isLoading) {
      intervalRef.current = setInterval(() => {
        fetchSessionData();
        checkSuspiciousActivity();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchSessionData, checkSuspiciousActivity, state.isLoading]);

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage && currentUser) {
      const message = JSON.parse(lastMessage.data);
      
      if (message.type === 'session_terminated' && message.userId === currentUser.id) {
        fetchSessionData();
      } else if (message.type === 'security_alert' && message.userId === currentUser.id) {
        setState(prev => ({
          ...prev,
          securityAlerts: [message.alert, ...prev.securityAlerts]
        }));
      }
    }
  }, [lastMessage, currentUser, fetchSessionData]);

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => {
      activityRef.current = new Date();
      setState(prev => ({ ...prev, lastActivity: new Date() }));
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
      case 'phone':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'tablet':
        return <DeviceTabletIcon className="h-5 w-5" />;
      case 'desktop':
      case 'computer':
        return <ComputerDesktopIcon className="h-5 w-5" />;
      default:
        return <GlobeAltIcon className="h-5 w-5" />;
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSessionStatus = (session: Session) => {
    if (!session.is_active) return { text: 'Terminated', color: 'red' };
    
    const now = new Date();
    const lastActivity = new Date(session.last_activity_at);
    const timeDiff = now.getTime() - lastActivity.getTime();
    
    if (timeDiff > state.sessionTimeout) {
      return { text: 'Expired', color: 'orange' };
    } else if (timeDiff > state.sessionTimeout * 0.8) {
      return { text: 'Expiring Soon', color: 'yellow' };
    } else {
      return { text: 'Active', color: 'green' };
    }
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderSessionMetrics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Sessions</p>
            <p className="text-3xl font-bold text-gray-900">
              {sessionMetrics?.activeSessions || 0}
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <SignalIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">
            of {sessionMetrics?.totalSessions || 0} total
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Security Health</p>
            <p className="text-3xl font-bold text-gray-900">
              {sessionMetrics?.sessionHealth || 0}%
            </p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium ${
            (sessionMetrics?.sessionHealth || 0) >= 80 ? 'text-green-600' :
            (sessionMetrics?.sessionHealth || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {(sessionMetrics?.sessionHealth || 0) >= 80 ? 'Excellent' :
             (sessionMetrics?.sessionHealth || 0) >= 60 ? 'Good' : 'Needs Attention'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Unique Devices</p>
            <p className="text-3xl font-bold text-gray-900">
              {sessionMetrics?.uniqueDevices || 0}
            </p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <CpuChipIcon className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">
            {sessionMetrics?.uniqueLocations || 0} locations
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Last Activity</p>
            <p className="text-lg font-semibold text-gray-900">
              {state.lastActivity ? formatRelativeTime(state.lastActivity) : 'Never'}
            </p>
          </div>
          <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            wsConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-gray-500">
            {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const renderCurrentSession = () => {
    if (!state.currentSession) return null;

    const status = getSessionStatus(state.currentSession);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Current Session</h3>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
              status.color === 'green' ? 'text-green-700 bg-green-100 border-green-200' :
              status.color === 'yellow' ? 'text-yellow-700 bg-yellow-100 border-yellow-200' :
              status.color === 'orange' ? 'text-orange-700 bg-orange-100 border-orange-200' :
              'text-red-700 bg-red-100 border-red-200'
            }`}>
              {status.text}
            </div>
            <button
              onClick={() => executeSessionAction({ type: 'refresh' })}
              disabled={actionInProgress === 'refresh'}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 ${
                actionInProgress === 'refresh' ? 'animate-spin' : ''
              }`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {getDeviceIcon(state.currentSession.device_type || 'desktop')}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {state.currentSession.device_type || 'Unknown'} Device
                </p>
                <p className="text-xs text-gray-500">
                  {state.currentSession.user_agent?.slice(0, 50)}...
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-xs text-gray-500">
                  {state.currentSession.location || state.currentSession.ip_address}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Started</p>
                <p className="text-xs text-gray-500">
                  {formatDate(state.currentSession.created_at, { format: 'medium' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => executeSessionAction({ 
                type: 'extend', 
                sessionId: state.currentSession!.id 
              })}
              disabled={actionInProgress === state.currentSession.id}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <BoltIcon className="h-4 w-4 mr-2" />
              Extend Session
            </button>

            <button
              onClick={() => executeSessionAction({ type: 'security_check' })}
              disabled={actionInProgress === 'security_check'}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Security Check
            </button>
          </div>

          <button
            onClick={() => executeSessionAction({ 
              type: 'terminate_all',
              reason: 'User requested termination of all other sessions'
            })}
            disabled={actionInProgress === 'terminate_all'}
            className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <PowerIcon className="h-4 w-4 mr-2" />
            End All Other Sessions
          </button>
        </div>
      </motion.div>
    );
  };

  const renderAllSessions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">All Sessions</h3>
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Auto-refresh</span>
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value={15000}>15s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {state.allSessions.map((session) => {
          const status = getSessionStatus(session);
          const isCurrent = session.id === state.currentSession?.id;

          return (
            <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getDeviceIcon(session.device_type || 'desktop')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.device_type || 'Unknown Device'}
                      </p>
                      {isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Current
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {status.text}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {session.location || session.ip_address}
                      </span>
                      <span className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Started {formatRelativeTime(session.created_at)}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Last active {formatRelativeTime(session.last_activity_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      setShowSessionDetails(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  
                  {!isCurrent && session.is_active && (
                    <button
                      onClick={() => executeSessionAction({ 
                        type: 'terminate', 
                        sessionId: session.id,
                        reason: 'Manually terminated by user'
                      })}
                      disabled={actionInProgress === session.id}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderSecurityAlerts = () => {
    if (state.securityAlerts.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
              getSecurityLevelColor(state.securityLevel)
            }`}>
              {state.securityLevel.charAt(0).toUpperCase() + state.securityLevel.slice(1)} Risk
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {state.securityAlerts.slice(0, 10).map((alert) => (
            <div key={alert.id} className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  alert.severity === 'critical' ? 'bg-red-500' :
                  alert.severity === 'high' ? 'bg-orange-500' :
                  alert.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(alert.timestamp)}
                  </p>
                </div>

                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage your active sessions and security
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
            getSecurityLevelColor(state.securityLevel)
          }`}>
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              Security: {state.securityLevel.charAt(0).toUpperCase() + state.securityLevel.slice(1)}
            </span>
          </div>
          
          <button
            onClick={fetchSessionData}
            disabled={state.isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      {renderSessionMetrics()}

      {/* Current Session */}
      {renderCurrentSession()}

      {/* Security Alerts */}
      {renderSecurityAlerts()}

      {/* All Sessions */}
      {renderAllSessions()}

      {/* Session Details Modal */}
      <AnimatePresence>
        {showSessionDetails && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSessionDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
                  <button
                    onClick={() => setShowSessionDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Session ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedSession.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm text-gray-900">{getSessionStatus(selectedSession).text}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Device</label>
                    <p className="text-sm text-gray-900">{selectedSession.device_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedSession.ip_address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-sm text-gray-900">{selectedSession.location || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Started</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedSession.created_at, { format: 'full' })}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">User Agent</label>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {selectedSession.user_agent}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};