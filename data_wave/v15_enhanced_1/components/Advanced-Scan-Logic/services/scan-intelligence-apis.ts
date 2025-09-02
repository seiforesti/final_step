/**
 * 🧠 Scan Intelligence APIs - Advanced Scan Logic
 * ==============================================
 * 
 * Comprehensive API integration for scan intelligence operations
 * Maps to: backend/api/routes/scan_intelligence_routes.py
 * 
 * Features:
 * - Advanced pattern recognition and analysis
 * - AI-powered threat detection and behavioral analysis
 * - Predictive intelligence and anomaly detection
 * - Contextual intelligence and insights generation
 * - Intelligence reporting and metrics
 * - Real-time intelligence processing
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib/api-client';
import {
  ScanIntelligenceInsight,
  PatternRecognitionResult,
  AnomalyDetectionResult,
  PredictiveModel,
  BehavioralAnalysis,
  ThreatDetection,
  ContextualIntelligence,
  IntelligenceReport,
  IntelligenceAnalysisRequest,
  IntelligenceAnalysisResponse,
  IntelligenceMetrics,
  IntelligenceConfiguration,
  IntelligenceInsightType,
  IntelligenceCategory,
  IntelligenceSeverity
} from '../types/intelligence.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/scan-intelligence';

const ENDPOINTS = {
  // Core intelligence operations
  ANALYZE_SCAN_INTELLIGENCE: `${API_BASE}/analyze`,
  GENERATE_INTELLIGENCE_INSIGHTS: `${API_BASE}/insights/generate`,
  DETECT_PATTERNS: `${API_BASE}/patterns/detect`,
  ANALYZE_BEHAVIOR: `${API_BASE}/behavior/analyze`,
  
  // Threat detection and security
  DETECT_THREATS: `${API_BASE}/threats/detect`,
  ANALYZE_SECURITY_PATTERNS: `${API_BASE}/security/patterns`,
  VALIDATE_SECURITY_CONTEXT: `${API_BASE}/security/validate`,
  
  // Predictive analytics
  PREDICT_SCAN_OUTCOMES: `${API_BASE}/predictions/outcomes`,
  FORECAST_TRENDS: `${API_BASE}/predictions/trends`,
  ANALYZE_PREDICTIVE_PATTERNS: `${API_BASE}/predictions/patterns`,
  
  // Anomaly detection
  DETECT_ANOMALIES: `${API_BASE}/anomalies/detect`,
  ANALYZE_ANOMALY_PATTERNS: `${API_BASE}/anomalies/patterns`,
  CLASSIFY_ANOMALIES: `${API_BASE}/anomalies/classify`,
  
  // Contextual intelligence
  ANALYZE_CONTEXT: `${API_BASE}/context/analyze`,
  GENERATE_CONTEXTUAL_INSIGHTS: `${API_BASE}/context/insights`,
  CORRELATE_CONTEXTUAL_DATA: `${API_BASE}/context/correlate`,
  
  // Intelligence reporting
  GENERATE_INTELLIGENCE_REPORTS: `${API_BASE}/reports/generate`,
  GET_INTELLIGENCE_METRICS: `${API_BASE}/metrics`,
  GET_INTELLIGENCE_SUMMARY: `${API_BASE}/summary`,
  
  // Configuration and management
  UPDATE_INTELLIGENCE_CONFIG: `${API_BASE}/configuration/update`,
  GET_INTELLIGENCE_MODELS: `${API_BASE}/models`,
  TRAIN_INTELLIGENCE_MODELS: `${API_BASE}/models/train`,
  VALIDATE_INTELLIGENCE_SETUP: `${API_BASE}/validation/setup`
} as const;

/**
 * Scan Intelligence API Service Class
 * Provides comprehensive integration with scan intelligence backend
 */
export class ScanIntelligenceAPIService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor() {
    this.apiClient = new ApiClient();
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy';
  }

  private getAuthToken(): string {
    // Get auth token from localStorage or context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || '';
    }
    return '';
  }

  // ==================== INTELLIGENCE ANALYSIS ====================

  /**
   * Perform comprehensive intelligence analysis
   * Maps to: POST /api/v1/scan-intelligence/analyze
   * Backend: scan_intelligence_routes.py -> analyze_scan_intelligence
   */
  async performIntelligenceAnalysis(request: IntelligenceAnalysisRequest): Promise<IntelligenceAnalysisResponse> {
    try {
      const response = await this.apiClient.post<IntelligenceAnalysisResponse>(
        ENDPOINTS.ANALYZE_SCAN_INTELLIGENCE,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to perform intelligence analysis: ${error}`);
    }
  }

  /**
   * Get intelligence insights by scan ID
   * Maps to: GET /scan-intelligence/scans/{scan_id}/insights
   * Backend: scan_intelligence_routes.py -> get_scan_insights
   */
  async getScanInsights(scanId: string, category?: IntelligenceCategory): Promise<ScanIntelligenceInsight[]> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }

    const response = await fetch(`${this.baseUrl}/scans/${scanId}/insights?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get scan insights: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get intelligence insight by ID
   * Maps to: GET /scan-intelligence/insights/{insight_id}
   * Backend: scan_intelligence_routes.py -> get_intelligence_insight
   */
  async getIntelligenceInsight(insightId: string): Promise<ScanIntelligenceInsight> {
    const response = await fetch(`${this.baseUrl}/insights/${insightId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get intelligence insight: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update insight status (acknowledge, resolve, etc.)
   * Maps to: PUT /scan-intelligence/insights/{insight_id}/status
   * Backend: scan_intelligence_routes.py -> update_insight_status
   */
  async updateInsightStatus(insightId: string, status: string, comments?: string): Promise<ScanIntelligenceInsight> {
    const response = await fetch(`${this.baseUrl}/insights/${insightId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ status, comments })
    });

    if (!response.ok) {
      throw new Error(`Failed to update insight status: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== PATTERN RECOGNITION ====================

  /**
   * Detect patterns in scan data
   * Maps to: POST /scan-intelligence/pattern-recognition
   * Backend: scan_intelligence_routes.py -> detect_patterns
   */
  async detectPatterns(scanId: string, analysisConfig?: any): Promise<PatternRecognitionResult[]> {
    const response = await fetch(`${this.baseUrl}/pattern-recognition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ scan_id: scanId, config: analysisConfig })
    });

    if (!response.ok) {
      throw new Error(`Failed to detect patterns: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get pattern recognition results
   * Maps to: GET /scan-intelligence/patterns
   * Backend: scan_intelligence_routes.py -> get_pattern_results
   */
  async getPatternResults(scanId?: string, patternType?: string): Promise<PatternRecognitionResult[]> {
    const params = new URLSearchParams();
    if (scanId) params.append('scan_id', scanId);
    if (patternType) params.append('pattern_type', patternType);

    const response = await fetch(`${this.baseUrl}/patterns?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get pattern results: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== ANOMALY DETECTION ====================

  /**
   * Detect anomalies in scan data
   * Maps to: POST /scan-intelligence/anomaly-detection
   * Backend: scan_intelligence_routes.py -> detect_anomalies
   */
  async detectAnomalies(scanId: string, detectionConfig?: any): Promise<AnomalyDetectionResult[]> {
    const response = await fetch(`${this.baseUrl}/anomaly-detection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ scan_id: scanId, config: detectionConfig })
    });

    if (!response.ok) {
      throw new Error(`Failed to detect anomalies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get anomaly detection results
   * Maps to: GET /scan-intelligence/anomalies
   * Backend: scan_intelligence_routes.py -> get_anomaly_results
   */
  async getAnomalyResults(scanId?: string, severity?: string): Promise<AnomalyDetectionResult[]> {
    const params = new URLSearchParams();
    if (scanId) params.append('scan_id', scanId);
    if (severity) params.append('severity', severity);

    const response = await fetch(`${this.baseUrl}/anomalies?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get anomaly results: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  /**
   * Generate predictions based on scan data
   * Maps to: POST /scan-intelligence/predict
   * Backend: scan_intelligence_routes.py -> generate_predictions
   */
  async generatePredictions(request: any): Promise<PredictiveModel[]> {
    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to generate predictions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get predictive models
   * Maps to: GET /scan-intelligence/models
   * Backend: scan_intelligence_routes.py -> get_predictive_models
   */
  async getPredictiveModels(): Promise<PredictiveModel[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get predictive models: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== BEHAVIORAL ANALYSIS ====================

  /**
   * Perform behavioral analysis
   * Maps to: POST /scan-intelligence/behavioral-analysis
   * Backend: scan_intelligence_routes.py -> analyze_behavior
   */
  async analyzeBehavior(entityId: string, entityType: string, analysisConfig?: any): Promise<BehavioralAnalysis> {
    const response = await fetch(`${this.baseUrl}/behavioral-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ entity_id: entityId, entity_type: entityType, config: analysisConfig })
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze behavior: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get behavioral analysis results
   * Maps to: GET /scan-intelligence/behavioral-analysis/{entity_id}
   * Backend: scan_intelligence_routes.py -> get_behavioral_analysis
   */
  async getBehavioralAnalysis(entityId: string): Promise<BehavioralAnalysis> {
    const response = await fetch(`${this.baseUrl}/behavioral-analysis/${entityId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get behavioral analysis: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== THREAT DETECTION ====================

  /**
   * Detect security threats
   * Maps to: POST /scan-intelligence/threat-detection
   * Backend: scan_intelligence_routes.py -> detect_threats
   */
  async detectThreats(scanId: string, threatConfig?: any): Promise<ThreatDetection[]> {
    const response = await fetch(`${this.baseUrl}/threat-detection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ scan_id: scanId, config: threatConfig })
    });

    if (!response.ok) {
      throw new Error(`Failed to detect threats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get threat detection results
   * Maps to: GET /scan-intelligence/threats
   * Backend: scan_intelligence_routes.py -> get_threat_results
   */
  async getThreatResults(scanId?: string, severity?: string): Promise<ThreatDetection[]> {
    const params = new URLSearchParams();
    if (scanId) params.append('scan_id', scanId);
    if (severity) params.append('severity', severity);

    const response = await fetch(`${this.baseUrl}/threats?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get threat results: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== CONTEXTUAL INTELLIGENCE ====================

  /**
   * Generate contextual intelligence
   * Maps to: POST /scan-intelligence/contextual
   * Backend: scan_intelligence_routes.py -> generate_contextual_intelligence
   */
  async generateContextualIntelligence(request: any): Promise<ContextualIntelligence> {
    const response = await fetch(`${this.baseUrl}/contextual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to generate contextual intelligence: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== INTELLIGENCE REPORTS ====================

  /**
   * Generate intelligence report
   * Maps to: POST /scan-intelligence/reports
   * Backend: scan_intelligence_routes.py -> generate_intelligence_report
   */
  async generateIntelligenceReport(reportConfig: any): Promise<IntelligenceReport> {
    const response = await fetch(`${this.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(reportConfig)
    });

    if (!response.ok) {
      throw new Error(`Failed to generate intelligence report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get intelligence reports
   * Maps to: GET /scan-intelligence/reports
   * Backend: scan_intelligence_routes.py -> get_intelligence_reports
   */
  async getIntelligenceReports(reportType?: string): Promise<IntelligenceReport[]> {
    const params = new URLSearchParams();
    if (reportType) params.append('report_type', reportType);

    const response = await fetch(`${this.baseUrl}/reports?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get intelligence reports: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== CONFIGURATION & METRICS ====================

  /**
   * Get intelligence metrics
   * Maps to: GET /scan-intelligence/metrics
   * Backend: scan_intelligence_routes.py -> get_intelligence_metrics
   */
  async getIntelligenceMetrics(timeRange?: { start: string; end: string }): Promise<IntelligenceMetrics> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }

    const response = await fetch(`${this.baseUrl}/metrics?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get intelligence metrics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get intelligence configuration
   * Maps to: GET /scan-intelligence/configuration
   * Backend: scan_intelligence_routes.py -> get_intelligence_configuration
   */
  async getIntelligenceConfiguration(): Promise<IntelligenceConfiguration> {
    const response = await fetch(`${this.baseUrl}/configuration`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get intelligence configuration: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update intelligence configuration
   * Maps to: PUT /scan-intelligence/configuration
   * Backend: scan_intelligence_routes.py -> update_intelligence_configuration
   */
  async updateIntelligenceConfiguration(config: Partial<IntelligenceConfiguration>): Promise<IntelligenceConfiguration> {
    const response = await fetch(`${this.baseUrl}/configuration`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`Failed to update intelligence configuration: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== REAL-TIME INTELLIGENCE ====================

  /**
   * Subscribe to real-time intelligence updates
   * Maps to: WebSocket /scan-intelligence/ws/insights
   */
  subscribeToIntelligenceUpdates(onInsight: (insight: ScanIntelligenceInsight) => void): WebSocket {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/scan-intelligence/ws/insights`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const insight = JSON.parse(event.data);
      onInsight(insight);
    };

    ws.onerror = (error) => {
      console.error('Intelligence WebSocket error:', error);
    };

    return ws;
  }

  /**
   * Subscribe to threat detection alerts
   * Maps to: WebSocket /scan-intelligence/ws/threats
   */
  subscribeToThreatAlerts(onThreat: (threat: ThreatDetection) => void): WebSocket {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/scan-intelligence/ws/threats`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const threat = JSON.parse(event.data);
      onThreat(threat);
    };

    ws.onerror = (error) => {
      console.error('Threat WebSocket error:', error);
    };

    return ws;
  }

  // ==================== UTILITY METHODS ====================

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Provide feedback on intelligence insights
   * Maps to: POST /scan-intelligence/insights/{insight_id}/feedback
   * Backend: scan_intelligence_routes.py -> provide_insight_feedback
   */
  async provideInsightFeedback(insightId: string, feedback: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/insights/${insightId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(feedback)
    });

    if (!response.ok) {
      throw new Error(`Failed to provide insight feedback: ${response.statusText}`);
    }
  }

  /**
   * Get intelligence dashboard data
   * Maps to: GET /scan-intelligence/dashboard
   * Backend: scan_intelligence_routes.py -> get_intelligence_dashboard
   */
  async getIntelligenceDashboard(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get intelligence dashboard: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const scanIntelligenceAPI = new ScanIntelligenceAPIService();
export default scanIntelligenceAPI;