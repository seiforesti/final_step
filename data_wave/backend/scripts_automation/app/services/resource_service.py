from sqlalchemy.orm import Session
from app.models.auth_models import Resource
from app.models.scan_models import DataSource
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

def get_resource_ancestors(db: Session, resource_id: int) -> List[Resource]:
    """
    Efficiently fetch all ancestors of a resource using a recursive CTE (if supported by the DB),
    otherwise fallback to Python recursion. Returns a list from closest parent up to the root.
    """
    from sqlalchemy import text
    # Try recursive CTE (works for PostgreSQL, SQLite 3.8.3+, etc.)
    try:
        sql = text('''
            WITH RECURSIVE ancestors(id, name, type, parent_id, engine, details) AS (
                SELECT id, name, type, parent_id, engine, details FROM resources WHERE id = :rid
                UNION ALL
                SELECT r.id, r.name, r.type, r.parent_id, r.engine, r.details
                FROM resources r
                JOIN ancestors a ON r.id = a.parent_id
            )
            SELECT id, name, type, parent_id, engine, details FROM ancestors WHERE id != :rid;
        ''')
        rows = db.execute(sql, {"rid": resource_id}).fetchall()
        # Convert to Resource objects (if needed)
        return [Resource(**dict(row)) for row in rows]
    except Exception:
        # Fallback to Python recursion
        ancestors = []
        current = db.query(Resource).filter(Resource.id == resource_id).first()
        while current and current.parent_id:
            parent = db.query(Resource).filter(Resource.id == current.parent_id).first()
            if not parent:
                break
            ancestors.append(parent)
            current = parent
        return ancestors

def get_resource_descendants(db: Session, resource_id: int) -> List[Resource]:
    """
    Efficiently fetch all descendants of a resource using a recursive CTE (if supported by the DB),
    otherwise fallback to Python recursion. Returns a flat list of all descendants.
    """
    from sqlalchemy import text
    try:
        sql = text('''
            WITH RECURSIVE descendants(id, name, type, parent_id, engine, details) AS (
                SELECT id, name, type, parent_id, engine, details FROM resources WHERE parent_id = :rid
                UNION ALL
                SELECT r.id, r.name, r.type, r.parent_id, r.engine, r.details
                FROM resources r
                JOIN descendants d ON r.parent_id = d.id
            )
            SELECT id, name, type, parent_id, engine, details FROM descendants;
        ''')
        rows = db.execute(sql, {"rid": resource_id}).fetchall()
        return [Resource(**dict(row)) for row in rows]
    except Exception:
        descendants = []
        def recurse(rid):
            children = db.query(Resource).filter(Resource.parent_id == rid).all()
            for child in children:
                descendants.append(child)
                recurse(child.id)
        recurse(resource_id)
        return descendants

def sync_data_sources_to_resources(db: Session) -> Dict[str, Any]:
    """
    Synchronize data sources to RBAC resources for production-ready resource management.
    Creates a hierarchical resource structure based on data sources.
    """
    try:
        # Get all data sources
        data_sources = db.query(DataSource).all()
        
        synced_resources = []
        updated_resources = []
        
        for data_source in data_sources:
            # Check if resource already exists for this data source
            existing_resource = db.query(Resource).filter(
                Resource.name == data_source.name,
                Resource.type == "data_source"
            ).first()
            
            if existing_resource:
                # Update existing resource
                existing_resource.engine = str(data_source.source_type.value) if data_source.source_type else None
                existing_resource.details = {
                    "data_source_id": data_source.id,
                    "host": data_source.host,
                    "port": data_source.port,
                    "database_name": data_source.database_name,
                    "environment": str(data_source.environment.value) if data_source.environment else None,
                    "criticality": str(data_source.criticality.value) if data_source.criticality else None,
                    "owner": data_source.owner,
                    "team": data_source.team,
                    "tags": data_source.tags,
                    "cloud_provider": str(data_source.cloud_provider.value) if data_source.cloud_provider else None,
                    "last_synced": datetime.utcnow().isoformat()
                }
                updated_resources.append(existing_resource)
            else:
                # Create new resource
                resource = Resource(
                    name=data_source.name,
                    type="data_source",
                    parent_id=None,  # Top-level resource
                    engine=str(data_source.source_type.value) if data_source.source_type else None,
                    details={
                        "data_source_id": data_source.id,
                        "host": data_source.host,
                        "port": data_source.port,
                        "database_name": data_source.database_name,
                        "environment": str(data_source.environment.value) if data_source.environment else None,
                        "criticality": str(data_source.criticality.value) if data_source.criticality else None,
                        "owner": data_source.owner,
                        "team": data_source.team,
                        "tags": data_source.tags,
                        "cloud_provider": str(data_source.cloud_provider.value) if data_source.cloud_provider else None,
                        "created_at": datetime.utcnow().isoformat()
                    }
                )
                db.add(resource)
                synced_resources.append(resource)
                
                # If the data source has a database name, create a database resource
                if data_source.database_name:
                    db_resource = Resource(
                        name=data_source.database_name,
                        type="database",
                        parent_id=resource.id,
                        engine=str(data_source.source_type.value) if data_source.source_type else None,
                        details={
                            "data_source_id": data_source.id,
                            "parent_resource_type": "data_source",
                            "created_at": datetime.utcnow().isoformat()
                        }
                    )
                    db.add(db_resource)
                    synced_resources.append(db_resource)
        
        db.commit()
        
        # Refresh all resources
        for resource in synced_resources + updated_resources:
            db.refresh(resource)
        
        logger.info(f"Synced {len(synced_resources)} new resources and updated {len(updated_resources)} existing resources")
        
        return {
            "status": "success",
            "synced_count": len(synced_resources),
            "updated_count": len(updated_resources),
            "total_data_sources": len(data_sources),
            "synced_resources": [{"id": r.id, "name": r.name, "type": r.type} for r in synced_resources],
            "updated_resources": [{"id": r.id, "name": r.name, "type": r.type} for r in updated_resources]
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error syncing data sources to resources: {e}")
        raise

def get_resource_by_data_source(db: Session, data_source_id: int) -> Optional[Resource]:
    """Get the RBAC resource associated with a data source."""
    return db.query(Resource).filter(
        Resource.type == "data_source",
        Resource.details.contains(f'"data_source_id": {data_source_id}')
    ).first()

def create_schema_resources_for_data_source(db: Session, data_source_id: int, schemas: List[str]) -> List[Resource]:
    """Create schema resources under a data source resource."""
    # Get the parent data source resource
    parent_resource = get_resource_by_data_source(db, data_source_id)
    if not parent_resource:
        raise ValueError(f"No resource found for data source {data_source_id}")
    
    # Find the database resource (if exists)
    database_resource = db.query(Resource).filter(
        Resource.parent_id == parent_resource.id,
        Resource.type == "database"
    ).first()
    
    parent_id = database_resource.id if database_resource else parent_resource.id
    
    created_resources = []
    for schema_name in schemas:
        # Check if schema resource already exists
        existing_schema = db.query(Resource).filter(
            Resource.parent_id == parent_id,
            Resource.type == "schema",
            Resource.name == schema_name
        ).first()
        
        if not existing_schema:
            schema_resource = Resource(
                name=schema_name,
                type="schema",
                parent_id=parent_id,
                engine=parent_resource.engine,
                details={
                    "data_source_id": data_source_id,
                    "parent_resource_type": "database" if database_resource else "data_source",
                    "created_at": datetime.utcnow().isoformat()
                }
            )
            db.add(schema_resource)
            created_resources.append(schema_resource)
    
    db.commit()
    
    for resource in created_resources:
        db.refresh(resource)
    
    return created_resources

def create_table_resources_for_schema(db: Session, schema_resource_id: int, tables: List[str]) -> List[Resource]:
    """Create table resources under a schema resource."""
    schema_resource = db.query(Resource).filter(Resource.id == schema_resource_id).first()
    if not schema_resource:
        raise ValueError(f"No schema resource found with id {schema_resource_id}")
    
    created_resources = []
    for table_name in tables:
        # Check if table resource already exists
        existing_table = db.query(Resource).filter(
            Resource.parent_id == schema_resource_id,
            Resource.type == "table",
            Resource.name == table_name
        ).first()
        
        if not existing_table:
            table_resource = Resource(
                name=table_name,
                type="table",
                parent_id=schema_resource_id,
                engine=schema_resource.engine,
                details={
                    "data_source_id": schema_resource.details.get("data_source_id"),
                    "parent_resource_type": "schema",
                    "created_at": datetime.utcnow().isoformat()
                }
            )
            db.add(table_resource)
            created_resources.append(table_resource)
    
    db.commit()
    
    for resource in created_resources:
        db.refresh(resource)
    
    return created_resources

def get_resources_by_data_source_hierarchy(db: Session, data_source_id: int) -> Dict[str, List[Resource]]:
    """Get all resources in the hierarchy for a specific data source."""
    data_source_resource = get_resource_by_data_source(db, data_source_id)
    if not data_source_resource:
        return {"data_source": [], "databases": [], "schemas": [], "tables": []}
    
    # Get all descendants
    descendants = get_resource_descendants(db, data_source_resource.id)
    
    # Organize by type
    result = {
        "data_source": [data_source_resource],
        "databases": [],
        "schemas": [],
        "tables": []
    }
    
    for resource in descendants:
        if resource.type == "database":
            result["databases"].append(resource)
        elif resource.type == "schema":
            result["schemas"].append(resource)
        elif resource.type == "table":
            result["tables"].append(resource)
    
    return result
