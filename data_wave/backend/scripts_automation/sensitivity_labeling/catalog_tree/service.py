from typing import List, Dict, Any
from sqlmodel import Session, select
from app.models.schema_models import DataTableSchema
from fastapi import APIRouter, Depends
from app.db_session import get_session

router = APIRouter()

# Catalog node structure for frontend
# type: "workspace" | "schema" | "server" | "database" | "table" | "folder"
def build_catalog_tree(session: Session) -> List[Dict[str, Any]]:
    # Query all schema entries
    entries = session.exec(select(DataTableSchema)).all()
    if not entries:
        return []

    # Organize by workspace > public > server > database > table
    tree = {}
    for entry in entries:
        # Use a real workspace field if present, else default to 'default_workspace'
        workspace = getattr(entry, 'workspace', None) or 'default_workspace'
        public = 'public'
        db = getattr(entry, 'database_name', None) or 'default_db'
        server = entry.database_type
        table = entry.table_name
        # Build tree
        if workspace not in tree:
            tree[workspace] = {}
        if public not in tree[workspace]:
            tree[workspace][public] = {}
        if server not in tree[workspace][public]:
            tree[workspace][public][server] = {}
        if db not in tree[workspace][public][server]:
            tree[workspace][public][server][db] = set()
        tree[workspace][public][server][db].add(table)

    # Build tree structure for frontend
    catalog = []
    for workspace, publics in tree.items():
        workspace_node = {
            "label": workspace,
            "type": "workspace",
            "children": []
        }
        for public, servers in publics.items():
            public_node = {
                "label": public,
                "type": "folder",
                "children": []
            }
            for server, dbs in servers.items():
                server_node = {
                    "label": server,
                    "type": "server",
                    "children": []
                }
                for db, tables in dbs.items():
                    db_node = {
                        "label": db,
                        "type": "database",
                        "children": []
                    }
                    for table in tables:
                        db_node["children"].append({
                            "label": table,
                            "type": "table"
                        })
                    server_node["children"].append(db_node)
                public_node["children"].append(server_node)
            workspace_node["children"].append(public_node)
        catalog.append(workspace_node)
    return catalog

# ML suggestion endpoint removed. Only catalog tree logic remains.
