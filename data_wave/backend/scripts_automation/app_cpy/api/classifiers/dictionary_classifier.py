# classifiers/dictionary_classifier.py

import os
import json
from typing import List
from app.api.classifiers.base import BaseClassifier
from difflib import SequenceMatcher

class DictionaryClassifier(BaseClassifier):
    def __init__(self):
        self.dictionary = self.load_dictionaries()
        self.similarity_threshold = 0.8

    def load_dictionaries(self) -> dict:
        """
        Charge les vocabulaires métier depuis un fichier JSON
        """
        base_path = os.path.dirname(__file__)
        dict_path = os.path.join(base_path, "dictionaries", "business_terms.json")
        with open(dict_path, encoding="utf-8") as f:
            return json.load(f)

    def normalize(self, name: str) -> str:
        """
        Nettoie le nom de colonne pour uniformiser la comparaison
        """
        return name.strip().lower().replace(" ", "_")

    def similar(self, a: str, b: str) -> float:
        """
        Calcule la similarité entre deux mots
        """
        return SequenceMatcher(None, a, b).ratio()

    def classify(self, column_name: str) -> List[str]:
        """
        Classe une colonne par similarité et dictionnaire multilingue
        """
        name = self.normalize(column_name)
        categories = []

        for category, keywords in self.dictionary.items():
            for keyword in keywords:
                norm_keyword = self.normalize(keyword)
                if norm_keyword in name or self.similar(norm_keyword, name) > self.similarity_threshold:
                    categories.append(category)
                    break

        return categories
