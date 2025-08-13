from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db_session import get_session
from .service import build_catalog_tree

router = APIRouter(prefix="/api/catalog", tags=["Catalog"])

@router.get("/tree")
def get_catalog_tree(session: Session = Depends(get_session)):
    """
    Returns the catalog tree for all servers, databases, and tables.
    """
    return build_catalog_tree(session)
