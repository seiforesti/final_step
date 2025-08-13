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
from typing import List, Dict

import joblib
from app.api.classifiers.base import BaseClassifier
from app.api.classifiers.regex_classifier import RegexClassifier
from app.api.classifiers.dictionary_classifier import DictionaryClassifier

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
        self.ml_model = self.load_ml_model() if use_ml else None

    def load_ml_model(self):
        """
        Charge le modèle ML entraîné (Sklearn) depuis disk.
        """
        path = os.path.join(os.path.dirname(__file__), "ml_models", "hybrid_model.pkl")
        if os.path.exists(path):
            return joblib.load(path)
        else:
            print(f"⚠️  Modèle ML introuvable à {path}")
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
        if self.use_ml and self.ml_model:
            try:
                prediction = self.ml_model.predict([column_name])[0]
                scores[prediction] = scores.get(prediction, 0) + self.ml_weight
            except Exception as e:
                print(f"⚠️  Erreur prédiction ML : {e}")

        # Retourner les catégories avec un score > 0.5
        final_cats = [cat for cat, score in scores.items() if score >= 0.5]

        if self.verbose:
            print(f"[Hybrid] {column_name} → RegEx: {regex_cats}, Dict: {dict_cats}, Final: {final_cats}")

        return final_cats
