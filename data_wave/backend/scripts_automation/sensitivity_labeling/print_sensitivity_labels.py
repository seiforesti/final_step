import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sensitivity_labeling.models import SensitivityLabel

# Use the same DATABASE_URL as your API and seed script
DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://admin:admin@metadata-db:5432/schema_metadata"

def print_labels():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    labels = session.query(SensitivityLabel).all()
    print(f"Found {len(labels)} labels:")
    for label in labels:
        print(f"- {label.id}: {label.name} ({label.description})")
    session.close()

if __name__ == "__main__":
    print_labels()
