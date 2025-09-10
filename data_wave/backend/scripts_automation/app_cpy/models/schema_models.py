# Re-import necessary libraries after environment reset
import uuid
from sqlmodel import Boolean, Column, Integer, SQLModel, Field, String
from typing import List, Optional
from datetime import datetime

# # ✅ Model to store the structure of tables
# class DataTableSchema(SQLModel, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     database_type: str  # MySQL, PostgreSQL, MongoDB
#     table_name: str
#     column_name: str
#     data_type: str
#     nullable: bool
#     version_id: uuid.UUID = Field(default_factory=uuid.uuid4)
# ✅ Model to store the structure of tables
# class DataTableSchema(SQLModel, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     database_type: str
#     table_name: str
#     column_name: str
#     data_type: str
#     nullable: bool
#     categories: Optional[str] = None  # <== Nouveau champ pour les catégories
#     created_at: datetime = Field(default_factory=datetime.utcnow)


# ✅ Model for the extraction requests
class ExtractionRequest(SQLModel):
    database_type: str  # mysql, postgresql, mongodb
    connection_uri: str  # URI for DB connection
    database_name: Optional[str] = None
    schemas: Optional[List[str]] = None  # Pour PostgreSQL ou MySQL
    tables: Optional[List[str]] = None  # Tables spécifiques

# ✅ Model for responses
class SchemaResponse(SQLModel):
    table_name: str
    columns: list

# ✅ Model for a single column
class ColumnSchema(SQLModel):
    column_name: str
    data_type: str
    nullable: bool


class SchemaVersion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source: str  # URI or host
    version_id: str  # UUID or hash
    database_type: str
    extracted_at: datetime = Field(default_factory=datetime.utcnow)

# ✅ Table principale stockant les métadonnées
class DataTableSchema(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    database_type: str
    table_name: str
    column_name: str
    data_type: str
    nullable: bool
    categories: Optional[str] = None
    datasensitivitylabel: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def to_dict(self):
        return {
            "table_name": self.table_name,
            "column_name": self.column_name,
            "categories": self.categories,
            "datasensitivitylabel": self.datasensitivitylabel
        }
