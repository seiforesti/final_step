#!/usr/bin/env python3
"""
Simple Frontend-Backend API Verification for Compliance System
"""

import re
import os

def extract_frontend_apis():
    """Extract API calls from frontend file"""
    frontend_file = "../../v15_enhanced_1/components/Compliance-Rule/services/enterprise-apis.ts"
    
    try:
        with open(frontend_file, 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ Frontend file not found: {frontend_file}")
        return []
    
    # Extract all API calls using apiClient.request
    api_pattern = r'return apiClient\.request[<\w\s>]*\(\{\s*method:\s*[\'"`](\w+)[\'"`],\s*url:\s*[\'"`]([^\'"`]+)[\'"`]'
    
    apis = []
    for match in re.finditer(api_pattern, content, re.DOTALL):
        method = match.group(1).upper()
        url = match.group(2)
        apis.append({
            'method': method,
            'url': url
        })
    
    return apis

def extract_backend_routes():
    """Extract backend routes"""
    backend_dir = "app/api/routes"
    route_files = [
        'compliance_rule_routes.py',
        'compliance_framework_routes.py', 
        'compliance_risk_routes.py',
        'compliance_reports_routes.py',
        'compliance_workflows_routes.py',
        'compliance_integrations_routes.py'
    ]
    
    routes = []
    for route_file in route_files:
        file_path = os.path.join(backend_dir, route_file)
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Extract router prefix
        prefix_match = re.search(r'router = APIRouter\(prefix="([^"]+)"', content)
        prefix = prefix_match.group(1) if prefix_match else ""
        
        # Extract route definitions
        route_pattern = r'@router\.(get|post|put|delete|patch)\("([^"]+)"[^)]*\)\s*(?:async\s+)?def\s+(\w+)'
        
        for match in re.finditer(route_pattern, content, re.MULTILINE):
            http_method = match.group(1).upper()
            route_path = match.group(2)
            function_name = match.group(3)
            
            full_url = f"{prefix}{route_path}"
            routes.append({
                'method': http_method,
                'url': full_url,
                'function': function_name,
                'file': route_file
            })
    
    return routes

def normalize_url(url):
    """Normalize URLs for comparison"""
    # Replace parameter patterns
    url = re.sub(r'\{[^}]+\}', '{id}', url)  # {rule_id} -> {id}
    url = re.sub(r'/\d+', '/{id}', url)      # /123 -> /{id}
    url = re.sub(r'\$\{[^}]+\}', '{id}', url)  # ${id} -> {id}
    return url

def verify_apis():
    """Verify frontend-backend API alignment"""
    print("🚀 SIMPLE COMPLIANCE API VERIFICATION")
    print("="*60)
    
    frontend_apis = extract_frontend_apis()
    backend_routes = extract_backend_routes()
    
    print(f"📊 Found {len(frontend_apis)} frontend API calls")
    print(f"📊 Found {len(backend_routes)} backend routes")
    print()
    
    # Check coverage
    matched = []
    missing = []
    
    for api in frontend_apis:
        found_match = False
        normalized_frontend = normalize_url(api['url'])
        
        for route in backend_routes:
            normalized_backend = normalize_url(route['url'])
            
            if (normalized_frontend == normalized_backend and 
                api['method'] == route['method']):
                matched.append({
                    'frontend': api,
                    'backend': route
                })
                found_match = True
                break
        
        if not found_match:
            missing.append(api)
    
    print("✅ MATCHED APIS:")
    print("-" * 40)
    for match in matched:
        print(f"  {match['frontend']['method']} {match['frontend']['url']}")
    
    print(f"\n❌ MISSING APIS ({len(missing)}):")
    print("-" * 40)
    for api in missing:
        print(f"  {api['method']} {api['url']}")
    
    print(f"\n📈 COVERAGE SUMMARY:")
    print("-" * 40)
    total = len(frontend_apis)
    if total > 0:
        coverage = len(matched) / total * 100
        print(f"Total APIs: {total}")
        print(f"Matched: {len(matched)} ({coverage:.1f}%)")
        print(f"Missing: {len(missing)} ({100-coverage:.1f}%)")
    else:
        print("No frontend APIs found")
    
    # Show some backend routes for reference
    print(f"\n📋 SAMPLE BACKEND ROUTES:")
    print("-" * 40)
    for i, route in enumerate(backend_routes[:10]):
        print(f"  {route['method']} {route['url']} ({route['file']})")
    if len(backend_routes) > 10:
        print(f"  ... and {len(backend_routes) - 10} more")

if __name__ == "__main__":
    verify_apis()