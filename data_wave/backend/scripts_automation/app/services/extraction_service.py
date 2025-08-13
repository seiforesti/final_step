from sqlalchemy import create_engine, inspect
from pymongo import MongoClient
from app.db_session import get_session
# from app.models.schema_models import DataTableSchema, SchemaVersion
from sqlmodel import Session
from uuid import uuid4

# ✅ Classificateurs
from app.api.classifiers.regex_classifier import RegexClassifier
from app.api.classifiers.dictionary_classifier import DictionaryClassifier
from app.api.classifiers.hybrid_classifier import HybridClassifier
from app.services.data_sensitivity_service import assign_data_sensitivity_label, update_all_columns_data_sensitivity

regex_classifier = RegexClassifier()
dictionary_classifier = DictionaryClassifier()
hybrid_classifier = HybridClassifier(use_ml=True, verbose=False)  # Activer ML ici

# ✅ Fonction de classification et stockage des 3 résultats
def classify_and_store_all(
    session: Session,
    db_type: str,
    table_name: str,
    column_name: str,
    data_type: str,
    nullable: bool
):
    """
    Applies the 3 classifiers: regex, dictionary, hybrid (ML) separately.
    This function now only returns classification results without adding new DB entries.
    """
    import logging
    logger = logging.getLogger("extraction_service")

    # Classify with regex
    regex_cats = regex_classifier.classify(column_name)
    categories_regex = ", ".join(regex_cats) if regex_cats else "Unclassified [Regex]"

    # Classify with dictionary
    dict_cats = dictionary_classifier.classify(column_name)
    categories_dict = ", ".join(dict_cats) if dict_cats else "Unclassified [Dictionary]"

    # Classify with hybrid
    hybrid_cats = hybrid_classifier.classify(column_name)
    categories_hybrid = ", ".join(hybrid_cats) if hybrid_cats else "Unclassified [Hybrid]"

    logger.info(f"Column {column_name} regex categories: {categories_regex}")
    logger.info(f"Column {column_name} dictionary categories: {categories_dict}")
    logger.info(f"Column {column_name} hybrid categories: {categories_hybrid}")

    return categories_regex, categories_dict, categories_hybrid

def upsert_column_classification(
    session: Session,
    db_type: str,
    table_name: str,
    column_name: str,
    data_type: str,
    nullable: bool
):
    """
    Upsert a column classification entry for each classifier type.
    """
    import logging
    logger = logging.getLogger("extraction_service")

    categories_regex, categories_dict, categories_hybrid = classify_and_store_all(
        session, db_type, table_name, column_name, data_type, nullable
    )

    # Upsert regex classification
    entry_regex = session.query(DataTableSchema).filter_by(
        database_type=db_type,
        table_name=table_name,
        column_name=column_name,
        categories=categories_regex
    ).first()
    if entry_regex:
        entry_regex.data_type = data_type
        entry_regex.nullable = nullable
        entry_regex.categories = categories_regex
        assign_data_sensitivity_label(session, entry_regex)
        logger.info(f"Updated regex entry for {column_name} with categories: {categories_regex}")
    else:
        new_entry = DataTableSchema(
            database_type=db_type,
            table_name=table_name,
            column_name=column_name,
            data_type=data_type,
            nullable=nullable,
            categories=categories_regex
        )
        session.add(new_entry)
        session.flush()
        assign_data_sensitivity_label(session, new_entry)
        logger.info(f"Inserted regex entry for {column_name} with categories: {categories_regex}")

    # Upsert dictionary classification
    entry_dict = session.query(DataTableSchema).filter_by(
        database_type=db_type,
        table_name=table_name,
        column_name=column_name,
        categories=categories_dict
    ).first()
    if entry_dict:
        entry_dict.data_type = data_type
        entry_dict.nullable = nullable
        entry_dict.categories = categories_dict
        assign_data_sensitivity_label(session, entry_dict)
        logger.info(f"Updated dictionary entry for {column_name} with categories: {categories_dict}")
    else:
        new_entry = DataTableSchema(
            database_type=db_type,
            table_name=table_name,
            column_name=column_name,
            data_type=data_type,
            nullable=nullable,
            categories=categories_dict
        )
        session.add(new_entry)
        session.flush()
        assign_data_sensitivity_label(session, new_entry)
        logger.info(f"Inserted dictionary entry for {column_name} with categories: {categories_dict}")

    # Upsert hybrid classification
    entry_hybrid = session.query(DataTableSchema).filter_by(
        database_type=db_type,
        table_name=table_name,
        column_name=column_name,
        categories=categories_hybrid
    ).first()
    if entry_hybrid:
        entry_hybrid.data_type = data_type
        entry_hybrid.nullable = nullable
        entry_hybrid.categories = categories_hybrid
        assign_data_sensitivity_label(session, entry_hybrid)
        logger.info(f"Updated hybrid entry for {column_name} with categories: {categories_hybrid}")
    else:
        new_entry = DataTableSchema(
            database_type=db_type,
            table_name=table_name,
            column_name=column_name,
            data_type=data_type,
            nullable=nullable,
            categories=categories_hybrid
        )
        session.add(new_entry)
        session.flush()
        assign_data_sensitivity_label(session, new_entry)
        logger.info(f"Inserted hybrid entry for {column_name} with categories: {categories_hybrid}")


# ✅ Extraction SQL
def extract_sql_schema(db_uri: str, db_type: str):
    try:
        print(f"🔌 Connecting to {db_type} database...")
        engine = create_engine(db_uri)
        inspector = inspect(engine)
        with get_session() as session:
            print(f"📦 Extracting tables from {db_type}...")
            for table_name in inspector.get_table_names():
                for column in inspector.get_columns(table_name):
                    print(f"➡️ Processing table: {table_name}, column: {column['name']}")
                    # Check if entry exists
                    existing_entries = session.query(DataTableSchema).filter(
                        DataTableSchema.database_type == db_type,
                        DataTableSchema.table_name == table_name,
                        DataTableSchema.column_name == column["name"]
                    ).all()
                    if existing_entries:
                        # Update existing entries
                        for entry in existing_entries:
                            entry.data_type = str(column["type"])
                            entry.nullable = column["nullable"]
                            # Re-classify and assign categories and sensitivity label
                            classify_and_store_all(
                                session=session,
                                db_type=db_type,
                                table_name=table_name,
                                column_name=column["name"],
                                data_type=str(column["type"]),
                                nullable=column["nullable"]
                            )
                    else:
                        # Insert new entry
                        classify_and_store_all(
                            session=session,
                            db_type=db_type,
                            table_name=table_name,
                            column_name=column["name"],
                            data_type=str(column["type"]),
                            nullable=column["nullable"]
                        )

            # Update all data sensitivity labels after extraction/classification
            update_all_columns_data_sensitivity(session)

            session.commit()
            print(f"✅ Schema extraction for {db_type} complete.")
            return f"✅ Schema extraction for {db_type} complete."

    except Exception as e:
        print(f"❌ Failed to extract schema from {db_type}: {e}")
        return f"❌ Failed to extract schema from {db_type}: {e}"

# ✅ Extraction MongoDB
def extract_mongo_schema(connection_uri: str, database_name: str):
    try:
        print("🔌 Connecting to MongoDB database...")
        client = MongoClient(connection_uri)
        db = client[database_name]
        with get_session() as session:
            print("📦 Extracting collections from MongoDB...")
            for collection_name in db.list_collection_names():
                print(f"➡️ Processing collection: {collection_name}")
                doc = db[collection_name].find_one()
                if doc:
                    for key, value in doc.items():
                        print(f"🔍 Processing field: {key} => {type(value).__name__}")
                        classify_and_store_all(
                            session=session,
                            db_type="mongodb",
                            table_name=collection_name,
                            column_name=key,
                            data_type=type(value).__name__,
                            nullable=True
                        )

            # Update all data sensitivity labels after extraction/classification
            update_all_columns_data_sensitivity(session)

            session.commit()
            print("✅ Schema extraction for MongoDB complete.")
            return "✅ Schema extraction for MongoDB complete."

    except Exception as e:
        print(f"❌ Failed to extract schema from MongoDB: {e}")
        return f"❌ Failed to extract schema from MongoDB: {e}"

# ✅ Enregistrer la version de l’extraction
def add_schema_version_entry(session: Session, db_uri: str, db_type: str):
    version_entry = SchemaVersion(
        source=db_uri,
        version_id=str(uuid4()),
        database_type=db_type,
    )
    session.add(version_entry)

def classify_and_store_all(
    session: Session,
    db_type: str,
    table_name: str,
    column_name: str,
    data_type: str,
    nullable: bool
):
    classifiers = [
        ("Regex", regex_classifier.classify(column_name)),
        ("Dictionary", dictionary_classifier.classify(column_name)),
        ("Hybrid", hybrid_classifier.classify(column_name)),
    ]
    for label, cats in classifiers:
        categories = ", ".join(cats) if cats else f"Unclassified [{label}]"
        # Vérifier si l'entrée existe déjà
        exists = session.query(DataTableSchema).filter_by(
            database_type=db_type,
            table_name=table_name,
            column_name=column_name,
            categories=categories
        ).first()
        if not exists:
            schema_entry = DataTableSchema(
                database_type=db_type,
                table_name=table_name,
                column_name=column_name,
                data_type=data_type,
                nullable=nullable,
                categories=categories
            )
            session.add(schema_entry)
        # Sinon, ne rien faire (pas de doublon)
