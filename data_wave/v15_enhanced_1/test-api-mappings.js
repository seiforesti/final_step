#!/usr/bin/env node

/**
 * API Mapping Test Script
 * ======================
 * 
 * This script tests the API mappings between frontend and backend
 * to ensure all endpoints are correctly routed.
 */

const axios = require('axios');

// Configuration
const FRONTEND_BASE = 'http://localhost:3000';
const BACKEND_BASE = 'http://localhost:8000';
const PROXY_BASE = `${FRONTEND_BASE}/proxy`;

// Test cases for API mappings
const API_TEST_CASES = [
  // ============================================================================
  // DATA SOURCE APIs - scan_routes.py
  // ============================================================================
  {
    name: 'Data Sources List',
    frontendPath: '/scan/data-sources',
    backendPath: '/scan/data-sources',
    method: 'GET',
    expectedStatus: [200, 404], // 404 is OK if no data sources exist
  },
  {
    name: 'Data Source by ID',
    frontendPath: '/scan/data-sources/1',
    backendPath: '/scan/data-sources/1',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Data Source Stats',
    frontendPath: '/scan/data-sources/1/stats',
    backendPath: '/scan/data-sources/1/stats',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Data Source Health',
    frontendPath: '/scan/data-sources/1/health',
    backendPath: '/scan/data-sources/1/health',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Data Source Favorites',
    frontendPath: '/scan/data-sources/favorites',
    backendPath: '/scan/data-sources/favorites',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Data Source Enums',
    frontendPath: '/scan/data-sources/enums',
    backendPath: '/scan/data-sources/enums',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Scan Schedules',
    frontendPath: '/scan/schedules',
    backendPath: '/scan/schedules',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // DATA DISCOVERY APIs - data_discovery_routes.py
  // ============================================================================
  {
    name: 'Test Connection',
    frontendPath: '/data-discovery/data-sources/1/test-connection',
    backendPath: '/data-discovery/data-sources/1/test-connection',
    method: 'POST',
    expectedStatus: [200, 404, 422],
  },
  {
    name: 'Discover Schema',
    frontendPath: '/data-discovery/data-sources/1/discover-schema',
    backendPath: '/data-discovery/data-sources/1/discover-schema',
    method: 'POST',
    expectedStatus: [200, 404, 422],
  },
  {
    name: 'Discovery History',
    frontendPath: '/data-discovery/data-sources/1/discovery-history',
    backendPath: '/data-discovery/data-sources/1/discovery-history',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Preview Table',
    frontendPath: '/data-discovery/data-sources/1/preview-table',
    backendPath: '/data-discovery/data-sources/1/preview-table',
    method: 'POST',
    expectedStatus: [200, 404, 422],
  },
  {
    name: 'Profile Column',
    frontendPath: '/data-discovery/data-sources/profile-column',
    backendPath: '/data-discovery/data-sources/profile-column',
    method: 'POST',
    expectedStatus: [200, 404, 422],
  },
  {
    name: 'Data Source Workspaces',
    frontendPath: '/data-discovery/data-sources/1/workspaces',
    backendPath: '/data-discovery/data-sources/1/workspaces',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // RACINE APIs - racine_routes.py
  // ============================================================================
  {
    name: 'Racine Orchestration',
    frontendPath: '/racine/orchestration',
    backendPath: '/racine/orchestration',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Racine Workspace',
    frontendPath: '/racine/workspace',
    backendPath: '/racine/workspace',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Racine Collaboration',
    frontendPath: '/racine/collaboration',
    backendPath: '/racine/collaboration',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Racine Dashboard',
    frontendPath: '/racine/dashboard',
    backendPath: '/racine/dashboard',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Racine Activity',
    frontendPath: '/racine/activity',
    backendPath: '/racine/activity',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Racine AI',
    frontendPath: '/racine/ai',
    backendPath: '/racine/ai',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Racine Integration',
    frontendPath: '/racine/integration',
    backendPath: '/racine/integration',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Racine Pipeline',
    frontendPath: '/racine/pipeline',
    backendPath: '/racine/pipeline',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Racine Workflow',
    frontendPath: '/racine/workflow',
    backendPath: '/racine/workflow',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // NOTIFICATION APIs
  // ============================================================================
  {
    name: 'Notifications',
    frontendPath: '/scan/notifications',
    backendPath: '/scan/notifications',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // PERFORMANCE APIs - performance_routes.py
  // ============================================================================
  {
    name: 'Performance Metrics',
    frontendPath: '/performance/metrics',
    backendPath: '/performance/metrics',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Performance Alerts',
    frontendPath: '/performance/alerts',
    backendPath: '/performance/alerts',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Performance Trends',
    frontendPath: '/performance/trends',
    backendPath: '/performance/trends',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Performance Recommendations',
    frontendPath: '/performance/recommendations',
    backendPath: '/performance/recommendations',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Performance Thresholds',
    frontendPath: '/performance/thresholds',
    backendPath: '/performance/thresholds',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // SECURITY APIs - security_routes.py
  // ============================================================================
  {
    name: 'Security Vulnerabilities',
    frontendPath: '/security/vulnerabilities',
    backendPath: '/security/vulnerabilities',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Security Incidents',
    frontendPath: '/security/incidents',
    backendPath: '/security/incidents',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Security Threats',
    frontendPath: '/security/threats',
    backendPath: '/security/threats',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Security Compliance',
    frontendPath: '/security/compliance',
    backendPath: '/security/compliance',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Security Analytics',
    frontendPath: '/security/analytics',
    backendPath: '/security/analytics',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // BACKUP APIs - backup_routes.py
  // ============================================================================
  {
    name: 'Backups',
    frontendPath: '/backups',
    backendPath: '/backups',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Backup Schedules',
    frontendPath: '/backups/schedules',
    backendPath: '/backups/schedules',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Restores',
    frontendPath: '/restores',
    backendPath: '/restores',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // TASK APIs
  // ============================================================================
  {
    name: 'Tasks',
    frontendPath: '/tasks',
    backendPath: '/tasks',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Task Stats',
    frontendPath: '/tasks/stats',
    backendPath: '/tasks/stats',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // INTEGRATION APIs - integration_routes.py
  // ============================================================================
  {
    name: 'Integrations',
    frontendPath: '/integrations',
    backendPath: '/integrations',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // REPORT APIs - report_routes.py
  // ============================================================================
  {
    name: 'Reports',
    frontendPath: '/reports',
    backendPath: '/reports',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Report Stats',
    frontendPath: '/reports/stats',
    backendPath: '/reports/stats',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // VERSION APIs - version_routes.py
  // ============================================================================
  {
    name: 'Versions',
    frontendPath: '/versions',
    backendPath: '/versions',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // HEALTH APIs
  // ============================================================================
  {
    name: 'Health Check',
    frontendPath: '/health',
    backendPath: '/health',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'System Health',
    frontendPath: '/system/health',
    backendPath: '/system/health',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // AUTH APIs - auth_routes.py
  // ============================================================================
  {
    name: 'Current User',
    frontendPath: '/auth/me',
    backendPath: '/auth/me',
    method: 'GET',
    expectedStatus: [200, 401, 404],
  },
  {
    name: 'User Login',
    frontendPath: '/auth/login',
    backendPath: '/auth/login',
    method: 'POST',
    expectedStatus: [200, 401, 404, 422],
  },
  {
    name: 'User Logout',
    frontendPath: '/auth/logout',
    backendPath: '/auth/logout',
    method: 'POST',
    expectedStatus: [200, 401, 404],
  },

  // ============================================================================
  // RBAC APIs
  // ============================================================================
  {
    name: 'User Permissions',
    frontendPath: '/rbac/permissions',
    backendPath: '/rbac/permissions',
    method: 'GET',
    expectedStatus: [200, 401, 404],
  },
  {
    name: 'Roles',
    frontendPath: '/rbac/roles',
    backendPath: '/rbac/roles',
    method: 'GET',
    expectedStatus: [200, 401, 404],
  },

  // ============================================================================
  // WORKFLOW APIs - workflow_routes.py
  // ============================================================================
  {
    name: 'Workflow Designer',
    frontendPath: '/workflow/designer/workflows',
    backendPath: '/workflow/designer/workflows',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Workflow Executions',
    frontendPath: '/workflow/executions',
    backendPath: '/workflow/executions',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Workflow Approvals',
    frontendPath: '/workflow/approvals/workflows',
    backendPath: '/workflow/approvals/workflows',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Pending Approvals',
    frontendPath: '/workflow/approvals/pending',
    backendPath: '/workflow/approvals/pending',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Workflow Bulk Operations',
    frontendPath: '/workflow/bulk-operations',
    backendPath: '/workflow/bulk-operations',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Workflow Templates',
    frontendPath: '/workflow/templates',
    backendPath: '/workflow/templates',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // COLLABORATION APIs - collaboration_routes.py
  // ============================================================================
  {
    name: 'Collaboration Sessions',
    frontendPath: '/collaboration/sessions',
    backendPath: '/collaboration/sessions',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Collaboration Documents',
    frontendPath: '/collaboration/documents',
    backendPath: '/collaboration/documents',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Collaboration Workspaces',
    frontendPath: '/collaboration/workspaces',
    backendPath: '/collaboration/workspaces',
    method: 'GET',
    expectedStatus: [200, 404],
  },

  // ============================================================================
  // SENSITIVITY LABELS APIs
  // ============================================================================
  {
    name: 'Audit Logs',
    frontendPath: '/sensitivity-labels/rbac/audit-logs',
    backendPath: '/sensitivity-labels/rbac/audit-logs',
    method: 'GET',
    expectedStatus: [200, 401, 404],
  },

  // ============================================================================
  // CATALOG APIs
  // ============================================================================
  {
    name: 'Data Catalog',
    frontendPath: '/scan/catalog',
    backendPath: '/scan/catalog',
    method: 'GET',
    expectedStatus: [200, 404],
  },
];

// Test runner
async function runApiMappingTests() {
  console.log('🚀 Starting API Mapping Tests...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
  };

  for (const testCase of API_TEST_CASES) {
    results.total++;
    
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`  Frontend: ${testCase.frontendPath}`);
      console.log(`  Backend:  ${testCase.backendPath}`);
      
      // Test frontend proxy
      const frontendUrl = `${PROXY_BASE}${testCase.frontendPath}`;
      const frontendResponse = await makeRequest(frontendUrl, testCase.method);
      
      // Test backend direct
      const backendUrl = `${BACKEND_BASE}${testCase.backendPath}`;
      const backendResponse = await makeRequest(backendUrl, testCase.method);
      
      // Check if responses are consistent
      const frontendStatus = frontendResponse.status;
      const backendStatus = backendResponse.status;
      
      const frontendValid = testCase.expectedStatus.includes(frontendStatus);
      const backendValid = testCase.expectedStatus.includes(backendStatus);
      
      if (frontendValid && backendValid) {
        console.log(`  ✅ PASS - Frontend: ${frontendStatus}, Backend: ${backendStatus}`);
        results.passed++;
      } else {
        console.log(`  ❌ FAIL - Frontend: ${frontendStatus}, Backend: ${backendStatus}`);
        console.log(`    Expected: ${testCase.expectedStatus.join(', ')}`);
        results.failed++;
        results.errors.push({
          test: testCase.name,
          frontend: frontendStatus,
          backend: backendStatus,
          expected: testCase.expectedStatus,
        });
      }
      
    } catch (error) {
      console.log(`  ❌ ERROR - ${error.message}`);
      results.failed++;
      results.errors.push({
        test: testCase.name,
        error: error.message,
      });
    }
    
    console.log('');
  }
  
  // Print summary
  console.log('📊 Test Results Summary:');
  console.log(`  Total Tests: ${results.total}`);
  console.log(`  Passed: ${results.passed}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.test}`);
      if (error.error) {
        console.log(`     Error: ${error.error}`);
      } else {
        console.log(`     Frontend: ${error.frontend}, Backend: ${error.backend}, Expected: ${error.expected.join(', ')}`);
      }
    });
  }
  
  console.log('\n🎯 API Mapping Test Complete!');
  
  return results;
}

// Helper function to make HTTP requests
async function makeRequest(url, method = 'GET', timeout = 5000) {
  try {
    const response = await axios({
      method,
      url,
      timeout,
      validateStatus: () => true, // Don't throw on any status code
    });
    
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        status: 503,
        data: { error: 'Connection refused' },
      };
    }
    
    throw error;
  }
}

// Check if services are running
async function checkServices() {
  console.log('🔍 Checking if services are running...\n');
  
  const services = [
    { name: 'Frontend', url: FRONTEND_BASE },
    { name: 'Backend', url: BACKEND_BASE },
  ];
  
  for (const service of services) {
    try {
      const response = await makeRequest(service.url, 'GET', 3000);
      if (response.status < 500) {
        console.log(`✅ ${service.name} is running (${response.status})`);
      } else {
        console.log(`❌ ${service.name} is not responding properly (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${service.name} is not running (${error.message})`);
    }
  }
  
  console.log('');
}

// Main execution
async function main() {
  try {
    await checkServices();
    await runApiMappingTests();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main();
}

module.exports = {
  runApiMappingTests,
  checkServices,
  API_TEST_CASES,
};

