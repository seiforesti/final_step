# ✅ watcher_and_dynamic_trainer.py
import os
import time
import requests
import pandas as pd
import sqlalchemy
from sqlmodel import Session, select
from sqlmodel import Session
from app.models.schema_models import DataTableSchema
from app.db_session import get_session
from dotenv import load_dotenv

load_dotenv()

# 🔄 Paramètres
TRAINING_CSV = "app/api/classifiers/ml_models/data/training_data.csv"
ML_RETRAIN_ENDPOINT = os.getenv("ML_RETRAIN_ENDPOINT", "http://localhost:8000/ml/retrain")
DB_URL = os.getenv("DB_URL", "postgresql://admin:admin@metadata-db:5432/schema_metadata")

# Validate DB_URL hostname
from urllib.parse import urlparse
parsed_url = urlparse(DB_URL)
hostname = parsed_url.hostname
if not hostname or hostname == "..." or hostname.strip() == "":
    raise ValueError(f"Invalid database hostname in DB_URL: '{hostname}'")
WATCH_INTERVAL = 5  # secondes

# 🧠 Mémorisation timestamp
def get_last_modified(path):
    try:
        return os.path.getmtime(path)
    except FileNotFoundError:
        return 0

# ✅ Charger les colonnes classifiées depuis la base de données
CATEGORIES = ["PII", "Sensitive", "Financial", "Transaction", "Unclassified"]
def extract_classified_to_csv():
    print("🔁 Mise à jour training_data.csv depuis metadata DB...")
    session = get_session()
    results = session.exec(select(DataTableSchema).where(DataTableSchema.categories != None)).all()
    rows = []
    for row in results:
        if not row.categories:
            continue
        for cat in CATEGORIES:
            if cat in row.categories:
                rows.append({"column_name": row.column_name, "category": cat})
                break
    if rows:
        df = pd.DataFrame(rows)
        df.drop_duplicates(inplace=True)
        df.to_csv(TRAINING_CSV, index=False)
        print(f"✅ {len(df)} lignes écrites dans {TRAINING_CSV}")
    else:
        print("⚠️ Aucune donnée classifiée disponible pour l'export.")

# 🚨 Lancement Entraînement
def retrain_model():
    print("🚀 Relance de l'entraînement via API /ml/retrain...")
    try:
        response = requests.post(ML_RETRAIN_ENDPOINT)
        if response.status_code == 200:
            print("✅ Modèle réentraîné avec succès.")
        else:
            print(f"❌ Erreur entrainement ML: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception API retrain: {e}")

# 🔁 Boucle d'observation
print("👀 Watcher démarré...")
last_modified = get_last_modified(TRAINING_CSV)
extract_classified_to_csv()
retrain_model()

while True:
    time.sleep(WATCH_INTERVAL)
    current_mtime = get_last_modified(TRAINING_CSV)
    if current_mtime != last_modified:
        print("📝 training_data.csv modifié => re-train...")
        last_modified = current_mtime
        retrain_model()

    # Optionnel : detecter aussi mise à jour BDD => recharger CSV
    # Vérifier si le nombre de lignes classifiées a changé dans la base de données
    try:
        session = get_session()
        current_count = len(session.exec(select(DataTableSchema).where(DataTableSchema.categories != None)).all())
        if 'old_count' not in locals():
            old_count = current_count  # Initialiser old_count au démarrage
        if current_count != old_count:
            print("📝 Changement détecté dans la base de données => mise à jour CSV et re-train...")
            old_count = current_count
            extract_classified_to_csv()
            retrain_model()
    except Exception as e:
        print(f"❌ Exception lors de la vérification de la base de données : {e}")
