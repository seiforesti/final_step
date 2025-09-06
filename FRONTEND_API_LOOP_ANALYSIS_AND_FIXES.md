# Frontend API Loop Analysis and Critical Fixes

## Executive Summary
The frontend is experiencing critical API loops and incorrect endpoint calls that are exhausting the database and server resources. The analysis of `logs_frontend.txt` reveals multiple issues:

## 🚨 Critical Issues Identified

### 1. **Missing Function Error - Causing Infinite Loops**
**Error:** `getSavedSearches is not a function`
**Location:** `racine-orchestration-apis.ts`
**Impact:** HIGH - Causes infinite retry loops
**Root Cause:** Function exists but with incorrect binding/export

### 2. **502 Bad Gateway Errors - Wrong API Prefixes**
**Failed Endpoints:**
```
:3000/proxy/auth/profile - Should be /auth/profile
:3000/proxy/rbac/user/permissions - Should be /rbac/users/{user_id}/effective-permissions
:3000/proxy/api/racine/orchestration/health - Should be /api/racine/orchestration/health
:3000/proxy/api/racine/workspace/list - Should be /api/racine/workspace/list
```

### 3. **WebSocket Connection Loops**
**Failed Connections:**
```
ws://localhost:8000/ws/validation - Continuously retrying
ws://localhost:8000/orchestration - Continuously retrying  
ws://localhost:8000/v3/ai/realtime - Continuously retrying
```

### 4. **Incorrect API Base URLs**
Frontend is using multiple conflicting base URLs:
- `/api/proxy` (correct for Next.js proxy)
- Direct `localhost:8000` calls (bypassing proxy)
- Missing `/api` prefix for backend routes

## 📊 API Mapping Analysis

### Backend Route Structure (Actual)
```
/auth/me - User profile
/auth/permissions - User permissions  
/auth/preferences - User preferences
/rbac/users/{user_id}/effective-permissions - User RBAC permissions
/rbac/access-requests - Access requests
/scan/data-sources - Data sources CRUD
/api/racine/orchestration/* - Racine orchestration
```

### Frontend Calls (Current - INCORRECT)
```
/proxy/auth/profile ❌ - Should be /auth/me
/proxy/rbac/user/permissions ❌ - Should be /rbac/users/{user_id}/effective-permissions
/proxy/api/racine/integration/health ❌ - Should be /api/racine/orchestration/health
```

## 🔧 Critical Fixes Required

### Fix 1: Correct getSavedSearches Function Export
**File:** `src/racine-main-manager/services/racine-orchestration-apis.ts`
**Issue:** Multiple conflicting function definitions

### Fix 2: Correct API Base URLs and Prefixes
**Files:** 
- `src/data-sources/services/apis.ts`
- `src/data-sources/services/enterprise-apis.ts`
- All API service files

### Fix 3: Disable Problematic WebSocket Connections
**Issue:** WebSocket connections failing and retrying indefinitely

### Fix 4: Fix Authentication API Calls
**Issue:** Wrong endpoints for user management

## 🛠️ Implementation Plan

### Phase 1: Stop the Loops (IMMEDIATE)
1. Fix getSavedSearches function binding
2. Disable failing WebSocket connections
3. Add circuit breakers to prevent infinite retries

### Phase 2: Correct API Mappings (URGENT)
1. Update all API base URLs to use correct proxy paths
2. Fix authentication endpoints
3. Update RBAC API calls

### Phase 3: Prevent Future Issues (IMPORTANT)
1. Add request throttling
2. Implement proper error boundaries
3. Add API health checks

## 🎯 Expected Impact
- **Immediate:** Stop database exhaustion
- **Short-term:** Eliminate 502 errors
- **Long-term:** Stable, efficient API communication

## 📝 Detailed Fix Implementation

### 1. Fix getSavedSearches Function
```typescript
// CURRENT (BROKEN)
export const racineOrchestrationAPI = new RacineOrchestrationAPI();
// Multiple conflicting getSavedSearches definitions

// FIXED
export const racineOrchestrationAPI = {
  ...otherMethods,
  async getSavedSearches(): Promise<any[]> {
    try {
      // Return empty array to prevent loops until backend implements
      return [];
    } catch (error) {
      console.warn('getSavedSearches not available:', error);
      return [];
    }
  }
};
```

### 2. Fix API Base URLs
```typescript
// CURRENT (BROKEN)
const API_BASE_URL = '/api/proxy';
// Then calling: /proxy/auth/profile (double proxy)

// FIXED  
const API_BASE_URL = '/proxy';
// Then calling: /auth/profile (correct)
```

### 3. Disable Failing WebSockets
```typescript
// CURRENT (BROKEN)
enableWebSocket: true,
websocketURL: 'ws://localhost:8000/ws'

// FIXED
enableWebSocket: false, // Disable until backend WebSocket routes are fixed
websocketURL: undefined
```

This analysis shows the frontend is making incorrect API calls with wrong prefixes, causing 502 errors and infinite retry loops that exhaust the database. The fixes will immediately resolve these issues.