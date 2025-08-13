import os
import pandas as pd
from itertools import product
import random

# Données enrichies pour chaque catégorie
samples = {
    "PII": [
        "name", "first_name", "last_name", "full_name", "user_name", "email", "user_email",
        "phone", "contact_number", "birthdate", "adresse", "national_id", "client_email"
    ],
    "Sensitive": [
        "password", "hashed_password", "token", "auth_token", "api_key", "secret", "private_key", "access_token"
    ],
    "Financial": [
        "iban", "credit_card", "card_number", "transaction_amount", "amount", "montant_total",
        "payment_status", "account_balance", "bank_account", "account_id", "invoice_amount"
    ],
    "Transaction": [
        "order_id", "purchase_id", "invoice_number", "product_id", "cart_id", "transaction_id",
        "facture_num", "sale_id", "line_item", "order_date", "payment_method"
    ],
    "Unclassified": [
        "status", "created_at", "updated_at", "description", "info", "note", "log", "metadata"
    ]
}

# Créer le DataFrame
rows = []
for category, terms in samples.items():
    for name in terms:
        rows.append({"column_name": name, "category": category})

df = pd.DataFrame(rows)

# Sauvegarde
output_path = "app/api/classifiers/ml_models/data/training_data.csv"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
df.to_csv(output_path, index=False)

print(f"✅ Fichier généré : {output_path} ({len(df)} lignes)")
# Générer des variations pour augmenter les données
def generate_variations(base_terms):
    variations = set(base_terms)
    for term in base_terms:
        variations.add(term.upper())  # Ajouter en majuscules
        variations.add(term.lower())  # Ajouter en minuscules
        variations.add(term.capitalize())  # Ajouter avec la première lettre en majuscule
        variations.add(f"{term}_id")  # Ajouter un suffixe
        variations.add(f"{term}_info")  # Ajouter un autre suffixe
        variations.add(f"{term}_data")  # Ajouter un autre suffixe
    return list(variations)

# Augmenter les données pour chaque catégorie
augmented_samples = {}
for category, terms in samples.items():
    augmented_samples[category] = generate_variations(terms)

# Créer un DataFrame enrichi
augmented_rows = []
for category, terms in augmented_samples.items():
    for name in terms:
        augmented_rows.append({"column_name": name, "category": category})

augmented_df = pd.DataFrame(augmented_rows)

# Sauvegarde des données augmentées
augmented_output_path = "app/api/classifiers/ml_models/data/augmented_training_data.csv"
os.makedirs(os.path.dirname(augmented_output_path), exist_ok=True)
augmented_df.to_csv(augmented_output_path, index=False)

print(f"✅ Fichier enrichi généré : {augmented_output_path} ({len(augmented_df)} lignes)")