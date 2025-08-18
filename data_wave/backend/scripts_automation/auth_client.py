import requests

# Configuration
username = "admin"  # ou "viewer"
password = "admin123"  # ou "viewer123"
base_url = "http://localhost:8000"

# Obtenir un token
response = requests.post(f"{base_url}/token", data={
    "username": username,
    "password": password
}, headers={"Content-Type": "application/x-www-form-urlencoded"})

if response.status_code != 200:
    print("❌ Auth failed:", response.text)
    exit()

token = response.json()["access_token"]
print("✅ Token reçu")

# Appeler un endpoint protégé
headers = {"Authorization": f"Bearer {token}"}
extract_response = requests.post(
    f"{base_url}/extract/mysql",
    json={
        "database_type": "mysql",
        "connection_uri": "mysql+pymysql://root:root@mysql-server:3306/testdb"
    },
    headers=headers
)

print("🧪 Résultat:", extract_response.status_code, extract_response.text)

def get_jwt_token(base_url, username, password):
    response = requests.post(
        f"{base_url}/token",
        data={"username": username, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code != 200:
        raise Exception(f"❌ Authentification échouée: {response.text}")
    return response.json()["access_token"]