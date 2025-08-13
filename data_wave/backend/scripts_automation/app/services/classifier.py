### === backend/app/services/classifier.py ===
from sqlalchemy import create_engine, inspect, text
import re
from app.core.config import settings

PATTERNS = {
    "credit_card": r"(?:\d[ -]*?){13,16}",
    "email": r"[\w\.-]+@[\w\.-]+",
    "phone": r"\+?[0-9][0-9\-\s]{8,15}",
    "ip_address": r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b",
    "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
    "full_name": r"^[A-Z][a-z]+\s[A-Z][a-z]+$",
}

NAME_HEURISTICS = {
    "email": ["email", "email_address"],
    "credit_card": ["creditcard", "cc", "card_number"],
    "phone": ["phone", "mobile"],
    "ssn": ["ssn", "socialsecurity"],
    "ip_address": ["ip", "ip_addr"],
    "full_name": ["name", "full_name", "firstname", "lastname"]
}


def classify_data_columns(db_url: str):
    engine = create_engine(db_url)
    inspector = inspect(engine)
    results = []

    with engine.connect() as conn:
        for table in inspector.get_table_names():
            classified_cols = []
            columns = inspector.get_columns(table)
            column_names = [col["name"] for col in columns]
            try:
                query = f"SELECT {', '.join(column_names)} FROM {table} LIMIT {settings.MAX_SCAN_ROWS}"
                rows = conn.execute(text(query)).fetchall()
            except Exception as e:
                continue

            for i, col in enumerate(columns):
                col_name = col["name"].lower()
                col_type = str(col["type"])
                col_values = [str(row[i]) for row in rows if row[i] is not None and str(row[i]).strip() != ""]
                col_classifications = []

                # Heuristic based on column names
                for label, keywords in NAME_HEURISTICS.items():
                    if any(k in col_name for k in keywords):
                        col_classifications.append(label)

                # Skip if no data to scan
                if not col_values:
                    continue

                # Regex pattern matching
                for label, pattern in PATTERNS.items():
                    if any(re.search(pattern, val) for val in col_values):
                        if label not in col_classifications:
                            col_classifications.append(label)

                classified_cols.append({
                    "column": col["name"],
                    "type": col_type,
                    "classifications": col_classifications
                })

            results.append({
                "table": table,
                "columns": classified_cols,
                "relationships": inspector.get_foreign_keys(table)
            })

    return {"classified": results}
