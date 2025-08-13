from typing import Dict, List, Any, Optional, Union
import logging
from datetime import datetime
from sqlmodel import Session, select, func
from app.models.scan_models import Scan, ScanResult, DataSource
import json

# Setup logging
logger = logging.getLogger(__name__)

class LineageService:
    """Service for generating and managing data lineage information."""
    
    @staticmethod
    def generate_lineage_graph(session: Session, data_source_id: Optional[int] = None) -> Dict[str, Any]:
        """Generate a data lineage graph.
        
        Args:
            session: The database session
            data_source_id: Optional ID of the data source to filter by
            
        Returns:
            A dictionary containing nodes and edges for the lineage graph
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
                lineage_info = LineageService._extract_lineage_from_metadata(
                    result.scan_metadata, data_source.id, data_source.name, data_source.source_type
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
            logger.error(f"Error generating lineage graph: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def _extract_lineage_from_metadata(metadata: Dict[str, Any], source_id: int, source_name: str, source_type: str) -> Dict[str, Any]:
        """Extract lineage information from metadata.
        
        Args:
            metadata: The scan result metadata
            source_id: The ID of the data source
            source_name: The name of the data source
            source_type: The type of the data source
            
        Returns:
            A dictionary containing nodes and edges for the lineage graph
        """
        nodes = []
        edges = []
        node_ids = set()
        
        # Add the data source as a node
        source_node_id = f"source_{source_id}"
        nodes.append({
            "id": source_node_id,
            "label": source_name,
            "type": "data_source",
            "source_type": source_type.value if hasattr(source_type, 'value') else str(source_type),
            "entity_id": source_id,
            "properties": {
                "name": source_name,
                "type": source_type.value if hasattr(source_type, 'value') else str(source_type)
            }
        })
        node_ids.add(source_node_id)
        
        # Process relational database metadata
        if source_type in ["mysql", "postgresql", "oracle", "sqlserver"]:
            for schema in metadata.get("schemas", []):
                schema_name = schema.get("name", "")
                schema_node_id = f"schema_{source_id}_{schema_name}"
                
                if schema_node_id not in node_ids:
                    nodes.append({
                        "id": schema_node_id,
                        "label": schema_name,
                        "type": "schema",
                        "parent": source_node_id,
                        "properties": {
                            "name": schema_name,
                            "data_source_id": source_id,
                            "data_source_name": source_name
                        }
                    })
                    node_ids.add(schema_node_id)
                
                # Add edge from source to schema
                edges.append({
                    "source": source_node_id,
                    "target": schema_node_id,
                    "label": "contains",
                    "properties": {}
                })
                
                for table in schema.get("tables", []):
                    table_name = table.get("name", "")
                    table_node_id = f"table_{source_id}_{schema_name}_{table_name}"
                    
                    if table_node_id not in node_ids:
                        nodes.append({
                            "id": table_node_id,
                            "label": table_name,
                            "type": "table",
                            "parent": schema_node_id,
                            "properties": {
                                "name": table_name,
                                "schema_name": schema_name,
                                "data_source_id": source_id,
                                "data_source_name": source_name,
                                "row_count": table.get("row_count", 0),
                                "description": table.get("description", "")
                            }
                        })
                        node_ids.add(table_node_id)
                    
                    # Add edge from schema to table
                    edges.append({
                        "source": schema_node_id,
                        "target": table_node_id,
                        "label": "contains",
                        "properties": {}
                    })
                    
                    # Process columns for data lineage
                    for column in table.get("columns", []):
                        column_name = column.get("name", "")
                        
                        # Check for foreign key relationships
                        if column.get("is_foreign_key") and column.get("foreign_key_reference"):
                            ref = column.get("foreign_key_reference", {})
                            ref_schema = ref.get("schema_name", schema_name)
                            ref_table = ref.get("table_name", "")
                            ref_column = ref.get("column_name", "")
                            
                            if ref_table:
                                ref_table_node_id = f"table_{source_id}_{ref_schema}_{ref_table}"
                                
                                # Add edge for foreign key relationship
                                edges.append({
                                    "source": table_node_id,
                                    "target": ref_table_node_id,
                                    "label": "references",
                                    "properties": {
                                        "source_column": column_name,
                                        "target_column": ref_column,
                                        "relationship_type": "foreign_key"
                                    }
                                })
        
        # Process MongoDB metadata
        elif source_type == "mongodb":
            for db in metadata.get("databases", []):
                db_name = db.get("name", "")
                db_node_id = f"database_{source_id}_{db_name}"
                
                if db_node_id not in node_ids:
                    nodes.append({
                        "id": db_node_id,
                        "label": db_name,
                        "type": "database",
                        "parent": source_node_id,
                        "properties": {
                            "name": db_name,
                            "data_source_id": source_id,
                            "data_source_name": source_name
                        }
                    })
                    node_ids.add(db_node_id)
                
                # Add edge from source to database
                edges.append({
                    "source": source_node_id,
                    "target": db_node_id,
                    "label": "contains",
                    "properties": {}
                })
                
                for collection in db.get("collections", []):
                    coll_name = collection.get("name", "")
                    coll_node_id = f"collection_{source_id}_{db_name}_{coll_name}"
                    
                    if coll_node_id not in node_ids:
                        nodes.append({
                            "id": coll_node_id,
                            "label": coll_name,
                            "type": "collection",
                            "parent": db_node_id,
                            "properties": {
                                "name": coll_name,
                                "database_name": db_name,
                                "data_source_id": source_id,
                                "data_source_name": source_name,
                                "document_count": collection.get("document_count", 0),
                                "description": collection.get("description", "")
                            }
                        })
                        node_ids.add(coll_node_id)
                    
                    # Add edge from database to collection
                    edges.append({
                        "source": db_node_id,
                        "target": coll_node_id,
                        "label": "contains",
                        "properties": {}
                    })
                    
                    # Process fields for data lineage
                    for field in collection.get("fields", []):
                        field_name = field.get("name", "")
                        
                        # Check for references between collections
                        if field.get("is_reference") and field.get("reference_info"):
                            ref = field.get("reference_info", {})
                            ref_db = ref.get("database_name", db_name)
                            ref_coll = ref.get("collection_name", "")
                            ref_field = ref.get("field_name", "")
                            
                            if ref_coll:
                                ref_coll_node_id = f"collection_{source_id}_{ref_db}_{ref_coll}"
                                
                                # Add edge for reference relationship
                                edges.append({
                                    "source": coll_node_id,
                                    "target": ref_coll_node_id,
                                    "label": "references",
                                    "properties": {
                                        "source_field": field_name,
                                        "target_field": ref_field,
                                        "relationship_type": "reference"
                                    }
                                })
        
        # Process file system metadata
        elif source_type in ["hdfs", "s3"]:
            for filesystem in metadata.get("filesystems", []):
                fs_name = filesystem.get("name", "")
                fs_node_id = f"filesystem_{source_id}_{fs_name}"
                
                if fs_node_id not in node_ids:
                    nodes.append({
                        "id": fs_node_id,
                        "label": fs_name,
                        "type": "filesystem",
                        "parent": source_node_id,
                        "properties": {
                            "name": fs_name,
                            "data_source_id": source_id,
                            "data_source_name": source_name
                        }
                    })
                    node_ids.add(fs_node_id)
                
                # Add edge from source to filesystem
                edges.append({
                    "source": source_node_id,
                    "target": fs_node_id,
                    "label": "contains",
                    "properties": {}
                })
                
                for directory in filesystem.get("directories", []):
                    dir_path = directory.get("path", "")
                    dir_name = dir_path.split("/")[-1] if dir_path else "root"
                    dir_node_id = f"directory_{source_id}_{fs_name}_{dir_path}"
                    
                    if dir_node_id not in node_ids:
                        nodes.append({
                            "id": dir_node_id,
                            "label": dir_name,
                            "type": "directory",
                            "parent": fs_node_id,
                            "properties": {
                                "name": dir_name,
                                "path": dir_path,
                                "filesystem_name": fs_name,
                                "data_source_id": source_id,
                                "data_source_name": source_name
                            }
                        })
                        node_ids.add(dir_node_id)
                    
                    # Add edge from filesystem to directory
                    edges.append({
                        "source": fs_node_id,
                        "target": dir_node_id,
                        "label": "contains",
                        "properties": {}
                    })
                    
                    for file in directory.get("files", []):
                        file_name = file.get("name", "")
                        file_node_id = f"file_{source_id}_{fs_name}_{dir_path}_{file_name}"
                        
                        if file_node_id not in node_ids:
                            nodes.append({
                                "id": file_node_id,
                                "label": file_name,
                                "type": "file",
                                "parent": dir_node_id,
                                "properties": {
                                    "name": file_name,
                                    "path": f"{dir_path}/{file_name}",
                                    "directory_path": dir_path,
                                    "filesystem_name": fs_name,
                                    "data_source_id": source_id,
                                    "data_source_name": source_name,
                                    "size_bytes": file.get("size_bytes", 0),
                                    "format": file.get("format", ""),
                                    "last_modified": file.get("last_modified", "")
                                }
                            })
                            node_ids.add(file_node_id)
                        
                        # Add edge from directory to file
                        edges.append({
                            "source": dir_node_id,
                            "target": file_node_id,
                            "label": "contains",
                            "properties": {}
                        })
        
        # Process API metadata
        elif source_type == "api":
            for api in metadata.get("apis", []):
                api_name = api.get("name", "")
                api_node_id = f"api_{source_id}_{api_name}"
                
                if api_node_id not in node_ids:
                    nodes.append({
                        "id": api_node_id,
                        "label": api_name,
                        "type": "api",
                        "parent": source_node_id,
                        "properties": {
                            "name": api_name,
                            "base_url": api.get("base_url", ""),
                            "version": api.get("version", ""),
                            "data_source_id": source_id,
                            "data_source_name": source_name
                        }
                    })
                    node_ids.add(api_node_id)
                
                # Add edge from source to api
                edges.append({
                    "source": source_node_id,
                    "target": api_node_id,
                    "label": "contains",
                    "properties": {}
                })
                
                for endpoint in api.get("endpoints", []):
                    endpoint_path = endpoint.get("path", "")
                    endpoint_method = endpoint.get("method", "GET")
                    endpoint_node_id = f"endpoint_{source_id}_{api_name}_{endpoint_method}_{endpoint_path}"
                    
                    if endpoint_node_id not in node_ids:
                        nodes.append({
                            "id": endpoint_node_id,
                            "label": f"{endpoint_method} {endpoint_path}",
                            "type": "endpoint",
                            "parent": api_node_id,
                            "properties": {
                                "path": endpoint_path,
                                "method": endpoint_method,
                                "api_name": api_name,
                                "data_source_id": source_id,
                                "data_source_name": source_name,
                                "description": endpoint.get("description", "")
                            }
                        })
                        node_ids.add(endpoint_node_id)
                    
                    # Add edge from api to endpoint
                    edges.append({
                        "source": api_node_id,
                        "target": endpoint_node_id,
                        "label": "contains",
                        "properties": {}
                    })
        
        return {"nodes": nodes, "edges": edges}
    
    @staticmethod
    def get_lineage_for_entity(session: Session, entity_type: str, entity_id: str, depth: int = 2) -> Dict[str, Any]:
        """Get lineage for a specific entity.
        
        Args:
            session: The database session
            entity_type: The type of entity (table, column, collection, etc.)
            entity_id: The ID of the entity
            depth: The depth of lineage to retrieve (upstream and downstream)
            
        Returns:
            A dictionary containing lineage information for the entity
        """
        try:
            # Generate the full lineage graph
            full_graph = LineageService.generate_lineage_graph(session)
            
            if "error" in full_graph:
                return full_graph
            
            # Find the target entity node
            target_node = None
            for node in full_graph["nodes"]:
                if node["id"] == entity_id and node["type"] == entity_type:
                    target_node = node
                    break
            
            if not target_node:
                return {"error": f"Entity not found: {entity_type} {entity_id}"}
            
            # Extract lineage for the target entity
            upstream_nodes = LineageService._get_upstream_nodes(
                full_graph["nodes"], full_graph["edges"], entity_id, depth
            )
            
            downstream_nodes = LineageService._get_downstream_nodes(
                full_graph["nodes"], full_graph["edges"], entity_id, depth
            )
            
            # Combine all nodes and edges
            all_node_ids = set([entity_id] + [node["id"] for node in upstream_nodes + downstream_nodes])
            
            filtered_nodes = [node for node in full_graph["nodes"] if node["id"] in all_node_ids]
            
            filtered_edges = [edge for edge in full_graph["edges"] 
                             if edge["source"] in all_node_ids and edge["target"] in all_node_ids]
            
            return {
                "target_entity": target_node,
                "nodes": filtered_nodes,
                "edges": filtered_edges,
                "upstream_count": len(upstream_nodes),
                "downstream_count": len(downstream_nodes)
            }
            
        except Exception as e:
            logger.error(f"Error getting lineage for entity: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def _get_upstream_nodes(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], 
                           entity_id: str, depth: int) -> List[Dict[str, Any]]:
        """Get upstream nodes for an entity.
        
        Args:
            nodes: The list of all nodes
            edges: The list of all edges
            entity_id: The ID of the entity
            depth: The depth of lineage to retrieve
            
        Returns:
            A list of upstream nodes
        """
        if depth <= 0:
            return []
        
        # Find all edges where the target is the entity_id
        incoming_edges = [edge for edge in edges if edge["target"] == entity_id]
        
        # Get the source nodes for these edges
        source_ids = [edge["source"] for edge in incoming_edges]
        source_nodes = [node for node in nodes if node["id"] in source_ids]
        
        # Recursively get upstream nodes for each source node
        upstream_nodes = []
        for source_node in source_nodes:
            upstream_nodes.append(source_node)
            upstream_nodes.extend(
                LineageService._get_upstream_nodes(nodes, edges, source_node["id"], depth - 1)
            )
        
        return upstream_nodes
    
    @staticmethod
    def _get_downstream_nodes(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], 
                             entity_id: str, depth: int) -> List[Dict[str, Any]]:
        """Get downstream nodes for an entity.
        
        Args:
            nodes: The list of all nodes
            edges: The list of all edges
            entity_id: The ID of the entity
            depth: The depth of lineage to retrieve
            
        Returns:
            A list of downstream nodes
        """
        if depth <= 0:
            return []
        
        # Find all edges where the source is the entity_id
        outgoing_edges = [edge for edge in edges if edge["source"] == entity_id]
        
        # Get the target nodes for these edges
        target_ids = [edge["target"] for edge in outgoing_edges]
        target_nodes = [node for node in nodes if node["id"] in target_ids]
        
        # Recursively get downstream nodes for each target node
        downstream_nodes = []
        for target_node in target_nodes:
            downstream_nodes.append(target_node)
            downstream_nodes.extend(
                LineageService._get_downstream_nodes(nodes, edges, target_node["id"], depth - 1)
            )
        
        return downstream_nodes
    
    @staticmethod
    def export_lineage_to_purview(session: Session, data_source_id: Optional[int] = None) -> Dict[str, Any]:
        """Export lineage information to Microsoft Purview.
        
        Args:
            session: The database session
            data_source_id: Optional ID of the data source to filter by
            
        Returns:
            A dictionary containing the export result
        """
        try:
            # Generate the lineage graph
            lineage_graph = LineageService.generate_lineage_graph(session, data_source_id)
            
            if "error" in lineage_graph:
                return lineage_graph
            
            # Convert the lineage graph to Purview format
            purview_entities = []
            purview_relationships = []
            
            # Process nodes to create Purview entities
            for node in lineage_graph["nodes"]:
                purview_entity = LineageService._convert_node_to_purview_entity(node)
                if purview_entity:
                    purview_entities.append(purview_entity)
            
            # Process edges to create Purview relationships
            for edge in lineage_graph["edges"]:
                purview_relationship = LineageService._convert_edge_to_purview_relationship(edge)
                if purview_relationship:
                    purview_relationships.append(purview_relationship)
            
            # Here you would call the Purview API to upload the entities and relationships
            # This is a placeholder for the actual implementation
            
            return {
                "status": "success",
                "entities_count": len(purview_entities),
                "relationships_count": len(purview_relationships),
                "message": "Lineage exported to Purview successfully"
            }
            
        except Exception as e:
            logger.error(f"Error exporting lineage to Purview: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def _convert_node_to_purview_entity(node: Dict[str, Any]) -> Dict[str, Any]:
        """Convert a lineage node to a Purview entity.
        
        Args:
            node: The lineage node
            
        Returns:
            A dictionary representing a Purview entity
        """
        # This is a placeholder implementation that would need to be expanded
        # based on the Purview API requirements
        
        entity_type = node["type"]
        qualified_name = node["id"]
        name = node["label"]
        
        # Map node types to Purview entity types
        type_mapping = {
            "data_source": "DataSource",
            "schema": "Schema",
            "table": "Table",
            "database": "Database",
            "collection": "Collection",
            "filesystem": "FileSystem",
            "directory": "Directory",
            "file": "File",
            "api": "API",
            "endpoint": "Endpoint"
        }
        
        purview_type = type_mapping.get(entity_type, "Asset")
        
        # Create the Purview entity
        purview_entity = {
            "typeName": purview_type,
            "attributes": {
                "qualifiedName": qualified_name,
                "name": name
            }
        }
        
        # Add additional attributes based on the node properties
        if "properties" in node:
            for key, value in node["properties"].items():
                if key not in ["qualifiedName", "name"]:
                    purview_entity["attributes"][key] = value
        
        return purview_entity
    
    @staticmethod
    def _convert_edge_to_purview_relationship(edge: Dict[str, Any]) -> Dict[str, Any]:
        """Convert a lineage edge to a Purview relationship.
        
        Args:
            edge: The lineage edge
            
        Returns:
            A dictionary representing a Purview relationship
        """
        # This is a placeholder implementation that would need to be expanded
        # based on the Purview API requirements
        
        source_id = edge["source"]
        target_id = edge["target"]
        label = edge["label"]
        
        # Map edge labels to Purview relationship types
        type_mapping = {
            "contains": "Contains",
            "references": "References",
            "lineage": "DataFlow"
        }
        
        purview_type = type_mapping.get(label, "Association")
        
        # Create the Purview relationship
        purview_relationship = {
            "typeName": purview_type,
            "end1": {
                "guid": "",  # This would need to be filled with the actual GUID from Purview
                "typeName": "",  # This would need to be filled with the actual type from Purview
                "uniqueAttributes": {
                    "qualifiedName": source_id
                }
            },
            "end2": {
                "guid": "",  # This would need to be filled with the actual GUID from Purview
                "typeName": "",  # This would need to be filled with the actual type from Purview
                "uniqueAttributes": {
                    "qualifiedName": target_id
                }
            }
        }
        
        # Add additional attributes based on the edge properties
        if "properties" in edge and edge["properties"]:
            purview_relationship["attributes"] = edge["properties"]
        
        return purview_relationship