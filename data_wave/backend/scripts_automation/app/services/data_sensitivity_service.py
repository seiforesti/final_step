from typing import Optional
from app.models.schema_models import DataTableSchema
from app.db_session import get_session
from app.api.classifiers.data_sensitivity_classifier import classify_to_sensitivity

def assign_data_sensitivity_label(session: get_session, column: DataTableSchema) -> Optional[str]:
    """
    Assigns a data sensitivity label to a column based on its classification names.
    Updates the column.datasensitivitylabel field in the database.
    """
    import logging
    logger = logging.getLogger("data_sensitivity_service")
    if not column.categories:
        column.datasensitivitylabel = "Not Classified"
        session.add(column)
        logger.info(f"Column {column.column_name} has no categories, set label to Not Classified")
        return column.datasensitivitylabel

    # categories field may contain multiple classification names separated by commas
    category_list = [c.strip() for c in column.categories.split(",")]

    sensitivity_label = classify_to_sensitivity(category_list)
    column.datasensitivitylabel = sensitivity_label
    session.add(column)
    logger.info(f"Column {column.column_name} assigned sensitivity label: {sensitivity_label}")
    return sensitivity_label

def update_all_columns_data_sensitivity(session: get_session):
    """
    Updates the data sensitivity label for all columns in the DataTableSchema table.
    """
    columns = session.query(DataTableSchema).all()
    for column in columns:
        assign_data_sensitivity_label(session, column)
    session.commit()
