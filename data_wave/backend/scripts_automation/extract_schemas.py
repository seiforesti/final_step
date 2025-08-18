import os
import requests
from dotenv import load_dotenv

load_dotenv()

IN_DOCKER = os.getenv("IN_DOCKER", "0").strip() == "1"
BASE_URL = os.getenv("DOCKER_BASE_URL") if IN_DOCKER else os.getenv("BASE_URL")

if not BASE_URL:
    raise ValueError("❌ BASE_URL non défini. Vérifie ton .env")

USERNAME = os.getenv("USERNAME", "admin")
PASSWORD = os.getenv("PASSWORD", "admin123")

try:
    auth_response = requests.post(
        f"{BASE_URL}/token",
        data={"username": USERNAME, "password": PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    if auth_response.status_code != 200:
        print("❌ Auth échouée:", auth_response.text)
        exit()

    token = auth_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

except Exception as e:
    print("❌ Erreur de connexion:", e)
    exit()

endpoints = {
    "mysql": f"{BASE_URL}/extract/mysql",
    "postgresql": f"{BASE_URL}/extract/postgresql",
    "mongodb": f"{BASE_URL}/extract/mongodb"
}

connections = {
    "mysql": {
        "database_type": "mysql",
        "connection_uri": "mysql+pymysql://root:root@mysql-server:3306/testdb"
    },
    "postgresql": {
        "database_type": "postgresql",
        "connection_uri": "postgresql+psycopg2://admin:admin@postgres-server:5432/testdb"
    },
    "mongodb": {
        "database_type": "mongodb",
        "connection_uri": "mongodb://admin:admin@mongo-server:27017",
        "database_name": "testdb"
    }
}

for db_type, endpoint in endpoints.items():
    print(f"\n🗂️  Extraction du schéma pour : {db_type}")
    response = requests.post(endpoint, json=connections[db_type], headers=headers)
    if response.status_code == 200:
        print(f"✅ Extraction réussie : {response.json()}")
    else:
        print(f"❌ Échec [{response.status_code}] : {response.text}")

# After extraction, update data sensitivity labels in DB
# update_response = requests.post(f"{BASE_URL}/classify/update_sensitivity_labels", headers=headers)
# if update_response.status_code == 200:
#     print("✅ Data sensitivity labels updated successfully.")
# else:
#     print(f"❌ Failed to update data sensitivity labels: {update_response.text}")

print("\n🔍 Vérification des colonnes classifiées:")
response = requests.get(f"{BASE_URL}/classified", headers=headers)

if response.status_code == 200:
    classified = response.json()
    for entry in classified:
        print(f"📌 {entry['table_name']}.{entry['column_name']} ➜ {entry['categories']}")
else:
    print("❌ Impossible de récupérer les colonnes classifiées:", response.text)

# 🌍 Charger .env
load_dotenv()

print("DEBUG ENV VARS:")
print("IN_DOCKER =", os.getenv("IN_DOCKER"))
print("BASE_URL =", os.getenv("BASE_URL"))
print("DOCKER_BASE_URL =", os.getenv("DOCKER_BASE_URL"))
# 🌐 Détection de contexte
IN_DOCKER = os.getenv("IN_DOCKER", "0").strip() == "1"
BASE_URL = os.getenv("DOCKER_BASE_URL") if IN_DOCKER else os.getenv("BASE_URL")

# 🐞 Debug
print(f"DEBUG - .env loaded: IN_DOCKER={IN_DOCKER}, BASE_URL={BASE_URL}")

if not BASE_URL:
    raise ValueError("❌ BASE_URL non défini. Vérifie ton .env")

USERNAME = os.getenv("USERNAME", "admin")
PASSWORD = os.getenv("PASSWORD", "admin123")

# 🛂 Auth automatique
try:
    auth_response = requests.post(
        f"{BASE_URL}/token",
        data={"username": USERNAME, "password": PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    if auth_response.status_code != 200:
        print("❌ Auth échouée:", auth_response.text)
        exit()

    token = auth_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

except Exception as e:
    print("❌ Erreur de connexion:", e)
    exit()

# 📦 Endpoints
endpoints = {
    "mysql": f"{BASE_URL}/extract/mysql",
    "postgresql": f"{BASE_URL}/extract/postgresql",
    "mongodb": f"{BASE_URL}/extract/mongodb"
}

# 🔗 Connexions DB
connections = {
    "mysql": {
        "database_type": "mysql",
        "connection_uri": "mysql+pymysql://root:root@mysql-server:3306/testdb"
    },
    "postgresql": {
        "database_type": "postgresql",
        "connection_uri": "postgresql+psycopg2://admin:admin@postgres-server:5432/testdb"
    },
    "mongodb": {
        "database_type": "mongodb",
        "connection_uri": "mongodb://admin:admin@mongo-server:27017",
        "database_name": "testdb"
    }
}

# 🚀 Lancer extraction
for db_type, endpoint in endpoints.items():
    print(f"\n🗂️  Extraction du schéma pour : {db_type}")
    response = requests.post(endpoint, json=connections[db_type], headers=headers)
    if response.status_code == 200:
        print(f"✅ Extraction réussie : {response.json()}")
    else:
        print(f"❌ Échec [{response.status_code}] : {response.text}")


# 🔎 Vérifier ce qui a été classifié
print("\n🔍 Vérification des colonnes classifiées:")
response = requests.get(f"{BASE_URL}/classified", headers=headers)

if response.status_code == 200:
    classified = response.json()
    for entry in classified:
        print(f"📌 {entry['table_name']}.{entry['column_name']} ➜ {entry['categories']}")
else:
    print("❌ Impossible de récupérer les colonnes classifiées:", response.text)
