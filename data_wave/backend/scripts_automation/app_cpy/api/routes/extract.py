from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, or_, select, text
from app.models.schema_models import DataTableSchema, ExtractionRequest
from app.services.extraction_service import (
    extract_sql_schema,
    extract_mongo_schema,
    classify_and_store_all
)
from app.db_session import get_session
# Back-compat import shim: prefer dedicated export_service; fallback will be provided if needed
from app.services.export_service import export_schema_to_csv
from app.api.security.auth import get_current_user_role
from app.api.security.auth import authenticate_user, create_access_token
from app.services.auth_service import get_session_by_token
from fastapi import Cookie
from app.models.auth_models import User

# Try to import from local sensitivity_labeling module
try:
    from sensitivity_labeling import crud as label_crud, models as label_models
except ImportError:
    # Fallback: try relative import or define stubs for dev/testing
    label_crud = None
    label_models = None
    # Optionally, log a warning here

def check_access(user: User, object_type: str, object_id: str, db):
    if not label_crud or not label_models:
        # Fallback: allow all if sensitivity labeling is not available
        return True
    proposals = db.query(label_models.LabelProposal).filter(
        label_models.LabelProposal.object_type == object_type,
        label_models.LabelProposal.object_id == object_id,
        label_models.LabelProposal.status == label_models.LabelStatus.APPROVED
    ).all()
    for proposal in proposals:
        label = label_crud.get_label(db, proposal.label_id)
        if label and label.name.lower() == "highly sensitive":
            if not getattr(user, "can_access_highly_sensitive", False):
                return False
    return True

router = APIRouter()

# === Extraction SQL ===
@router.post("/extract/mysql", response_model=str)
def extract_mysql_schema(request: ExtractionRequest, role: str = Depends(get_current_user_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can extract schemas.")
    if request.database_type.lower() != "mysql":
        raise HTTPException(status_code=400, detail="Invalid database type for this route")
    message = extract_sql_schema(request.connection_uri, "mysql")
    # After extraction, assign data sensitivity labels
    with get_session() as session:
        from app.services.data_sensitivity_service import update_all_columns_data_sensitivity
        update_all_columns_data_sensitivity(session)
    return message

@router.post("/extract/postgresql", response_model=str)
def extract_postgresql_schema(request: ExtractionRequest, role: str = Depends(get_current_user_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can extract schemas.")
    if request.database_type.lower() != "postgresql":
        raise HTTPException(status_code=400, detail="Invalid database type for this route")
    message = extract_sql_schema(request.connection_uri, "postgresql")
    with get_session() as session:
        from app.services.data_sensitivity_service import update_all_columns_data_sensitivity
        update_all_columns_data_sensitivity(session)
    return message

# === Extraction MongoDB ===
@router.post("/extract/mongodb", response_model=str)
def extract_mongodb_schema(request: ExtractionRequest, role: str = Depends(get_current_user_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can extract schemas.")
    if request.database_type.lower() != "mongodb":
        raise HTTPException(status_code=400, detail="Invalid database type for this route")
    if not request.database_name:
        raise HTTPException(status_code=400, detail="Database name is required for MongoDB")
    message = extract_mongo_schema(request.connection_uri, request.database_name)
    with get_session() as session:
        from app.services.data_sensitivity_service import update_all_columns_data_sensitivity
        update_all_columns_data_sensitivity(session)
    return message

# === Search schemas (fuzzy + normal) ===
@router.get("/search/fuzzy")
def fuzzy_search(query: str):
    with get_session() as session:
        result = session.execute(
            text("""
                SELECT * FROM datatableschema 
                WHERE table_name % :q OR column_name % :q
            """), {"q": query}
        ).fetchall()
        return result

@router.get("/search")
def search_schema(query: str, session: Session = Depends(get_session)):
    results = session.execute(
        select(DataTableSchema).where(
            or_(
                DataTableSchema.table_name.ilike(f"%{query}%"),
                DataTableSchema.column_name.ilike(f"%{query}%")
            )
        )
    ).all()
    return results

# === Filtered classification ===
@router.get("/classified")
def get_all_classified_columns(session: Session = Depends(get_session)):
    return session.execute(
        select(DataTableSchema).where(DataTableSchema.categories != None)
    ).all()

@router.get("/classified/hybrid")
def get_hybrid_classified_columns(session: Session = Depends(get_session)):
    return session.execute(
        select(DataTableSchema).where(DataTableSchema.categories.ilike("%[Hybrid]%"))
    ).all()

@router.get("/classified/regex")
def get_regex_classified_columns(session: Session = Depends(get_session)):
    return session.execute(
        select(DataTableSchema).where(DataTableSchema.categories.ilike("%[Regex]%"))
    ).all()

@router.get("/classified/dictionary")
def get_dict_classified_columns(session: Session = Depends(get_session)):
    return session.execute(
        select(DataTableSchema).where(DataTableSchema.categories.ilike("%[Dictionary]%"))
    ).all()

# === Export CSV ===
@router.get("/export/csv")
def export_csv():
    return export_schema_to_csv()

# === Auth ===
@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

# Example: Enforce access control on classified columns endpoint
@router.get("/classified/protected")
def get_protected_classified_columns(
    session: Session = Depends(get_session),
    session_token: str = Cookie(None)
):
    user = None
    if session_token:
        user_session = get_session_by_token(session, session_token)
        if user_session and user_session.user:
            user = user_session.user
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    all_classified = session.execute(
        select(DataTableSchema).where(DataTableSchema.categories != None)
    ).all()
    allowed = []
    for entry in all_classified:
        if check_access(user, "column", entry.column_name, session):
            allowed.append(entry)
    return allowed
