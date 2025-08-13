# classifiers/regex_classifier.py

import re
from typing import List
from app.api.classifiers.base import BaseClassifier

PATTERNS = {
    "PII": [
        r"(full[_-]?name|first[_-]?name|last[_-]?name)",
        r"(email|e[-_]?mail|contact[_-]?email)",
        r"(phone|mobile|telephone)",
        r"(address|addr)",
        r"(birth|dob|date[_-]?of[_-]?birth)",
        r"(ssn|social[_-]?security)",
        r"(passport|passport[_-]?number)"
    ],
    "Financial": [
        r"(iban|bic|swift)",
        r"(credit[_-]?card|card[_-]?number|cc[_-]?num)",
        r"(payment|amount|transaction|price|invoice)",
        r"(bank[_-]?account|account[_-]?number)"
    ],
    "Sensitive": [
        r"(password|pass|pwd)",
        r"(token|secret|auth[_-]?key|access[_-]?key|api[_-]?key|private[_-]?key)"
    ],
    "Transaction": [
        r"(order|product|item|cart|purchase|sale|invoice)"
    ]
}

class RegexClassifier(BaseClassifier):
    def normalize(self, name: str) -> str:
        return name.lower().replace(" ", "_")

    def classify(self, column_name: str) -> List[str]:
        normalized = self.normalize(column_name)
        categories = []

        for category, regex_list in PATTERNS.items():
            for pattern in regex_list:
                if re.search(pattern, normalized, re.IGNORECASE):
                    categories.append(category)
                    break

        return categories
