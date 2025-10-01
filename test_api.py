#!/usr/bin/env python3
import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    token = "wWmwwL5I41eZ9rf461l7dbCqa59s5Drfe9tQ7nYUIT5UWxtfX3iMUCIxgU899NWj"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test manual classification API first
    print("Testing manual classification API...")
    try:
        response = requests.get(f"{base_url}/api/classifications/frameworks", headers=headers)
        print(f"Manual API Status: {response.status_code}")
        print(f"Manual API Response: {response.text[:200]}...")
    except Exception as e:
        print(f"Manual API Error: {e}")
    
    # Test ML API
    print("\nTesting ML API...")
    try:
        response = requests.get(f"{base_url}/ml/models", headers=headers)
        print(f"ML API Status: {response.status_code}")
        print(f"ML API Response: {response.text[:200]}...")
    except Exception as e:
        print(f"ML API Error: {e}")
    
    # Test AI API
    print("\nTesting AI API...")
    try:
        response = requests.get(f"{base_url}/ai/models", headers=headers)
        print(f"AI API Status: {response.status_code}")
        print(f"AI API Response: {response.text[:200]}...")
    except Exception as e:
        print(f"AI API Error: {e}")

if __name__ == "__main__":
    test_api()


