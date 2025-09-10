#!/usr/bin/env python3
"""
Test script for schema discovery APIs
"""
import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000"

def authenticate():
    """Authenticate and get token"""
    try:
        # Try to login with default credentials
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

def test_data_sources(token):
    """Test data sources endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/scan/data-sources", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Data sources retrieved: {len(data)} sources found")
            for ds in data[:3]:  # Show first 3
                print(f"   - ID: {ds.get('id')}, Name: {ds.get('name')}, Type: {ds.get('type')}")
            return data
        else:
            print(f"❌ Data sources failed: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"❌ Data sources error: {e}")
        return []

def test_discovery_status(token, data_source_id):
    """Test discovery status endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/data-discovery/data-sources/{data_source_id}/discovery-status", 
                              headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Discovery status for DS {data_source_id}: {data}")
            return data
        else:
            print(f"❌ Discovery status failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Discovery status error: {e}")
        return None

def test_schema_discovery(token, data_source_id):
    """Test schema discovery endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        discovery_data = {
            "data_source_id": data_source_id,
            "include_data_preview": False,
            "auto_catalog": True,
            "max_tables_per_schema": 100
        }
        
        print(f"🚀 Starting schema discovery for data source {data_source_id}...")
        response = requests.post(f"{BASE_URL}/data-discovery/data-sources/{data_source_id}/discover-schema", 
                               json=discovery_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Schema discovery started: {data}")
            return data
        else:
            print(f"❌ Schema discovery failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Schema discovery error: {e}")
        return None

def test_progress_endpoint(token, data_source_id):
    """Test progress endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        print(f"📡 Testing progress endpoint for data source {data_source_id}...")
        
        # Test SSE endpoint
        response = requests.get(f"{BASE_URL}/data-discovery/data-sources/{data_source_id}/discover-schema/progress", 
                              headers=headers, timeout=5, stream=True)
        
        if response.status_code == 200:
            print(f"✅ Progress endpoint accessible: {response.status_code}")
            # Try to read a few lines
            lines_read = 0
            for line in response.iter_lines():
                if line:
                    print(f"📨 Progress data: {line.decode('utf-8')}")
                    lines_read += 1
                    if lines_read >= 3:  # Read first 3 lines
                        break
            return True
        else:
            print(f"❌ Progress endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Progress endpoint error: {e}")
        return False

def test_table_preview(token, data_source_id):
    """Test table preview endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        preview_data = {
            "data_source_id": data_source_id,
            "schema_name": "public",
            "table_name": "users",
            "limit": 5,
            "include_statistics": True,
            "apply_data_masking": False
        }
        
        print(f"👁️ Testing table preview for data source {data_source_id}...")
        response = requests.post(f"{BASE_URL}/data-discovery/data-sources/{data_source_id}/preview-table", 
                               json=preview_data, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Table preview successful: {data.get('success')}")
            if data.get('preview_data'):
                preview = data['preview_data']
                print(f"   - Schema: {preview.get('schema_name')}")
                print(f"   - Table: {preview.get('table_name')}")
                print(f"   - Columns: {len(preview.get('columns', []))}")
                print(f"   - Rows: {len(preview.get('rows', []))}")
            return data
        else:
            print(f"❌ Table preview failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Table preview error: {e}")
        return None

def main():
    print("🧪 Testing Schema Discovery APIs")
    print("=" * 50)
    
    # Step 1: Authenticate
    print("1. Authenticating...")
    token = authenticate()
    if not token:
        print("❌ Cannot proceed without authentication")
        sys.exit(1)
    print("✅ Authentication successful")
    
    # Step 2: Get data sources
    print("\n2. Getting data sources...")
    data_sources = test_data_sources(token)
    if not data_sources:
        print("❌ No data sources available")
        sys.exit(1)
    
    # Use first data source for testing
    test_ds = data_sources[0]
    ds_id = test_ds['id']
    ds_name = test_ds['name']
    print(f"🎯 Using data source: {ds_name} (ID: {ds_id})")
    
    # Step 3: Test discovery status
    print(f"\n3. Testing discovery status...")
    test_discovery_status(token, ds_id)
    
    # Step 4: Test progress endpoint
    print(f"\n4. Testing progress endpoint...")
    test_progress_endpoint(token, ds_id)
    
    # Step 5: Test table preview
    print(f"\n5. Testing table preview...")
    test_table_preview(token, ds_id)
    
    # Step 6: Test schema discovery (optional - might take time)
    print(f"\n6. Testing schema discovery...")
    print("⚠️  This might take some time and could affect database performance...")
    user_input = input("Do you want to test schema discovery? (y/N): ").strip().lower()
    
    if user_input == 'y':
        test_schema_discovery(token, ds_id)
        
        # Wait a bit and check status again
        print("\n⏳ Waiting 5 seconds and checking status again...")
        time.sleep(5)
        test_discovery_status(token, ds_id)
    else:
        print("⏭️  Skipping schema discovery test")
    
    print("\n✅ Schema discovery API testing completed!")

if __name__ == "__main__":
    main()

