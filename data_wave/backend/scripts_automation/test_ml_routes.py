# # ✅ test_ml_routes.py
# import requests
# import os
# import json
# import matplotlib.pyplot as plt

# BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
# USERNAME = os.getenv("USERNAME", "admin")
# PASSWORD = os.getenv("PASSWORD", "admin123")

# # ✅ Auth
# print("⛔ Authentification...")
# auth_res = requests.post(
#     f"{BASE_URL}/token",
#     data={"username": USERNAME, "password": PASSWORD},
#     headers={"Content-Type": "application/x-www-form-urlencoded"}
# )

# if auth_res.status_code != 200:
#     print("❌ Auth échouée", auth_res.text)
#     exit()

# token = auth_res.json()["access_token"]
# headers = {"Authorization": f"Bearer {token}"}

# # ✅ /ml/metrics
# print("\n🔍 Récupération des métriques ML...")
# metrics = requests.get(f"{BASE_URL}/ml/metrics", headers=headers)
# if metrics.status_code == 200:
#     print(json.dumps(metrics.json(), indent=2))
# else:
#     print("❌ Erreur métriques", metrics.text)

# # ✅ /ml/retrain  
# print("\n🏋️ Re-entraînement...")
# retrain = requests.post(f"{BASE_URL}/ml/retrain", headers=headers)
# if retrain.status_code == 200:
#     print(retrain.json())
# else:
#     print("❌ Erreur re-entraînement", retrain.text)

# # ✅ /ml/categories + Graphe
# print("\n🔢 Répartition des catégories...")
# cats = requests.get(f"{BASE_URL}/ml/categories", headers=headers)
# if cats.status_code == 200:
#     data = cats.json()
#     print(json.dumps(data, indent=2))

#     # 🎈 Pie chart
#     labels = list(data.keys())
#     sizes = list(data.values())
#     plt.figure(figsize=(6, 6))
#     plt.pie(sizes, labels=labels, autopct="%1.1f%%", startangle=140)
#     plt.axis("equal")
#     plt.title("◯ Distribution des catégories dans training_data.csv")
#     plt.savefig("ml_category_piechart.png")
#     print("📷 Diagramme enregistré : ml_category_piechart.png")
# else:
#     print("❌ Erreur catégories", cats.text)
import requests
import os
import json
import matplotlib.pyplot as plt

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
USERNAME = os.getenv("USERNAME", "admin")
PASSWORD = os.getenv("PASSWORD", "admin123")

# ✅ Authentification
print("⛔ Authentification...")
auth_res = requests.post(
    f"{BASE_URL}/token",
    data={"username": USERNAME, "password": PASSWORD},
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if auth_res.status_code != 200:
    print("❌ Auth échouée", auth_res.text)
    exit()

token = auth_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# ✅ /ml/metrics
print("\n🔍 Récupération des métriques ML...")
metrics = requests.get(f"{BASE_URL}/ml/metrics", headers=headers)
if metrics.status_code == 200:
    print(json.dumps(metrics.json(), indent=2))
else:
    print("❌ Erreur métriques", metrics.text)

# ✅ /ml/retrain
print("\n🏋️ Re-entraînement...")
retrain = requests.post(f"{BASE_URL}/ml/retrain", headers=headers)
if retrain.status_code == 200:
    print(retrain.json())
else:
    print("❌ Erreur re-entraînement", retrain.text)

# ✅ /ml/categories + graphe
print("\n🔢 Répartition des catégories...")
cats = requests.get(f"{BASE_URL}/ml/categories", headers=headers)
if cats.status_code == 200:
    data = cats.json()
    print(json.dumps(data, indent=2))

    # 🎈 Diagramme circulaire (Pie Chart)
    labels = list(data.keys())
    sizes = list(data.values())

    plt.figure(figsize=(6, 6))
    plt.pie(sizes, labels=labels, autopct="%1.1f%%", startangle=140)
    plt.axis("equal")
    plt.title("◯ Distribution des catégories dans training_data.csv")
    plt.savefig("ml_category_piechart.png")
    print("📷 Diagramme enregistré : ml_category_piechart.png")
else:
    print("❌ Erreur catégories", cats.text)
