import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sensitivity_labeling.models import Base, SensitivityLabel
import datetime

# Update this with your actual database URL or use your .env loader if needed
DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://admin:admin@metadata-db:5432/schema_metadata"

def seed_labels():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    default_labels = [
        {"name": "PII", "description": "Personally Identifiable Information", "color": "#e57373"},
        {"name": "Sensitive", "description": "Sensitive data", "color": "#fbc02d"},
        {"name": "Financial", "description": "Financial data", "color": "#64b5f6"},
        {"name": "Confidential", "description": "Confidential information", "color": "#9575cd"},
        {"name": "Not Classified", "description": "Data not classified", "color": "#bdbdbd"},
        {"name": "Custom", "description": "Custom label", "color": "#81c784"},
    ]

    for label in default_labels:
        exists = session.query(SensitivityLabel).filter_by(name=label["name"]).first()
        if not exists:
            session.add(SensitivityLabel(
                name=label["name"],
                description=label["description"],
                color=label["color"],
                created_at=datetime.datetime.utcnow(),
                updated_at=datetime.datetime.utcnow(),
            ))
    session.commit()
    print("Seeded default sensitivity labels.")
    session.close()

if __name__ == "__main__":
    seed_labels()
