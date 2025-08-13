from typing import Dict, List, Any, Optional, Union
import logging
from datetime import datetime, timedelta
from sqlmodel import Session, select, func, col
from app.models.scan_models import Scan, ScanResult, DataSource, ScanRuleSet
import json

# Setup logging
logger = logging.getLogger(__name__)

class DashboardService:
    """Service for generating dashboard data and visualizations."""
    
    @staticmethod
    def get_scan_summary_stats(session: Session, days: int = 30) -> Dict[str, Any]:
        """Get summary statistics for scans.
        
        Args:
            session: The database session
            days: The number of days to look back
            
        Returns:
            A dictionary containing summary statistics
        """
        try:
            # Calculate the date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Get total scans in the period
            total_scans = session.exec(
                select(func.count()).where(
                    Scan.created_at >= start_date,
                    Scan.created_at <= end_date
                )
            ).one()
            
            # Get scans by status
            status_counts = {}
            for status in ["completed", "failed", "in_progress", "pending"]:
                count = session.exec(
                    select(func.count()).where(
                        Scan.created_at >= start_date,
                        Scan.created_at <= end_date,
                        Scan.status == status
                    )
                ).one()
                status_counts[status] = count
            
            # Get average scan duration for completed scans
            avg_duration = session.exec(
                select(func.avg(Scan.completed_at - Scan.started_at)).where(
                    Scan.created_at >= start_date,
                    Scan.created_at <= end_date,
                    Scan.status == "completed",
                    Scan.started_at.is_not(None),
                    Scan.completed_at.is_not(None)
                )
            ).one()
            
            # Convert timedelta to seconds if not None
            avg_duration_seconds = avg_duration.total_seconds() if avg_duration else None
            
            # Get scans by data source type
            data_source_counts = {}
            stmt = select(DataSource.source_type, func.count()).join(
                Scan, DataSource.id == Scan.data_source_id
            ).where(
                Scan.created_at >= start_date,
                Scan.created_at <= end_date
            ).group_by(DataSource.source_type)
            
            results = session.exec(stmt).all()
            for source_type, count in results:
                data_source_counts[source_type.value if hasattr(source_type, 'value') else str(source_type)] = count
            
            return {
                "total_scans": total_scans,
                "status_counts": status_counts,
                "avg_duration_seconds": avg_duration_seconds,
                "data_source_counts": data_source_counts,
                "period_days": days,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting scan summary stats: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def get_scan_trend_data(session: Session, days: int = 30, interval: str = "day") -> Dict[str, Any]:
        """Get trend data for scans over time.
        
        Args:
            session: The database session
            days: The number of days to look back
            interval: The interval for grouping (day, week, month)
            
        Returns:
            A dictionary containing trend data
        """
        try:
            # Calculate the date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Define the date trunc function based on the interval
            if interval == "day":
                date_trunc = func.date_trunc('day', Scan.created_at)
            elif interval == "week":
                date_trunc = func.date_trunc('week', Scan.created_at)
            elif interval == "month":
                date_trunc = func.date_trunc('month', Scan.created_at)
            else:
                raise ValueError(f"Invalid interval: {interval}")
            
            # Get scan counts by date and status
            stmt = select(
                date_trunc.label("date"),
                Scan.status,
                func.count().label("count")
            ).where(
                Scan.created_at >= start_date,
                Scan.created_at <= end_date
            ).group_by(
                "date", Scan.status
            ).order_by("date")
            
            results = session.exec(stmt).all()
            
            # Organize the results by date and status
            trend_data = {}
            for date, status, count in results:
                date_str = date.isoformat() if date else None
                if date_str not in trend_data:
                    trend_data[date_str] = {"completed": 0, "failed": 0, "in_progress": 0, "pending": 0}
                trend_data[date_str][status] = count
            
            # Convert to a list format for easier consumption by visualization libraries
            trend_list = [
                {"date": date, **counts}
                for date, counts in trend_data.items()
            ]
            
            return {
                "interval": interval,
                "period_days": days,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "trend_data": trend_list
            }
            
        except Exception as e:
            logger.error(f"Error getting scan trend data: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def get_data_source_stats(session: Session) -> Dict[str, Any]:
        """Get statistics for data sources.
        
        Args:
            session: The database session
            
        Returns:
            A dictionary containing data source statistics
        """
        try:
            # Get total data sources
            total_sources = session.exec(select(func.count()).select_from(DataSource)).one()
            
            # Get data sources by type
            type_counts = {}
            stmt = select(DataSource.source_type, func.count()).group_by(DataSource.source_type)
            results = session.exec(stmt).all()
            for source_type, count in results:
                type_counts[source_type.value if hasattr(source_type, 'value') else str(source_type)] = count
            
            # Get data sources by location
            location_counts = {}
            stmt = select(DataSource.location, func.count()).group_by(DataSource.location)
            results = session.exec(stmt).all()
            for location, count in results:
                location_counts[location.value if hasattr(location, 'value') else str(location)] = count
            
            # Get most scanned data sources
            stmt = select(
                DataSource.id,
                DataSource.name,
                DataSource.source_type,
                func.count(Scan.id).label("scan_count")
            ).join(
                Scan, DataSource.id == Scan.data_source_id
            ).group_by(
                DataSource.id, DataSource.name, DataSource.source_type
            ).order_by(
                col("scan_count").desc()
            ).limit(10)
            
            most_scanned = []
            results = session.exec(stmt).all()
            for id, name, source_type, scan_count in results:
                most_scanned.append({
                    "id": id,
                    "name": name,
                    "source_type": source_type.value if hasattr(source_type, 'value') else str(source_type),
                    "scan_count": scan_count
                })
            
            return {
                "total_sources": total_sources,
                "type_counts": type_counts,
                "location_counts": location_counts,
                "most_scanned": most_scanned
            }
            
        except Exception as e:
            logger.error(f"Error getting data source stats: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def get_metadata_stats(session: Session) -> Dict[str, Any]:
        """Get statistics for metadata collected from scans.
        
        Args:
            session: The database session
            
        Returns:
            A dictionary containing metadata statistics
        """
        try:
            # Get the latest scan result for each data source
            subq = select(
                ScanResult.scan_id,
                func.max(ScanResult.created_at).label("max_created_at")
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).where(
                Scan.status == "completed"
            ).group_by(Scan.data_source_id).subquery()
            
            stmt = select(ScanResult).join(
                subq,
                (ScanResult.scan_id == subq.c.scan_id) & 
                (ScanResult.created_at == subq.c.max_created_at)
            )
            
            latest_results = session.exec(stmt).all()
            
            # Initialize counters
            total_schemas = 0
            total_tables = 0
            total_columns = 0
            total_databases = 0
            total_collections = 0
            total_fields = 0
            
            # Process each scan result
            for result in latest_results:
                metadata = result.scan_metadata
                
                # Count relational database objects
                for schema in metadata.get("schemas", []):
                    total_schemas += 1
                    for table in schema.get("tables", []):
                        total_tables += 1
                        total_columns += len(table.get("columns", []))
                
                # Count MongoDB objects
                for db in metadata.get("databases", []):
                    total_databases += 1
                    for collection in db.get("collections", []):
                        total_collections += 1
                        total_fields += len(collection.get("fields", []))
            
            return {
                "total_schemas": total_schemas,
                "total_tables": total_tables,
                "total_columns": total_columns,
                "total_databases": total_databases,
                "total_collections": total_collections,
                "total_fields": total_fields,
                "total_objects": total_schemas + total_tables + total_columns + 
                                 total_databases + total_collections + total_fields
            }
            
        except Exception as e:
            logger.error(f"Error getting metadata stats: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def get_data_lineage(session: Session, data_source_id: Optional[int] = None) -> Dict[str, Any]:
        """Get data lineage information.
        
        Args:
            session: The database session
            data_source_id: Optional ID of the data source to filter by
            
        Returns:
            A dictionary containing data lineage information
        """
        try:
            # Get the latest scan result for each data source
            subq = select(
                ScanResult.scan_id,
                func.max(ScanResult.created_at).label("max_created_at")
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).where(
                Scan.status == "completed"
            )
            
            if data_source_id is not None:
                subq = subq.where(Scan.data_source_id == data_source_id)
            
            subq = subq.group_by(Scan.data_source_id).subquery()
            
            stmt = select(ScanResult, Scan, DataSource).join(
                subq,
                (ScanResult.scan_id == subq.c.scan_id) & 
                (ScanResult.created_at == subq.c.max_created_at)
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).join(
                DataSource, Scan.data_source_id == DataSource.id
            )
            
            results = session.exec(stmt).all()
            
            # Build lineage graph
            nodes = []
            edges = []
            node_ids = set()
            
            for result, scan, data_source in results:
                # Extract lineage information from metadata
                lineage_info = DashboardService._extract_lineage_from_metadata(
                    result.scan_metadata, data_source.name, data_source.source_type
                )
                
                # Add nodes and edges to the graph
                for node in lineage_info["nodes"]:
                    if node["id"] not in node_ids:
                        nodes.append(node)
                        node_ids.add(node["id"])
                
                edges.extend(lineage_info["edges"])
            
            return {
                "nodes": nodes,
                "edges": edges
            }
            
        except Exception as e:
            logger.error(f"Error getting data lineage: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def _extract_lineage_from_metadata(metadata: Dict[str, Any], source_name: str, source_type: str) -> Dict[str, Any]:
        """Extract lineage information from metadata.
        
        This is a placeholder implementation that would need to be expanded based on
        how lineage information is stored in your metadata.
        """
        nodes = []
        edges = []
        node_ids = set()
        
        # Add the data source as a node
        source_id = f"source_{source_name}"
        nodes.append({
            "id": source_id,
            "label": source_name,
            "type": "data_source",
            "source_type": source_type
        })
        node_ids.add(source_id)
        
        # Process relational database metadata
        for schema in metadata.get("schemas", []):
            schema_name = schema.get("name", "")
            schema_id = f"schema_{source_name}_{schema_name}"
            
            if schema_id not in node_ids:
                nodes.append({
                    "id": schema_id,
                    "label": schema_name,
                    "type": "schema",
                    "parent": source_id
                })
                node_ids.add(schema_id)
            
            # Add edge from source to schema
            edges.append({
                "source": source_id,
                "target": schema_id,
                "label": "contains"
            })
            
            for table in schema.get("tables", []):
                table_name = table.get("name", "")
                table_id = f"table_{source_name}_{schema_name}_{table_name}"
                
                if table_id not in node_ids:
                    nodes.append({
                        "id": table_id,
                        "label": table_name,
                        "type": "table",
                        "parent": schema_id,
                        "row_count": table.get("row_count", 0)
                    })
                    node_ids.add(table_id)
                
                # Add edge from schema to table
                edges.append({
                    "source": schema_id,
                    "target": table_id,
                    "label": "contains"
                })
                
                # Look for foreign key relationships
                for column in table.get("columns", []):
                    if column.get("is_foreign_key") and column.get("foreign_key_reference"):
                        ref = column.get("foreign_key_reference", {})
                        ref_schema = ref.get("schema_name", schema_name)
                        ref_table = ref.get("table_name", "")
                        
                        if ref_table:
                            ref_table_id = f"table_{source_name}_{ref_schema}_{ref_table}"
                            
                            # Add edge for foreign key relationship
                            edges.append({
                                "source": table_id,
                                "target": ref_table_id,
                                "label": "references",
                                "column": column.get("name", "")
                            })
        
        # Process MongoDB metadata
        for db in metadata.get("databases", []):
            db_name = db.get("name", "")
            db_id = f"database_{source_name}_{db_name}"
            
            if db_id not in node_ids:
                nodes.append({
                    "id": db_id,
                    "label": db_name,
                    "type": "database",
                    "parent": source_id
                })
                node_ids.add(db_id)
            
            # Add edge from source to database
            edges.append({
                "source": source_id,
                "target": db_id,
                "label": "contains"
            })
            
            for collection in db.get("collections", []):
                coll_name = collection.get("name", "")
                coll_id = f"collection_{source_name}_{db_name}_{coll_name}"
                
                if coll_id not in node_ids:
                    nodes.append({
                        "id": coll_id,
                        "label": coll_name,
                        "type": "collection",
                        "parent": db_id,
                        "document_count": collection.get("document_count", 0)
                    })
                    node_ids.add(coll_id)
                
                # Add edge from database to collection
                edges.append({
                    "source": db_id,
                    "target": coll_id,
                    "label": "contains"
                })
                
                # Look for references between collections
                for field in collection.get("fields", []):
                    if field.get("is_reference") and field.get("reference_info"):
                        ref = field.get("reference_info", {})
                        ref_db = ref.get("database_name", db_name)
                        ref_coll = ref.get("collection_name", "")
                        
                        if ref_coll:
                            ref_coll_id = f"collection_{source_name}_{ref_db}_{ref_coll}"
                            
                            # Add edge for reference relationship
                            edges.append({
                                "source": coll_id,
                                "target": ref_coll_id,
                                "label": "references",
                                "field": field.get("name", "")
                            })
        
        return {"nodes": nodes, "edges": edges}
    
    @staticmethod
    def get_compliance_report(session: Session, data_source_id: Optional[int] = None) -> Dict[str, Any]:
        """Generate a compliance report.
        
        Args:
            session: The database session
            data_source_id: Optional ID of the data source to filter by
            
        Returns:
            A dictionary containing compliance information
        """
        try:
            # Get the latest scan result for each data source
            subq = select(
                ScanResult.scan_id,
                func.max(ScanResult.created_at).label("max_created_at")
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).where(
                Scan.status == "completed"
            )
            
            if data_source_id is not None:
                subq = subq.where(Scan.data_source_id == data_source_id)
            
            subq = subq.group_by(Scan.data_source_id).subquery()
            
            stmt = select(ScanResult, Scan, DataSource).join(
                subq,
                (ScanResult.scan_id == subq.c.scan_id) & 
                (ScanResult.created_at == subq.c.max_created_at)
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).join(
                DataSource, Scan.data_source_id == DataSource.id
            )
            
            results = session.exec(stmt).all()
            
            # Initialize compliance metrics
            compliance_metrics = {
                "total_data_sources": 0,
                "compliant_data_sources": 0,
                "non_compliant_data_sources": 0,
                "compliance_by_type": {},
                "sensitive_data_summary": {
                    "total_columns": 0,
                    "sensitive_columns": 0,
                    "pii_columns": 0,
                    "financial_columns": 0,
                    "health_columns": 0
                },
                "data_sources": []
            }
            
            # Process each scan result
            for result, scan, data_source in results:
                compliance_metrics["total_data_sources"] += 1
                
                # Extract compliance information from metadata
                source_compliance = DashboardService._extract_compliance_from_metadata(
                    result.scan_metadata, data_source.name, data_source.source_type
                )
                
                # Update overall metrics
                if source_compliance["is_compliant"]:
                    compliance_metrics["compliant_data_sources"] += 1
                else:
                    compliance_metrics["non_compliant_data_sources"] += 1
                
                # Update type-specific metrics
                source_type = data_source.source_type.value if hasattr(data_source.source_type, 'value') else str(data_source.source_type)
                if source_type not in compliance_metrics["compliance_by_type"]:
                    compliance_metrics["compliance_by_type"][source_type] = {
                        "total": 0,
                        "compliant": 0,
                        "non_compliant": 0
                    }
                
                compliance_metrics["compliance_by_type"][source_type]["total"] += 1
                if source_compliance["is_compliant"]:
                    compliance_metrics["compliance_by_type"][source_type]["compliant"] += 1
                else:
                    compliance_metrics["compliance_by_type"][source_type]["non_compliant"] += 1
                
                # Update sensitive data summary
                compliance_metrics["sensitive_data_summary"]["total_columns"] += source_compliance["total_columns"]
                compliance_metrics["sensitive_data_summary"]["sensitive_columns"] += source_compliance["sensitive_columns"]
                compliance_metrics["sensitive_data_summary"]["pii_columns"] += source_compliance["pii_columns"]
                compliance_metrics["sensitive_data_summary"]["financial_columns"] += source_compliance["financial_columns"]
                compliance_metrics["sensitive_data_summary"]["health_columns"] += source_compliance["health_columns"]
                
                # Add data source details
                compliance_metrics["data_sources"].append({
                    "id": data_source.id,
                    "name": data_source.name,
                    "source_type": source_type,
                    "is_compliant": source_compliance["is_compliant"],
                    "compliance_issues": source_compliance["compliance_issues"],
                    "sensitive_data_count": source_compliance["sensitive_columns"],
                    "last_scan_date": scan.completed_at.isoformat() if scan.completed_at else None
                })
            
            # Calculate compliance percentage
            if compliance_metrics["total_data_sources"] > 0:
                compliance_metrics["compliance_percentage"] = round(
                    (compliance_metrics["compliant_data_sources"] / compliance_metrics["total_data_sources"]) * 100, 2
                )
            else:
                compliance_metrics["compliance_percentage"] = 0
            
            # Calculate sensitive data percentage
            if compliance_metrics["sensitive_data_summary"]["total_columns"] > 0:
                compliance_metrics["sensitive_data_summary"]["sensitive_percentage"] = round(
                    (compliance_metrics["sensitive_data_summary"]["sensitive_columns"] / 
                     compliance_metrics["sensitive_data_summary"]["total_columns"]) * 100, 2
                )
            else:
                compliance_metrics["sensitive_data_summary"]["sensitive_percentage"] = 0
            
            return compliance_metrics
            
        except Exception as e:
            logger.error(f"Error generating compliance report: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def _extract_compliance_from_metadata(metadata: Dict[str, Any], source_name: str, source_type: str) -> Dict[str, Any]:
        """Extract compliance information from metadata.
        
        This is a placeholder implementation that would need to be expanded based on
        how compliance information is stored in your metadata.
        """
        compliance_info = {
            "is_compliant": True,
            "compliance_issues": [],
            "total_columns": 0,
            "sensitive_columns": 0,
            "pii_columns": 0,
            "financial_columns": 0,
            "health_columns": 0
        }
        
        # Process relational database metadata
        for schema in metadata.get("schemas", []):
            for table in schema.get("tables", []):
                for column in table.get("columns", []):
                    compliance_info["total_columns"] += 1
                    
                    # Check for sensitive data classifications
                    classifications = column.get("classifications", [])
                    is_sensitive = False
                    
                    for classification in classifications:
                        category = classification.get("category", "").lower()
                        if category in ["pii", "personal", "sensitive"]:
                            compliance_info["pii_columns"] += 1
                            is_sensitive = True
                        elif category in ["financial", "payment", "credit"]:
                            compliance_info["financial_columns"] += 1
                            is_sensitive = True
                        elif category in ["health", "medical", "phi"]:
                            compliance_info["health_columns"] += 1
                            is_sensitive = True
                    
                    if is_sensitive:
                        compliance_info["sensitive_columns"] += 1
                        
                        # Check for compliance issues
                        if not column.get("is_encrypted", False):
                            issue = f"Sensitive column {schema.get('name')}.{table.get('name')}.{column.get('name')} is not encrypted"
                            compliance_info["compliance_issues"].append(issue)
                            compliance_info["is_compliant"] = False
        
        # Process MongoDB metadata
        for db in metadata.get("databases", []):
            for collection in db.get("collections", []):
                for field in collection.get("fields", []):
                    compliance_info["total_columns"] += 1
                    
                    # Check for sensitive data classifications
                    classifications = field.get("classifications", [])
                    is_sensitive = False
                    
                    for classification in classifications:
                        category = classification.get("category", "").lower()
                        if category in ["pii", "personal", "sensitive"]:
                            compliance_info["pii_columns"] += 1
                            is_sensitive = True
                        elif category in ["financial", "payment", "credit"]:
                            compliance_info["financial_columns"] += 1
                            is_sensitive = True
                        elif category in ["health", "medical", "phi"]:
                            compliance_info["health_columns"] += 1
                            is_sensitive = True
                    
                    if is_sensitive:
                        compliance_info["sensitive_columns"] += 1
                        
                        # Check for compliance issues
                        if not field.get("is_encrypted", False):
                            issue = f"Sensitive field {db.get('name')}.{collection.get('name')}.{field.get('name')} is not encrypted"
                            compliance_info["compliance_issues"].append(issue)
                            compliance_info["is_compliant"] = False
        
        return compliance_info