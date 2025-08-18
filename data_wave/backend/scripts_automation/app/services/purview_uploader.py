### === backend/app/services/purview_uploader.py ===
from pyapacheatlas.core import PurviewClient, AtlasEntity
from app.core.config import settings
from app.core.security import get_auth


def convert_to_entity(table_obj):
    table_name = table_obj["table"]
    columns = table_obj["columns"]
    qualified_name = f"{settings.PURVIEW_NAME}.{table_name}"

    return AtlasEntity(
        name=table_name,
        typeName="azure_sql_table",  # You can customize this if needed
        qualifiedName=qualified_name,
        attributes={
            "name": table_name,
            "qualifiedName": qualified_name,
            "columns": [col["column"] for col in columns],
            "description": f"Imported from external DB by PurSight"
        }
    )


def upload_metadata_batch(payload: dict):
    entities = []
    for table in payload.get("classified", []):
        entity = convert_to_entity(table)
        entities.append(entity)

    client = PurviewClient(
        account_name=settings.PURVIEW_NAME,
        authentication=get_auth()
    )

    results = client.upload_entities(batch=entities)
    return {"upload_result": results}
