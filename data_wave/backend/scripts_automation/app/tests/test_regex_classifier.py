# scripts_automation/app/tests/test_regex_classifier.py
import sys
import os

from app.api.classifiers.regex_classifier import RegexClassifier



def test_classify_column():
    clf = RegexClassifier()

    assert "PII" in clf.classify("email")
    assert "PII" in clf.classify("full_name")
    assert "Sensitive" in clf.classify("password")
    assert "Financial" in clf.classify("iban")
    assert "Transaction" in clf.classify("product_id")

    print("✅ Tous les tests RegexClassifier sont OK")
