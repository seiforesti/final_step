# classifiers/base.py

from abc import ABC, abstractmethod
from typing import List

class BaseClassifier(ABC):
    @abstractmethod
    def classify(self, column_name: str) -> List[str]:
        """Retourne une liste de catégories pour un nom de colonne"""
        pass
