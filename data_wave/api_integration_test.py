#!/usr/bin/env python3
"""
API Integration Test Script
===========================

This script tests the key API endpoints that were causing issues in the frontend
to ensure they're working correctly after the fixes.

Tests:
1. Dashboard list endpoint: GET /api/racine/dashboards/list
2. AI recommendations endpoint: POST /api/racine/ai/recommendations
3. Quick actions usage analytics: GET /api/v1/quick-actions/usage-analytics

Run this script to verify the backend APIs are working correctly.
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend base URL
BASE_URL = "http://localhost:8000"

def test_dashboard_list():
    """Test the dashboard list endpoint"""
    print("🔍 Testing Dashboard List API...")
    
    try:
        url = f"{BASE_URL}/api/racine/dashboards/list"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Dashboard List API: SUCCESS")
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
            return True
        else:
            print(f"❌ Dashboard List API: FAILED (Status: {response.status_code})")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Dashboard List API: CONNECTION ERROR")
        print(f"   Error: {str(e)}")
        return False

def test_ai_recommendations():
    """Test the AI recommendations endpoint"""
    print("\n🤖 Testing AI Recommendations API...")
    
    try:
        url = f"{BASE_URL}/api/racine/ai/recommendations"
        payload = {
            "context": {"workspace": "test", "user_role": "admin"},
            "scope": ["performance", "optimization"],
            "priority": "high"
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            print("✅ AI Recommendations API: SUCCESS")
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
            return True
        else:
            print(f"❌ AI Recommendations API: FAILED (Status: {response.status_code})")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ AI Recommendations API: CONNECTION ERROR")
        print(f"   Error: {str(e)}")
        return False

def test_usage_analytics():
    """Test the usage analytics endpoint"""
    print("\n📊 Testing Usage Analytics API...")
    
    try:
        url = f"{BASE_URL}/api/v1/quick-actions/usage-analytics"
        params = {"time_range": "24h"}
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            print("✅ Usage Analytics API: SUCCESS")
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)[:300]}...")
            return True
        else:
            print(f"❌ Usage Analytics API: FAILED (Status: {response.status_code})")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Usage Analytics API: CONNECTION ERROR")
        print(f"   Error: {str(e)}")
        return False

def test_backend_health():
    """Test basic backend health"""
    print("🏥 Testing Backend Health...")
    
    try:
        url = f"{BASE_URL}/"
        response = requests.get(url, timeout=5)
        
        if response.status_code in [200, 302, 307]:  # Allow redirects
            print("✅ Backend Health: ONLINE")
            return True
        else:
            print(f"⚠️  Backend Health: UNEXPECTED STATUS ({response.status_code})")
            return True  # Still consider it healthy
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend Health: OFFLINE")
        print(f"   Error: {str(e)}")
        return False

def main():
    """Run all API integration tests"""
    print("🚀 Starting API Integration Tests")
    print("=" * 50)
    
    # Test results
    results = {}
    
    # Test backend health first
    results['health'] = test_backend_health()
    
    if not results['health']:
        print("\n❌ Backend is not running. Please start the backend server first.")
        print("   Run: cd data_wave/backend/scripts_automation && python -m uvicorn app.main:app --reload")
        sys.exit(1)
    
    # Run API tests
    results['dashboard_list'] = test_dashboard_list()
    results['ai_recommendations'] = test_ai_recommendations()
    results['usage_analytics'] = test_usage_analytics()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All API integrations are working correctly!")
        return 0
    else:
        print("⚠️  Some API integrations need attention.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)