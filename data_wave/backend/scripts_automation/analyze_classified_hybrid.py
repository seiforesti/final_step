import os
import requests
import pandas as pd
from dotenv import load_dotenv

# === Configuration ===
load_dotenv()
BASE_URL = os.getenv("DOCKER_BASE_URL") if os.getenv("IN_DOCKER") == "1" else os.getenv("BASE_URL")
USERNAME = os.getenv("USERNAME", "admin")
PASSWORD = os.getenv("PASSWORD", "admin123")

# === Authentification ===
try:
    token_response = requests.post(
        f"{BASE_URL}/token",
        data={"username": USERNAME, "password": PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token_response.raise_for_status()
    token = token_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
except Exception as e:
    print("❌ Authentification failed:", e)
    exit(1)

# === Récupération des colonnes classifiées ===
print("\n🔍 Chargement des colonnes classifiées [Hybrid]...")
response = requests.get(f"{BASE_URL}/classified", headers=headers)

if response.status_code != 200:
    print("\u274c Erreur lors de la récupération:", response.text)
    exit(1)

all_data = response.json()
hybrid_only = [
    row for row in all_data if row.get("categories", "").endswith("[Hybrid]")
]

if not hybrid_only:
    print("⚠️ Aucune donnée classifiée avec [Hybrid] trouvée.")
    exit(0)

# === Affichage
print(f"\n📃 {len(hybrid_only)} colonnes classifiées avec [Hybrid]:")
for row in hybrid_only:
    print(f" ● {row['table_name']}.{row['column_name']} ➞ {row['categories']}")

# === Export CSV
df = pd.DataFrame(hybrid_only)
output_file = "classified_hybrid_only.csv"
df.to_csv(output_file, index=False)
print(f"\n📄 Données exportées dans {output_file}")
