from pymongo import MongoClient

client = MongoClient("mongodb://admin:admin@localhost:27017")
db = client["testdb"]
collection = db["users"]

# Check if the user already exists to avoid duplicate insertion
if collection.count_documents({"email": "alice@example.com"}, limit=1) == 0:
    collection.insert_one({
        "full_name": "Alice Doe",
        "email": "alice@example.com",
        "password": "secret123",
        "iban": "FR7630006000011234567890189"
    })
    print("✅ Donnée MongoDB insérée avec succès.")
else:
    print("ℹ️ Donnée MongoDB déjà présente, insertion ignorée.")
