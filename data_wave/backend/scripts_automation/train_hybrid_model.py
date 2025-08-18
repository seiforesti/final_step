# # train_hybrid_model.py
# import json
# import os
# import pandas as pd
# from sklearn.feature_extraction.text import CountVectorizer
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.pipeline import Pipeline
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import classification_report, precision_recall_fscore_support
# import joblib

# # 📂 Chemin de sauvegarde du modèle
# MODEL_PATH = "classifiers/ml_models/hybrid_model.pkl"

# # 🔢 Chargement des données
# # Exemple CSV attendu: column_name,category
# DATA_FILE = "app/api/classifiers/ml_models/data/training_data.csv"
# if not os.path.exists(DATA_FILE):
#     raise FileNotFoundError(f"Fichier d'entraîment manquant: {DATA_FILE}")

# print("✨ Chargement des données...")
# df = pd.read_csv(DATA_FILE)

# # Nettoyage
# if "column_name" not in df.columns or "category" not in df.columns:
#     raise ValueError("Le fichier doit contenir les colonnes 'column_name' et 'category'")

# X = df["column_name"].astype(str)
# y = df["category"].astype(str)

# # 📈 Split train/test
# X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2, random_state=42)

# # 🔧 Pipeline avec vectorisation
# model = Pipeline([
#     ("vectorizer", CountVectorizer()),
#     ("classifier", RandomForestClassifier(n_estimators=100, random_state=42))
# ])

# print("⚖️ Entraînement du modèle...")
# model.fit(X_train, y_train)

# # ✅ Évaluation
# print("\n✍️ Rapport de performance:")
# y_pred = model.predict(X_test)
# print(classification_report(y_test, y_pred))

# # 💾 Sauvegarde
# os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
# joblib.dump(model, MODEL_PATH)
# print(f"✔️ Modèle sauvegardé dans: {MODEL_PATH}")





# precision, recall, f1, support = precision_recall_fscore_support(
# y_test, y_pred, average="weighted", zero_division=0
# )

# metrics = {
# "precision": round(precision, 4),
# "recall": round(recall, 4),
# "f1_score": round(f1, 4),
# "support": int(support)
# }

# metrics_path = os.path.join("app", "api", "classifiers", "ml_models", "metrics.json")
# os.makedirs(os.path.dirname(metrics_path), exist_ok=True)

# with open(metrics_path, "w") as f:
#     json.dump(metrics, f, indent=2)

# print(f"✅ Métriques sauvegardées dans {metrics_path}")







# train_hybrid_model.py

# import json
# import os
# import pandas as pd
# from sklearn.feature_extraction.text import CountVectorizer
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.pipeline import Pipeline
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import classification_report, precision_recall_fscore_support
# import joblib

# # 📂 Chemins
# DATA_FILE = "app/api/classifiers/ml_models/data/training_data.csv"
# MODEL_PATH = "app/api/classifiers/ml_models/hybrid_model.pkl"
# METRICS_PATH = "app/api/classifiers/ml_models/metrics.json"

# # 🧠 Charger les données
# if not os.path.exists(DATA_FILE):
#     raise FileNotFoundError(f"Fichier d'entraînement manquant: {DATA_FILE}")

# print("✨ Chargement des données...")
# df = pd.read_csv(DATA_FILE)

# if "column_name" not in df.columns or "category" not in df.columns:
#     raise ValueError("Le fichier doit contenir les colonnes 'column_name' et 'category'")

# X = df["column_name"].astype(str)
# y = df["category"].astype(str)

# # 🔀 Split train/test
# X_train, X_test, y_train, y_test = train_test_split(
#     X, y, stratify=y, test_size=0.2, random_state=42
# )

# # ⚙️ Pipeline avec CountVectorizer + RandomForest
# model = Pipeline([
#     ("vectorizer", CountVectorizer(lowercase=True, ngram_range=(1, 2))),
#     ("classifier", RandomForestClassifier(n_estimators=100, random_state=42))
# ])

# print("⚖️ Entraînement du modèle...")
# model.fit(X_train, y_train)

# # ✅ Évaluation
# print("\n✍️ Rapport de performance:")
# y_pred = model.predict(X_test)
# print(classification_report(y_test, y_pred))

# # 📊 Métriques
# precision, recall, f1, support = precision_recall_fscore_support(
#     y_test, y_pred, average="weighted", zero_division=0
# )

# metrics = {
#     "precision": round(precision, 4),
#     "recall": round(recall, 4),
#     "f1_score": round(f1, 4),
#     "support": int(support) if not isinstance(support, (list, tuple)) else int(sum(support))
# }

# # 💾 Sauvegardes
# os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
# joblib.dump(model, MODEL_PATH)
# print(f"✔️ Modèle sauvegardé dans: {MODEL_PATH}")

# os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)
# with open(METRICS_PATH, "w") as f:
#     json.dump(metrics, f, indent=2)
# print(f"📊 Métriques sauvegardées dans: {METRICS_PATH}")

#################################################################################################################################""""""

# ✅ train_hybrid_model.py (mise à jour automatique + export métriques)
# import json
# import os
# import pandas as pd
# import joblib
# from sklearn.pipeline import Pipeline
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import classification_report, precision_recall_fscore_support
# from sklearn.feature_extraction.text import CountVectorizer
# from sklearn.ensemble import RandomForestClassifier

# # 📂 Chemins
# DATA_FILES = [
#     "app/api/classifiers/ml_models/data/training_data.csv",
#     "app/api/classifiers/ml_models/data/augmented_training_data.csv"
# ]
# MODEL_PATH = "app/api/classifiers/ml_models/hybrid_model.pkl"
# METRICS_PATH = "app/api/classifiers/ml_models/metrics.json"

# # ✅ Chargement des données
# dfs = []
# for data_file in DATA_FILES:
#     if not os.path.exists(data_file):
#         raise FileNotFoundError(f"Fichier d'entraînement manquant: {data_file}")
#     print(f"✨ Chargement des données depuis {data_file}...")
#     dfs.append(pd.read_csv(data_file))

# df = pd.concat(dfs, ignore_index=True)

# if "column_name" not in df.columns or "category" not in df.columns:
#     raise ValueError("Les fichiers CSV doivent contenir les colonnes 'column_name' et 'category'")

# X = df["column_name"].astype(str)
# y = df["category"].astype(str)

# # ✅ Séparation train/test
# X_train, X_test, y_train, y_test = train_test_split(
#     X, y, stratify=y, test_size=0.2, random_state=42
# )

# # ✅ Pipeline Scikit-learn
# model = Pipeline([
#     ("vectorizer", CountVectorizer(lowercase=True, ngram_range=(1, 2))),
#     ("classifier", RandomForestClassifier(n_estimators=100, random_state=42))
# ])

# print("⚙️ Entraînement du modèle...")
# model.fit(X_train, y_train)

# # ✅ Évaluation
# y_pred = model.predict(X_test)
# print("\n✍️ Rapport:")
# print(classification_report(y_test, y_pred))

# # ✅ Métriques
# precision, recall, f1, support = precision_recall_fscore_support(
#     y_test, y_pred, average="weighted", zero_division=0
# )

# metrics = {
#     "precision": round(precision, 4),
#     "recall": round(recall, 4),
#     "f1_score": round(f1, 4),
#     "support": int(support) if support is not None else 0
# }

# # 💾 Sauvegarde du modèle
# os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
# joblib.dump(model, MODEL_PATH)
# print(f"✅ Modèle sauvegardé à {MODEL_PATH}")

# # 💾 Sauvegarde des métriques
# os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)
# with open(METRICS_PATH, "w") as f:
#     json.dump(metrics, f, indent=2)
# print(f"📊 Métriques sauvegardées à {METRICS_PATH}")

# # ✅ Fonction pour entraîner et sauvegarder
# def train_and_save():
#     model.fit(X_train, y_train)
#     y_pred = model.predict(X_test)
#     precision, recall, f1, support = precision_recall_fscore_support(
#         y_test, y_pred, average="weighted", zero_division=0
#     )
#     metrics = {
#         "precision": round(precision, 4),
#         "recall": round(recall, 4),
#         "f1_score": round(f1, 4),
#         "support": int(support) if support is not None else 0
#     }
#     joblib.dump(model, MODEL_PATH)
#     with open(METRICS_PATH, "w") as f:
#         json.dump(metrics, f, indent=2)
#     return {"model_path": MODEL_PATH, "metrics_path": METRICS_PATH}
####################################################################################################################################
# ✅ train_hybrid_model.py (version embeddings FastText + RandomForest)
import os
import json
import pandas as pd
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, precision_recall_fscore_support

# 📂 Chemins
DATA_FILES = [
    "app/api/classifiers/ml_models/data/training_data.csv",
    "app/api/classifiers/ml_models/data/augmented_training_data.csv"
]
MODEL_PATH = "app/api/classifiers/ml_models/hybrid_model.pkl"
METRICS_PATH = "app/api/classifiers/ml_models/metrics.json"

# ✅ Chargement des données
dfs = []
for data_file in DATA_FILES:
    if os.path.exists(data_file):
        print(f"✨ Chargement des données depuis {data_file}...")
        dfs.append(pd.read_csv(data_file))

df = pd.concat(dfs, ignore_index=True)

if "column_name" not in df.columns or "category" not in df.columns:
    raise ValueError("Les fichiers CSV doivent contenir les colonnes 'column_name' et 'category'")

X_raw = df["column_name"].astype(str)
y = df["category"].astype(str)

# ✅ Encodage des noms de colonnes en vecteurs avec SentenceTransformer
print("📥 Chargement du modèle SentenceTransformer...")
st_model = SentenceTransformer('all-MiniLM-L6-v2')

print("📥 Encodage des colonnes en embeddings...")
X_vec = st_model.encode(X_raw.tolist(), show_progress_bar=True)

# ✅ Split train/test
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, stratify=y, test_size=0.2, random_state=42)

# ✅ Modèle RandomForest
model = RandomForestClassifier(n_estimators=100, random_state=42)
print("⚙️ Entraînement du modèle...")
model.fit(X_train, y_train)

# ✅ Évaluation
y_pred = model.predict(X_test)
print("\n✍️ Rapport:")
print(classification_report(y_test, y_pred))

# ✅ Métriques
precision, recall, f1, support = precision_recall_fscore_support(
    y_test, y_pred, average="weighted", zero_division=0
)

metrics = {
    "precision": round(precision, 4),
    "recall": round(recall, 4),
    "f1_score": round(f1, 4),
    "support": int(support) if support is not None else 0
}

# 💾 Sauvegarde du modèle
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(model, MODEL_PATH)
print(f"✅ Modèle sauvegardé à {MODEL_PATH}")

# 💾 Sauvegarde des métriques
os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)
with open(METRICS_PATH, "w") as f:
    json.dump(metrics, f, indent=2)
print(f"📊 Métriques sauvegardées à {METRICS_PATH}")

# ✅ Fonction pour réutiliser en watcher ou API
def train_and_save():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_test, y_pred, average="weighted", zero_division=0
    )
    metrics = {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "support": int(support) if support is not None else 0
    }
    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    return {"model_path": MODEL_PATH, "metrics_path": METRICS_PATH}
