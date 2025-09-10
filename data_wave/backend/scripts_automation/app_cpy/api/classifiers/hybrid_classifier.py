# # ✅ hybrid_classifier.py (mis à jour avec ML complet)

# import os
# from typing import List, Dict
# from app.api.classifiers.base import BaseClassifier
# from app.api.classifiers.regex_classifier import RegexClassifier
# from app.api.classifiers.dictionary_classifier import DictionaryClassifier
# from sklearn.ensemble import RandomForestClassifier
# from difflib import SequenceMatcher
# import joblib
# import logging

# class HybridClassifier(BaseClassifier):
#     def __init__(self, verbose: bool = False):
#         self.regex = RegexClassifier()
#         self.dictionary = DictionaryClassifier()
#         self.verbose = verbose

#         # Pondérations
#         self.regex_weight = 0.4
#         self.dict_weight = 0.4
#         self.ml_weight = 0.8

#         # Chargement du modèle ML si dispo
#         self.ml_model = None
#         self.use_ml = True
#         model_path = os.path.join(os.path.dirname(__file__), "ml_models", "hybrid_model.pkl")
#         if os.path.exists(model_path):
#             self.ml_model = joblib.load(model_path)
#             if self.verbose:
#                 print("✅ ML model loaded")
#         else:
#             if self.verbose:
#                 print("❌ ML model not found, skipping.")
#             self.use_ml = False

#     def extract_features(self, column_name: str) -> List[float]:
#         """
#         Génère des features simples pour un nom de colonne.
#         """
#         norm = column_name.lower().replace(" ", "_")
#         return [
#             len(norm),
#             norm.count("_"),
#             sum(c.isdigit() for c in norm),
#             sum(c in ["id", "code"] for c in norm.split("_")),
#         ]

#     def classify(self, column_name: str) -> List[str]:
#         regex_cats = self.regex.classify(column_name)
#         dict_cats = self.dictionary.classify(column_name)

#         scores: Dict[str, float] = {}

#         for cat in regex_cats:
#             scores[cat] = scores.get(cat, 0) + self.regex_weight

#         for cat in dict_cats:
#             scores[cat] = scores.get(cat, 0) + self.dict_weight

#         if self.use_ml and self.ml_model:
#             features = self.extract_features(column_name)
#             try:
#                 pred = self.ml_model.predict([features])[0]
#                 scores[pred] = scores.get(pred, 0) + self.ml_weight
#             except Exception as e:
#                 if self.verbose:
#                     print("ML prediction failed:", e)

#         final_categories = [cat for cat, score in scores.items() if score >= 0.5]

#         if self.verbose:
#             print(f"[Hybrid] {column_name} => Final: {final_categories}, Scores: {scores}")

#         return final_categories if final_categories else ["Unclassified"]
import os
from typing import List, Dict, Optional

import joblib
import logging
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from app.api.classifiers.base import BaseClassifier
from app.api.classifiers.regex_classifier import RegexClassifier
from app.api.classifiers.dictionary_classifier import DictionaryClassifier

logger = logging.getLogger(__name__)

class HybridClassifier(BaseClassifier):
    def __init__(self, use_ml: bool = True, verbose: bool = False):
        self.regex = RegexClassifier()
        self.dictionary = DictionaryClassifier()
        self.verbose = verbose

        # Pondération manuelle
        self.regex_weight = 0.3
        self.dict_weight = 0.3
        self.ml_weight = 0.4

        self.use_ml = use_ml
        # Delay expensive training until first actual classify call
        self._model_loaded = False
        self.ml_model = None

    def load_ml_model(self):
        """
        Charge le modèle ML entraîné (Sklearn) depuis disk.
        S'il est corrompu/invalide, entraîne un modèle de secours à partir des données
        d'entraînement disponibles puis le persiste pour les usages suivants.
        """
        models_dir = os.path.join(os.path.dirname(__file__), "ml_models")
        path = os.path.join(models_dir, "hybrid_model.pkl")
        if os.path.exists(path):
            try:
                return joblib.load(path)
            except Exception as exc:
                logger.warning("Corrupted ML model at %s: %s. Rebuilding inline.", path, exc)
                return self._train_inline_model(models_dir=models_dir, persist_path=path)
        logger.warning("ML model not found at %s. Skipping inline training at import.", path)
        return None

    def _train_inline_model(self, models_dir: str, persist_path: str) -> Optional[Pipeline]:
        """
        Entraîne un modèle léger et robuste à partir des CSVs fournis dans ml_models/data.
        - Fusionne training_data.csv et augmented_training_data.csv si disponibles
        - Pipeline: TF-IDF (char+word ngrams) + LogisticRegression
        - Persiste le modèle pour une utilisation future
        """
        try:
            data_dir = os.path.join(models_dir, "data")
            frames = []
            for fname in ("training_data.csv", "augmented_training_data.csv"):
                fpath = os.path.join(data_dir, fname)
                if os.path.exists(fpath):
                    try:
                        df = pd.read_csv(fpath)
                        frames.append(df)
                    except Exception as e:
                        logger.warning("Failed to read %s: %s", fpath, e)
            if not frames:
                logger.warning("No training data found in %s; ML fallback disabled.", data_dir)
                return None
            df = pd.concat(frames, ignore_index=True)
            # Expect columns: column_name, label (fallback to first two columns if headers differ)
            if not {"column_name", "label"}.issubset(df.columns):
                # Try to infer columns
                cols = list(df.columns)
                if len(cols) >= 2:
                    df = df.rename(columns={cols[0]: "column_name", cols[1]: "label"})
                else:
                    logger.warning("Training CSV schema unexpected: columns=%s", cols)
                    return None

            X = df["column_name"].astype(str).fillna("")
            y = df["label"].astype(str).fillna("Unclassified")

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

            pipeline = Pipeline([
                ("tfidf", TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(2, 5),
                    min_df=1,
                    max_features=50000
                )),
                ("clf", LogisticRegression(max_iter=1000, n_jobs=None))
            ])

            # Fit with small subset to reduce memory pressure in container
            subset = min(len(X_train), 1000)
            if subset < len(X_train):
                X_fit, y_fit = X_train[:subset], y_train[:subset]
            else:
                X_fit, y_fit = X_train, y_train
            pipeline.fit(X_fit, y_fit)
            try:
                y_pred = pipeline.predict(X_test)
                report = classification_report(y_test, y_pred, zero_division=0)
                logger.info("Inline ML model trained. Evaluation report:\n%s", report)
            except Exception:
                pass

            # Ensure directory exists and persist model
            os.makedirs(models_dir, exist_ok=True)
            joblib.dump(pipeline, persist_path)
            logger.info("Persisted rebuilt ML model to %s", persist_path)
            return pipeline
        except Exception as e:
            logger.warning("Inline ML training failed: %s", e)
            return None

    def classify(self, column_name: str) -> List[str]:
        """
        Combine les résultats des classificateurs avec pondération et modèle ML optionnel.
        """
        scores: Dict[str, float] = {}

        # Regex
        regex_cats = self.regex.classify(column_name)
        for cat in regex_cats:
            scores[cat] = scores.get(cat, 0) + self.regex_weight

        # Dictionary
        dict_cats = self.dictionary.classify(column_name)
        for cat in dict_cats:
            scores[cat] = scores.get(cat, 0) + self.dict_weight

        # Machine Learning (si activé)
        if self.use_ml:
            try:
                # lazy load or train the model on first use
                if not self._model_loaded:
                    self.ml_model = self.load_ml_model()
                    if self.ml_model is None:
                        # attempt lightweight inline training once
                        models_dir = os.path.join(os.path.dirname(__file__), "ml_models")
                        path = os.path.join(models_dir, "hybrid_model.pkl")
                        self.ml_model = self._train_inline_model(models_dir=models_dir, persist_path=path)
                    self._model_loaded = True
                if self.ml_model is not None:
                    prediction = self.ml_model.predict([column_name])[0]
                    scores[prediction] = scores.get(prediction, 0) + self.ml_weight
            except Exception as e:
                logger.warning("ML prediction failed: %s", e)

        # Retourner les catégories avec un score > 0.5
        final_cats = [cat for cat, score in scores.items() if score >= 0.5]

        if self.verbose:
            print(f"[Hybrid] {column_name} → RegEx: {regex_cats}, Dict: {dict_cats}, Final: {final_cats}")

        return final_cats
