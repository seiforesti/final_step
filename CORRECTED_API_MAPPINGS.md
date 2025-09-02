# Corrected API Mappings - Frontend to Backend

## 🚨 **Problem Identified**

The frontend was calling the wrong backend endpoints, causing 502 errors. The issue was:

- **Frontend calls**: `/scan/data-sources/{id}/...`
- **Backend routes**: `/data-sources/{id}/...`

## ✅ **Corrected API Mappings**

### 1. **Data Source APIs** - Fixed Frontend Calls

| Frontend Function | Before (Wrong) | After (Correct) | Backend Route |
|-------------------|-----------------|-----------------|---------------|
| `getScheduledTasks` | `/scan/data-sources/${id}/scheduled-tasks` | `/data-sources/${id}/scheduled-tasks` | `@router.get("/data-sources/{data_source_id}/scheduled-tasks")` |
| `getSecurityAudit` | `/scan/data-sources/${id}/security-audit` | `/data-sources/${id}/security-audit` | `@router.get("/data-sources/{data_source_id}/security-audit")` |
| `getPerformanceMetrics` | `/scan/data-sources/${id}/performance-metrics` | `/data-sources/${id}/performance-metrics` | `@router.get("/data-sources/{data_source_id}/performance-metrics")` |

### 2. **Proxy Configuration** - Updated Mappings

The proxy now correctly maps:
```typescript
'/api/data-sources/security-audit': ['/data-sources/security-audit', '/scan/data-sources/security-audit', '/api/scan/data-sources/security-audit'],
'/api/data-sources/scheduled-tasks': ['/data-sources/scheduled-tasks', '/scan/data-sources/scheduled-tasks', '/api/scan/data-sources/scheduled-tasks'],
'/api/data-sources/performance-metrics': ['/data-sources/performance-metrics', '/scan/data-sources/performance-metrics', '/api/scan/data-sources/performance-metrics'],
```

**Priority Order**: 
1. `/data-sources/{id}/...` (correct backend route)
2. `/scan/data-sources/{id}/...` (fallback)
3. `/api/scan/data-sources/{id}/...` (legacy)

## 🔧 **Frontend Service Updates Applied**

### 1. **Fixed getScheduledTasks**
```typescript
// BEFORE (Wrong)
const { data } = await enterpriseApi.get(`/scan/data-sources/${data_source_id}/scheduled-tasks`)

// AFTER (Correct)
const { data } = await enterpriseApi.get(`/data-sources/${data_source_id}/scheduled-tasks`)
```

### 2. **Fixed getSecurityAudit**
```typescript
// BEFORE (Wrong)
const { data } = await enterpriseApi.get(`/scan/data-sources/${dataSourceId}/security-audit`)

// AFTER (Correct)
const { data } = await enterpriseApi.get(`/data-sources/${dataSourceId}/security-audit`)
```

### 3. **Fixed getPerformanceMetrics**
```typescript
// BEFORE (Wrong)
const { data } = await enterpriseApi.get(`/scan/data-sources/${request.data_source_id}/performance-metrics?${params.toString()}`)

// AFTER (Correct)
const { data } = await enterpriseApi.get(`/data-sources/${request.data_source_id}/performance-metrics?${params.toString()}`)
```

## 📋 **Backend Routes That Actually Exist**

Based on `scan_routes.py`:

| Endpoint | Method | Route | Status |
|----------|--------|-------|---------|
| **Scheduled Tasks** | `GET` | `/data-sources/{data_source_id}/scheduled-tasks` | ✅ Exists |
| **Security Audit** | `GET` | `/data-sources/{data_source_id}/security-audit` | ✅ Exists |
| **Performance Metrics** | `GET` | `/data-sources/{data_source_id}/performance-metrics` | ✅ Exists |
| **Compliance Status** | `GET` | `/data-sources/{data_source_id}/compliance-status` | ✅ Exists |
| **Backup Status** | `GET` | `/data-sources/{data_source_id}/backup-status` | ✅ Exists |
| **Access Control** | `GET` | `/data-sources/{data_source_id}/access-control` | ✅ Exists |

## 🚀 **Expected Results**

After applying these fixes:

1. ✅ **502 errors resolved** - Frontend calls correct backend routes
2. ✅ **API responses working** - Data returned successfully
3. ✅ **Enterprise API Error: {} resolved** - Proper error handling
4. ✅ **Frontend components functional** - Data sources loading correctly

## 🔍 **Why This Happened**

1. **Initial assumption**: Frontend should call `/scan/data-sources/...`
2. **Reality**: Backend routes are `/data-sources/...`
3. **Result**: 502 errors because routes don't exist
4. **Solution**: Align frontend calls with actual backend routes

## 📚 **Files Modified**

1. **`data_wave/v15_enhanced_1/app/api/proxy/[...path]/route.ts`**
   - Updated proxy mappings to prioritize correct backend routes

2. **`data_wave/v15_enhanced_1/components/data-sources/services/enterprise-apis.ts`**
   - Fixed `getScheduledTasks` to call correct endpoint
   - Fixed `getSecurityAudit` to call correct endpoint  
   - Fixed `getPerformanceMetrics` to call correct endpoint

## ✅ **Next Steps**

1. **Test the fixes** - Verify 502 errors are resolved
2. **Monitor API calls** - Ensure correct endpoints are being called
3. **Verify data loading** - Check that frontend components receive data
4. **Update any remaining incorrect calls** - If more 502 errors appear

## 🎯 **Summary**

The root cause was **incorrect API endpoint mapping** between frontend and backend, not missing backend routes or connection pool issues. All required backend endpoints exist and are properly implemented.

**Key Fix**: Changed frontend calls from `/scan/data-sources/{id}/...` to `/data-sources/{id}/...` to match the actual backend route structure.
