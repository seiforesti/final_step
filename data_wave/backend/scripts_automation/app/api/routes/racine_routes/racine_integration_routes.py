"""
Racine Integration Routes - Cross-Group Integration and System Orchestration
===========================================================================

This module provides comprehensive API routes for cross-group integration and system orchestration
that enables seamless integration between all 7 data governance groups, external system connectivity,
API gateway functionality, data synchronization, event streaming, and comprehensive system monitoring.

Key Features:
- Cross-group resource linking and orchestration
- External system integration and API gateway
- Real-time data synchronization across groups
- Event streaming and pub/sub messaging
- Service discovery and health monitoring
- Integration testing and validation
- Performance monitoring and optimization
- Error handling and retry mechanisms

Integrations:
- Deep integration with all 7 data governance groups
- External API and webhook management
- Message queue and event streaming systems
- Service mesh and load balancing
- Monitoring and alerting systems
- Security and authentication frameworks

Architecture:
- FastAPI router with comprehensive error handling
- Pydantic models for request/response validation
- WebSocket support for real-time integration monitoring
- Integration with RacineIntegrationService
- RBAC-integrated security at all endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, Path, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
from uuid import UUID
import json
import asyncio
from pydantic import field_validator, BaseModel, Field, validator, HttpUrl

# Database and Authentication
from ....database import get_db
from ....auth.dependencies import get_current_user, require_permission
from ....models.auth_models import User

# Racine Services
from ....services.racine_services.racine_orchestration_service import RacineOrchestrationService
from ....services.racine_services.racine_integration_service import RacineIntegrationService

# Racine Models
from ....models.racine_models.racine_integration_models import (
    RacineIntegrationEndpoint,
    RacineIntegrationMapping,
    RacineIntegrationJob,
    RacineIntegrationLog,
    RacineServiceRegistry
)

# Cross-group models for integration
from ....models.scan_models import DataSource
from ....models.compliance_models import ComplianceRule
from ....models.classification_models import ClassificationRule

# Utilities
from ....core.logging_utils import get_logger
from ....core.exceptions import RacineException
from ....core.response_models import StandardResponse

# Initialize logger
logger = get_logger(__name__)

# Initialize router
router = APIRouter(
    prefix="/api/racine/integration",
    tags=["Racine Integration & Orchestration"],
    responses={
        404: {"description": "Integration resource not found"},
        403: {"description": "Insufficient permissions"},
        500: {"description": "Internal server error"}
    }
)

# ========================================================================================
# Pydantic Models for Requests and Responses
# ========================================================================================

class IntegrationEndpointRequest(BaseModel):
    """Request model for creating integration endpoints"""
    name: str = Field(..., min_length=1, max_length=255, description="Endpoint name")
    endpoint_type: str = Field(..., description="Type of integration endpoint")
    url: Optional[HttpUrl] = Field(None, description="Endpoint URL")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Endpoint configuration")
    authentication: Dict[str, Any] = Field(default_factory=dict, description="Authentication settings")
    headers: Dict[str, str] = Field(default_factory=dict, description="Default headers")
    timeout_seconds: int = Field(default=30, ge=1, le=300, description="Request timeout")
    retry_config: Dict[str, Any] = Field(default_factory=dict, description="Retry configuration")
    is_active: bool = Field(default=True, description="Whether endpoint is active")
    
    @field_validator('endpoint_type')
    def validate_endpoint_type(cls, v):
        allowed_types = [
            'rest_api', 'graphql', 'webhook', 'database', 'message_queue',
            'file_system', 'cloud_storage', 'event_stream', 'custom'
        ]
        if v not in allowed_types:
            raise ValueError(f"Endpoint type must be one of: {allowed_types}")
        return v

class IntegrationMappingRequest(BaseModel):
    """Request model for data mapping configuration"""
    mapping_name: str = Field(..., min_length=1, max_length=255, description="Mapping name")
    source_group: str = Field(..., description="Source data group")
    target_group: str = Field(..., description="Target data group")
    source_schema: Dict[str, Any] = Field(..., description="Source data schema")
    target_schema: Dict[str, Any] = Field(..., description="Target data schema")
    transformation_rules: List[Dict[str, Any]] = Field(..., description="Data transformation rules")
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, description="Data validation rules")
    is_bidirectional: bool = Field(default=False, description="Whether mapping is bidirectional")
    
    @field_validator('source_group', 'target_group')
    def validate_groups(cls, v):
        allowed_groups = [
            'data_sources', 'scan_rules', 'classifications',
            'compliance', 'catalog', 'scan_logic', 'rbac',
            'external_system'
        ]
        if v not in allowed_groups:
            raise ValueError(f"Group must be one of: {allowed_groups}")
        return v

class IntegrationJobRequest(BaseModel):
    """Request model for integration jobs"""
    job_name: str = Field(..., min_length=1, max_length=255, description="Job name")
    job_type: str = Field(..., description="Type of integration job")
    source_endpoint_id: str = Field(..., description="Source endpoint ID")
    target_endpoint_id: str = Field(..., description="Target endpoint ID")
    mapping_id: Optional[str] = Field(None, description="Data mapping ID")
    schedule_config: Optional[Dict[str, Any]] = Field(None, description="Scheduling configuration")
    execution_config: Dict[str, Any] = Field(default_factory=dict, description="Execution configuration")
    notification_config: Dict[str, Any] = Field(default_factory=dict, description="Notification settings")
    
    @field_validator('job_type')
    def validate_job_type(cls, v):
        allowed_types = [
            'data_sync', 'event_stream', 'batch_transfer', 'real_time_sync',
            'validation_check', 'health_monitor', 'custom'
        ]
        if v not in allowed_types:
            raise ValueError(f"Job type must be one of: {allowed_types}")
        return v

class CrossGroupSyncRequest(BaseModel):
    """Request model for cross-group synchronization"""
    sync_type: str = Field(..., description="Type of synchronization")
    source_groups: List[str] = Field(..., description="Source groups for sync")
    target_groups: List[str] = Field(..., description="Target groups for sync")
    sync_mode: str = Field(default="incremental", description="Synchronization mode")
    conflict_resolution: str = Field(default="latest_wins", description="Conflict resolution strategy")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Sync filters")
    
    @field_validator('sync_type')
    def validate_sync_type(cls, v):
        allowed_types = [
            'metadata_sync', 'configuration_sync', 'data_sync', 
            'schema_sync', 'permissions_sync', 'full_sync'
        ]
        if v not in allowed_types:
            raise ValueError(f"Sync type must be one of: {allowed_types}")
        return v
    
    @field_validator('sync_mode')
    def validate_sync_mode(cls, v):
        allowed_modes = ['full', 'incremental', 'differential', 'snapshot']
        if v not in allowed_modes:
            raise ValueError(f"Sync mode must be one of: {allowed_modes}")
        return v

class ServiceRegistrationRequest(BaseModel):
    """Request model for service registration"""
    service_name: str = Field(..., min_length=1, max_length=255, description="Service name")
    service_type: str = Field(..., description="Type of service")
    version: str = Field(..., description="Service version")
    endpoints: List[str] = Field(..., description="Service endpoints")
    health_check_url: Optional[str] = Field(None, description="Health check endpoint")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Service metadata")
    dependencies: List[str] = Field(default_factory=list, description="Service dependencies")
    
    @field_validator('service_type')
    def validate_service_type(cls, v):
        allowed_types = [
            'data_service', 'processing_service', 'analytics_service',
            'notification_service', 'integration_service', 'custom_service'
        ]
        if v not in allowed_types:
            raise ValueError(f"Service type must be one of: {allowed_types}")
        return v

# Response Models
class IntegrationEndpointResponse(BaseModel):
    """Response model for integration endpoints"""
    endpoint_id: str
    name: str
    endpoint_type: str
    url: Optional[str]
    status: str
    configuration: Dict[str, Any]
    timeout_seconds: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_health_check: Optional[datetime]
    health_status: str

class IntegrationJobResponse(BaseModel):
    """Response model for integration jobs"""
    job_id: str
    job_name: str
    job_type: str
    status: str
    source_endpoint_id: str
    target_endpoint_id: str
    mapping_id: Optional[str]
    last_execution: Optional[datetime]
    next_execution: Optional[datetime]
    success_rate: float
    total_executions: int
    created_at: datetime

class SyncJobResponse(BaseModel):
    """Response model for synchronization jobs"""
    sync_id: str
    sync_type: str
    source_groups: List[str]
    target_groups: List[str]
    status: str
    progress_percentage: float
    records_processed: int
    records_failed: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]

class ServiceRegistryResponse(BaseModel):
    """Response model for service registry"""
    service_id: str
    service_name: str
    service_type: str
    version: str
    status: str
    endpoints: List[str]
    health_status: str
    last_heartbeat: Optional[datetime]
    metadata: Dict[str, Any]
    dependencies: List[str]

# ========================================================================================
# WebSocket Connection Manager
# ========================================================================================

class IntegrationConnectionManager:
    """Manages WebSocket connections for real-time integration monitoring"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.monitoring_jobs: Dict[str, str] = {}  # connection_id -> job_id
    
    async def connect(self, websocket: WebSocket, user_id: str, job_id: Optional[str] = None):
        """Connect to integration monitoring"""
        await websocket.accept()
        connection_id = f"{user_id}_{datetime.utcnow().timestamp()}"
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        
        if job_id:
            self.monitoring_jobs[connection_id] = job_id
            
        logger.info(f"WebSocket connected for integration monitoring: {user_id}")
        return connection_id
    
    def disconnect(self, websocket: WebSocket, user_id: str, connection_id: str):
        """Disconnect from integration monitoring"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
        
        if connection_id in self.monitoring_jobs:
            del self.monitoring_jobs[connection_id]
            
        logger.info(f"WebSocket disconnected for integration monitoring: {user_id}")
    
    async def broadcast_job_update(self, job_id: str, update: Dict[str, Any]):
        """Broadcast job update to relevant connections"""
        for connection_id, monitored_job_id in self.monitoring_jobs.items():
            if monitored_job_id == job_id:
                user_id = connection_id.split('_')[0]
                if user_id in self.active_connections:
                    for connection in self.active_connections[user_id]:
                        try:
                            await connection.send_json({
                                "type": "job_update",
                                "job_id": job_id,
                                "data": update
                            })
                        except:
                            pass  # Connection might be closed

# Initialize connection manager
connection_manager = IntegrationConnectionManager()

# ========================================================================================
# Utility Functions
# ========================================================================================

def get_orchestration_service(db: Session = Depends(get_db)) -> RacineOrchestrationService:
    """Get orchestration service instance for integration management"""
    return RacineOrchestrationService(db)

# ========================================================================================
# Integration Endpoint Management Routes
# ========================================================================================

@router.post("/endpoints", response_model=StandardResponse[IntegrationEndpointResponse])
async def create_integration_endpoint(
    request: IntegrationEndpointRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """
    Create a new integration endpoint for external system connectivity.
    
    Features:
    - Support for multiple endpoint types (REST, GraphQL, Database, etc.)
    - Configurable authentication and security
    - Health monitoring and validation
    - Automatic retry and error handling
    """
    try:
        logger.info(f"Creating integration endpoint: {request.name} by user: {current_user.id}")
        
        endpoint = await orchestration_service.create_integration_endpoint(
            name=request.name,
            endpoint_type=request.endpoint_type,
            url=str(request.url) if request.url else None,
            configuration=request.configuration,
            authentication=request.authentication,
            headers=request.headers,
            timeout_seconds=request.timeout_seconds,
            retry_config=request.retry_config,
            is_active=request.is_active,
            created_by=current_user.id
        )
        
        endpoint_response = IntegrationEndpointResponse(
            endpoint_id=endpoint.id,
            name=endpoint.name,
            endpoint_type=endpoint.endpoint_type,
            url=endpoint.url,
            status=endpoint.status,
            configuration=endpoint.configuration,
            timeout_seconds=endpoint.timeout_seconds,
            is_active=endpoint.is_active,
            created_at=endpoint.created_at,
            updated_at=endpoint.updated_at,
            last_health_check=endpoint.last_health_check,
            health_status=endpoint.health_status
        )
        
        return StandardResponse(
            success=True,
            message="Integration endpoint created successfully",
            data=endpoint_response
        )
        
    except Exception as e:
        logger.error(f"Error creating integration endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create endpoint: {str(e)}")

@router.get("/endpoints", response_model=StandardResponse[List[IntegrationEndpointResponse]])
async def get_integration_endpoints(
    endpoint_type: Optional[str] = Query(None, description="Filter by endpoint type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(default=50, ge=1, le=200, description="Number of endpoints to return"),
    offset: int = Query(default=0, ge=0, description="Endpoint offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Get integration endpoints with filtering options"""
    try:
        endpoints = await orchestration_service.get_integration_endpoints(
            user_id=current_user.id,
            endpoint_type=endpoint_type,
            status=status,
            limit=limit,
            offset=offset
        )
        
        endpoint_responses = [
            IntegrationEndpointResponse(
                endpoint_id=endpoint.id,
                name=endpoint.name,
                endpoint_type=endpoint.endpoint_type,
                url=endpoint.url,
                status=endpoint.status,
                configuration=endpoint.configuration,
                timeout_seconds=endpoint.timeout_seconds,
                is_active=endpoint.is_active,
                created_at=endpoint.created_at,
                updated_at=endpoint.updated_at,
                last_health_check=endpoint.last_health_check,
                health_status=endpoint.health_status
            )
            for endpoint in endpoints
        ]
        
        return StandardResponse(
            success=True,
            message="Integration endpoints retrieved successfully",
            data=endpoint_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting integration endpoints: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get endpoints: {str(e)}")

@router.post("/endpoints/{endpoint_id}/test", response_model=StandardResponse[Dict[str, Any]])
async def test_integration_endpoint(
    endpoint_id: str = Path(..., description="Endpoint ID"),
    test_data: Optional[Dict[str, Any]] = Body(None, description="Test data to send"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Test integration endpoint connectivity and functionality"""
    try:
        logger.info(f"Testing integration endpoint: {endpoint_id} by user: {current_user.id}")
        
        test_result = await orchestration_service.test_integration_endpoint(
            endpoint_id=endpoint_id,
            test_data=test_data,
            tested_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Endpoint test completed",
            data=test_result
        )
        
    except Exception as e:
        logger.error(f"Error testing endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to test endpoint: {str(e)}")

# ========================================================================================
# Cross-Group Synchronization Routes
# ========================================================================================

@router.post("/sync", response_model=StandardResponse[SyncJobResponse])
async def start_cross_group_sync(
    request: CrossGroupSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """
    Initiate cross-group data synchronization.
    
    Features:
    - Bidirectional synchronization between any groups
    - Configurable conflict resolution strategies
    - Real-time progress monitoring
    - Rollback capabilities for failed syncs
    - Comprehensive logging and audit trails
    """
    try:
        logger.info(f"Starting cross-group sync by user: {current_user.id}")
        
        sync_job = await orchestration_service.start_cross_group_sync(
            sync_type=request.sync_type,
            source_groups=request.source_groups,
            target_groups=request.target_groups,
            sync_mode=request.sync_mode,
            conflict_resolution=request.conflict_resolution,
            filters=request.filters,
            initiated_by=current_user.id
        )
        
        sync_response = SyncJobResponse(
            sync_id=sync_job.id,
            sync_type=sync_job.sync_type,
            source_groups=sync_job.source_groups,
            target_groups=sync_job.target_groups,
            status=sync_job.status,
            progress_percentage=sync_job.progress_percentage,
            records_processed=sync_job.records_processed,
            records_failed=sync_job.records_failed,
            started_at=sync_job.started_at,
            completed_at=sync_job.completed_at,
            error_message=sync_job.error_message
        )
        
        return StandardResponse(
            success=True,
            message="Cross-group synchronization started",
            data=sync_response
        )
        
    except Exception as e:
        logger.error(f"Error starting cross-group sync: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start sync: {str(e)}")

@router.get("/sync/{sync_id}", response_model=StandardResponse[SyncJobResponse])
async def get_sync_status(
    sync_id: str = Path(..., description="Sync job ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Get synchronization job status and progress"""
    try:
        sync_job = await orchestration_service.get_sync_status(sync_id, current_user.id)
        if not sync_job:
            raise HTTPException(status_code=404, detail="Sync job not found")
        
        sync_response = SyncJobResponse(
            sync_id=sync_job.id,
            sync_type=sync_job.sync_type,
            source_groups=sync_job.source_groups,
            target_groups=sync_job.target_groups,
            status=sync_job.status,
            progress_percentage=sync_job.progress_percentage,
            records_processed=sync_job.records_processed,
            records_failed=sync_job.records_failed,
            started_at=sync_job.started_at,
            completed_at=sync_job.completed_at,
            error_message=sync_job.error_message
        )
        
        return StandardResponse(
            success=True,
            message="Sync status retrieved successfully",
            data=sync_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting sync status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get sync status: {str(e)}")

@router.post("/sync/{sync_id}/control", response_model=StandardResponse[Dict[str, str]])
async def control_sync_job(
    sync_id: str = Path(..., description="Sync job ID"),
    action: str = Body(..., embed=True, description="Control action"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Control synchronization job (pause, resume, cancel, rollback)"""
    try:
        logger.info(f"Controlling sync job: {sync_id} action: {action} by user: {current_user.id}")
        
        if action not in ['pause', 'resume', 'cancel', 'rollback']:
            raise HTTPException(status_code=400, detail="Invalid control action")
        
        result = await orchestration_service.control_sync_job(
            sync_id=sync_id,
            action=action,
            controlled_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message=f"Sync job {action} command executed successfully",
            data={"sync_id": sync_id, "action": action, "result": result}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error controlling sync job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to control sync: {str(e)}")

# ========================================================================================
# Integration Job Management Routes
# ========================================================================================

@router.post("/jobs", response_model=StandardResponse[IntegrationJobResponse])
async def create_integration_job(
    request: IntegrationJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Create a new integration job for automated data processing"""
    try:
        logger.info(f"Creating integration job: {request.job_name} by user: {current_user.id}")
        
        job = await orchestration_service.create_integration_job(
            job_name=request.job_name,
            job_type=request.job_type,
            source_endpoint_id=request.source_endpoint_id,
            target_endpoint_id=request.target_endpoint_id,
            mapping_id=request.mapping_id,
            schedule_config=request.schedule_config,
            execution_config=request.execution_config,
            notification_config=request.notification_config,
            created_by=current_user.id
        )
        
        job_response = IntegrationJobResponse(
            job_id=job.id,
            job_name=job.job_name,
            job_type=job.job_type,
            status=job.status,
            source_endpoint_id=job.source_endpoint_id,
            target_endpoint_id=job.target_endpoint_id,
            mapping_id=job.mapping_id,
            last_execution=job.last_execution,
            next_execution=job.next_execution,
            success_rate=job.success_rate,
            total_executions=job.total_executions,
            created_at=job.created_at
        )
        
        return StandardResponse(
            success=True,
            message="Integration job created successfully",
            data=job_response
        )
        
    except Exception as e:
        logger.error(f"Error creating integration job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

@router.get("/jobs", response_model=StandardResponse[List[IntegrationJobResponse]])
async def get_integration_jobs(
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(default=50, ge=1, le=200, description="Number of jobs to return"),
    offset: int = Query(default=0, ge=0, description="Job offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Get integration jobs with filtering options"""
    try:
        jobs = await orchestration_service.get_integration_jobs(
            user_id=current_user.id,
            job_type=job_type,
            status=status,
            limit=limit,
            offset=offset
        )
        
        job_responses = [
            IntegrationJobResponse(
                job_id=job.id,
                job_name=job.job_name,
                job_type=job.job_type,
                status=job.status,
                source_endpoint_id=job.source_endpoint_id,
                target_endpoint_id=job.target_endpoint_id,
                mapping_id=job.mapping_id,
                last_execution=job.last_execution,
                next_execution=job.next_execution,
                success_rate=job.success_rate,
                total_executions=job.total_executions,
                created_at=job.created_at
            )
            for job in jobs
        ]
        
        return StandardResponse(
            success=True,
            message="Integration jobs retrieved successfully",
            data=job_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting integration jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get jobs: {str(e)}")

@router.post("/jobs/{job_id}/execute", response_model=StandardResponse[Dict[str, Any]])
async def execute_integration_job(
    job_id: str = Path(..., description="Integration job ID"),
    execution_params: Optional[Dict[str, Any]] = Body(None, description="Execution parameters"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Execute an integration job manually"""
    try:
        logger.info(f"Executing integration job: {job_id} by user: {current_user.id}")
        
        execution_result = await orchestration_service.execute_integration_job(
            job_id=job_id,
            execution_params=execution_params or {},
            executed_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Integration job execution started",
            data=execution_result
        )
        
    except Exception as e:
        logger.error(f"Error executing integration job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute job: {str(e)}")

# ========================================================================================
# Service Registry Routes
# ========================================================================================

@router.post("/services/register", response_model=StandardResponse[ServiceRegistryResponse])
async def register_service(
    request: ServiceRegistrationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Register a new service in the service registry"""
    try:
        logger.info(f"Registering service: {request.service_name} by user: {current_user.id}")
        
        service = await orchestration_service.register_service(
            service_name=request.service_name,
            service_type=request.service_type,
            version=request.version,
            endpoints=request.endpoints,
            health_check_url=request.health_check_url,
            metadata=request.metadata,
            dependencies=request.dependencies,
            registered_by=current_user.id
        )
        
        service_response = ServiceRegistryResponse(
            service_id=service.id,
            service_name=service.service_name,
            service_type=service.service_type,
            version=service.version,
            status=service.status,
            endpoints=service.endpoints,
            health_status=service.health_status,
            last_heartbeat=service.last_heartbeat,
            metadata=service.metadata,
            dependencies=service.dependencies
        )
        
        return StandardResponse(
            success=True,
            message="Service registered successfully",
            data=service_response
        )
        
    except Exception as e:
        logger.error(f"Error registering service: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to register service: {str(e)}")

@router.get("/services", response_model=StandardResponse[List[ServiceRegistryResponse]])
async def get_registered_services(
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Get registered services from the service registry"""
    try:
        services = await orchestration_service.get_registered_services(
            user_id=current_user.id,
            service_type=service_type,
            status=status
        )
        
        service_responses = [
            ServiceRegistryResponse(
                service_id=service.id,
                service_name=service.service_name,
                service_type=service.service_type,
                version=service.version,
                status=service.status,
                endpoints=service.endpoints,
                health_status=service.health_status,
                last_heartbeat=service.last_heartbeat,
                metadata=service.metadata,
                dependencies=service.dependencies
            )
            for service in services
        ]
        
        return StandardResponse(
            success=True,
            message="Registered services retrieved successfully",
            data=service_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting registered services: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get services: {str(e)}")

@router.post("/services/{service_id}/heartbeat", response_model=StandardResponse[Dict[str, str]])
async def service_heartbeat(
    service_id: str = Path(..., description="Service ID"),
    health_data: Optional[Dict[str, Any]] = Body(None, description="Health status data"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Send heartbeat for a registered service"""
    try:
        result = await orchestration_service.service_heartbeat(
            service_id=service_id,
            health_data=health_data,
            heartbeat_from=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Service heartbeat recorded",
            data={"service_id": service_id, "status": result}
        )
        
    except Exception as e:
        logger.error(f"Error recording service heartbeat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to record heartbeat: {str(e)}")

# ========================================================================================
# Real-time Integration Monitoring WebSocket
# ========================================================================================

@router.websocket("/monitor/{job_id}")
async def monitor_integration_job(
    websocket: WebSocket,
    job_id: str = Path(..., description="Integration job ID"),
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time integration job monitoring.
    
    Provides:
    - Real-time job execution updates
    - Progress monitoring
    - Error notifications
    - Performance metrics
    - Log streaming
    """
    orchestration_service = RacineOrchestrationService(db)
    connection_id = await connection_manager.connect(websocket, user_id, job_id)
    
    try:
        # Send initial job status
        job_status = await orchestration_service.get_integration_job_status(job_id, user_id)
        if job_status:
            await websocket.send_json({
                "type": "job_status",
                "data": {
                    "job_id": job_id,
                    "status": job_status.status,
                    "last_execution": job_status.last_execution.isoformat() if job_status.last_execution else None,
                    "success_rate": job_status.success_rate,
                    "total_executions": job_status.total_executions
                }
            })
        
        while True:
            try:
                # Wait for messages from client
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                message_data = json.loads(data)
                
                if message_data.get("type") == "get_logs":
                    # Send recent logs
                    limit = message_data.get("limit", 100)
                    logs = await orchestration_service.get_job_logs(job_id, user_id, limit)
                    
                    await websocket.send_json({
                        "type": "job_logs",
                        "data": [
                            {
                                "timestamp": log.timestamp.isoformat(),
                                "level": log.level,
                                "message": log.message,
                                "details": log.details
                            }
                            for log in logs
                        ]
                    })
                    
                elif message_data.get("type") == "get_metrics":
                    # Send performance metrics
                    metrics = await orchestration_service.get_job_metrics(job_id, user_id)
                    
                    await websocket.send_json({
                        "type": "job_metrics",
                        "data": metrics
                    })
                    
                elif message_data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                    
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat()
                })
                continue
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, user_id, connection_id)
        logger.info(f"Integration monitoring disconnected for job: {job_id}")
    except Exception as e:
        logger.error(f"Integration monitoring error for job {job_id}: {str(e)}")
        connection_manager.disconnect(websocket, user_id, connection_id)

# ========================================================================================
# System Health and Monitoring Routes
# ========================================================================================

@router.get("/health/system", response_model=StandardResponse[Dict[str, Any]])
async def get_system_health(
    include_services: bool = Query(default=True, description="Include service health"),
    include_endpoints: bool = Query(default=True, description="Include endpoint health"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Get comprehensive system health status"""
    try:
        health_status = await orchestration_service.get_system_health(
            user_id=current_user.id,
            include_services=include_services,
            include_endpoints=include_endpoints
        )
        
        return StandardResponse(
            success=True,
            message="System health status retrieved successfully",
            data=health_status
        )
        
    except Exception as e:
        logger.error(f"Error getting system health: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get system health: {str(e)}")

@router.get("/health", response_model=StandardResponse[Dict[str, Any]])
async def integration_health_check(
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Health check for integration service"""
    try:
        health_status = await orchestration_service.get_integration_service_health()
        
        return StandardResponse(
            success=True,
            message="Integration service health check completed",
            data=health_status
        )
        
    except Exception as e:
        logger.error(f"Integration service health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# ========================================================================================
# Analytics and Reporting Routes
# ========================================================================================

@router.get("/analytics/performance", response_model=StandardResponse[Dict[str, Any]])
async def get_integration_performance_analytics(
    time_period: str = Query(default="24h", description="Time period for analytics"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """Get integration performance analytics"""
    try:
        analytics = await orchestration_service.get_integration_analytics(
            user_id=current_user.id,
            time_period=time_period,
            job_type=job_type
        )
        
        return StandardResponse(
            success=True,
            message="Integration performance analytics retrieved successfully",
            data=analytics
        )
        
    except Exception as e:
        logger.error(f"Error getting integration analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

# ========================================================================================
# Error Handlers and Middleware
# ========================================================================================

@router.exception_handler(RacineException)
async def racine_exception_handler(request, exc: RacineException):
    """Handle Racine-specific exceptions"""
    logger.error(f"Racine integration error: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message, "error_code": exc.error_code}
    )

# Export router
__all__ = ["router", "connection_manager"]