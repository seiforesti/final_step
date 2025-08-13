#!/usr/bin/env python3
"""
Comprehensive Frontend-Backend API Verification for Compliance System
Analyzes the enterprise-apis.ts file and verifies all APIs have backend implementations
"""

import re
import os
from typing import Dict, List, Tuple, Set
from pathlib import Path

class ComplianceFrontendBackendVerifier:
    def __init__(self):
        self.frontend_file = "../../v15_enhanced_1/components/Compliance-Rule/services/enterprise-apis.ts"
        self.backend_routes_dir = "app/api/routes"
        self.frontend_apis = {}
        self.backend_routes = {}
        self.missing_apis = []
        self.extra_apis = []
        self.matched_apis = []
        
    def extract_frontend_apis(self):
        """Extract all API calls from frontend enterprise-apis.ts"""
        print("🔍 Analyzing frontend APIs from enterprise-apis.ts...")
        
        try:
            with open(self.frontend_file, 'r') as f:
                content = f.read()
        except FileNotFoundError:
            print(f"❌ Frontend file not found: {self.frontend_file}")
            return
        
        # Extract API classes and their methods
        class_pattern = r'export class (\w+API) \{(.*?)(?=\n\}|\nexport|\nclass|\n\/\/|$)'
        method_pattern = r'static async (\w+)\([^)]*\):[^{]*?\{.*?url:\s*[\'"`]([^\'"`]+)[\'"`].*?method:\s*[\'"`]([^\'"`]+)[\'"`]'
        
        # Find all API classes
        for class_match in re.finditer(class_pattern, content, re.DOTALL):
            class_name = class_match.group(1)
            class_content = class_match.group(2)
            
            self.frontend_apis[class_name] = []
            
            # Find methods within each class
            for method_match in re.finditer(method_pattern, class_content, re.DOTALL | re.IGNORECASE):
                method_name = method_match.group(1)
                url = method_match.group(2)
                http_method = method_match.group(3).upper()
                
                # Clean up URL - remove parameter placeholders
                clean_url = re.sub(r'\$\{[^}]+\}', '{id}', url)
                
                self.frontend_apis[class_name].append({
                    'method': method_name,
                    'url': clean_url,
                    'http_method': http_method,
                    'full_url': url
                })
        
        print(f"✅ Extracted {sum(len(methods) for methods in self.frontend_apis.values())} frontend API methods from {len(self.frontend_apis)} classes")
        
        # Print summary by class
        for class_name, methods in self.frontend_apis.items():
            print(f"   📁 {class_name}: {len(methods)} methods")
    
    def extract_backend_routes(self):
        """Extract all routes from backend route files"""
        print("\n🔍 Analyzing backend routes...")
        
        route_files = [
            'compliance_rule_routes.py',
            'compliance_framework_routes.py', 
            'compliance_risk_routes.py',
            'compliance_reports_routes.py',
            'compliance_workflows_routes.py',
            'compliance_integrations_routes.py'
        ]
        
        for route_file in route_files:
            file_path = os.path.join(self.backend_routes_dir, route_file)
            if not os.path.exists(file_path):
                print(f"⚠️  Route file not found: {route_file}")
                continue
                
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Extract router prefix
            prefix_match = re.search(r'router = APIRouter\(prefix="([^"]+)"', content)
            prefix = prefix_match.group(1) if prefix_match else ""
            
            # Extract route definitions
            route_pattern = r'@router\.(get|post|put|delete|patch)\("([^"]+)"[^)]*\)\s*(?:async\s+)?def\s+(\w+)'
            
            routes = []
            for match in re.finditer(route_pattern, content, re.MULTILINE):
                http_method = match.group(1).upper()
                route_path = match.group(2)
                function_name = match.group(3)
                
                # Construct full URL
                full_url = f"{prefix}{route_path}"
                
                routes.append({
                    'method': http_method,
                    'path': route_path,
                    'full_url': full_url,
                    'function': function_name
                })
            
            self.backend_routes[route_file] = {
                'prefix': prefix,
                'routes': routes
            }
            
            print(f"   📁 {route_file}: {len(routes)} routes (prefix: {prefix})")
        
        total_routes = sum(len(data['routes']) for data in self.backend_routes.values())
        print(f"✅ Extracted {total_routes} backend routes from {len(self.backend_routes)} files")
    
    def normalize_url(self, url: str) -> str:
        """Normalize URLs for comparison"""
        # Replace parameter patterns
        url = re.sub(r'\{[^}]+\}', '{id}', url)  # {rule_id} -> {id}
        url = re.sub(r'/\d+', '/{id}', url)      # /123 -> /{id}
        return url
    
    def find_matching_route(self, frontend_api: Dict) -> Tuple[str, Dict, bool]:
        """Find matching backend route for a frontend API"""
        frontend_url = self.normalize_url(frontend_api['url'])
        frontend_method = frontend_api['http_method']
        
        for file_name, file_data in self.backend_routes.items():
            for route in file_data['routes']:
                backend_url = self.normalize_url(route['full_url'])
                backend_method = route['method']
                
                # Check for exact match
                if frontend_url == backend_url and frontend_method == backend_method:
                    return file_name, route, True
                
                # Check for partial match (same path, different method)
                if frontend_url == backend_url:
                    return file_name, route, False
        
        return None, None, False
    
    def verify_api_coverage(self):
        """Verify that all frontend APIs have backend implementations"""
        print("\n🔍 Verifying API coverage...")
        
        all_frontend_apis = []
        for class_name, methods in self.frontend_apis.items():
            for method in methods:
                method['class'] = class_name
                all_frontend_apis.append(method)
        
        print(f"\n📊 VERIFICATION RESULTS:")
        print(f"{'='*80}")
        
        matched_count = 0
        missing_count = 0
        method_mismatch_count = 0
        
        for api in all_frontend_apis:
            file_name, route, exact_match = self.find_matching_route(api)
            
            if exact_match:
                matched_count += 1
                self.matched_apis.append({
                    'frontend': api,
                    'backend': route,
                    'file': file_name
                })
                print(f"✅ {api['class']}.{api['method']} -> {api['http_method']} {api['url']}")
                
            elif route:  # Partial match (URL exists but method differs)
                method_mismatch_count += 1
                print(f"⚠️  {api['class']}.{api['method']} -> {api['http_method']} {api['url']}")
                print(f"   Backend has: {route['method']} {route['full_url']}")
                
            else:  # No matching route found
                missing_count += 1
                self.missing_apis.append(api)
                print(f"❌ {api['class']}.{api['method']} -> {api['http_method']} {api['url']}")
        
        # Summary
        total_apis = len(all_frontend_apis)
        print(f"\n📈 COVERAGE SUMMARY:")
        print(f"{'='*50}")
        print(f"Total Frontend APIs: {total_apis}")
        if total_apis > 0:
            print(f"✅ Matched APIs: {matched_count} ({matched_count/total_apis*100:.1f}%)")
            print(f"⚠️  Method Mismatches: {method_mismatch_count} ({method_mismatch_count/total_apis*100:.1f}%)")
            print(f"❌ Missing APIs: {missing_count} ({missing_count/total_apis*100:.1f}%)")
        else:
            print("❌ No frontend APIs found to verify")
        
        # Detailed analysis by class
        print(f"\n📊 COVERAGE BY API CLASS:")
        print(f"{'='*50}")
        
        for class_name, methods in self.frontend_apis.items():
            class_total = len(methods)
            class_matched = sum(1 for api in self.matched_apis if api['frontend']['class'] == class_name)
            class_missing = sum(1 for api in self.missing_apis if api['class'] == class_name)
            
            coverage_pct = (class_matched / class_total * 100) if class_total > 0 else 0
            print(f"{class_name}:")
            print(f"  Total: {class_total}, Matched: {class_matched}, Missing: {class_missing}")
            print(f"  Coverage: {coverage_pct:.1f}%")
    
    def analyze_missing_apis(self):
        """Provide detailed analysis of missing APIs"""
        if not self.missing_apis:
            print("\n🎉 ALL FRONTEND APIS HAVE BACKEND IMPLEMENTATIONS!")
            return
        
        print(f"\n❌ MISSING API IMPLEMENTATIONS ({len(self.missing_apis)} total):")
        print(f"{'='*80}")
        
        # Group by class
        missing_by_class = {}
        for api in self.missing_apis:
            class_name = api['class']
            if class_name not in missing_by_class:
                missing_by_class[class_name] = []
            missing_by_class[class_name].append(api)
        
        for class_name, apis in missing_by_class.items():
            print(f"\n📁 {class_name} ({len(apis)} missing):")
            for api in apis:
                print(f"   ❌ {api['method']} -> {api['http_method']} {api['url']}")
        
        # Suggest which route files need these endpoints
        print(f"\n💡 IMPLEMENTATION SUGGESTIONS:")
        print(f"{'='*50}")
        
        route_suggestions = {
            'ComplianceManagementAPI': 'compliance_rule_routes.py',
            'FrameworkIntegrationAPI': 'compliance_framework_routes.py',
            'RiskAssessmentAPI': 'compliance_risk_routes.py',
            'AuditReportingAPI': 'compliance_reports_routes.py',
            'WorkflowAutomationAPI': 'compliance_workflows_routes.py',
            'IntegrationAPI': 'compliance_integrations_routes.py'
        }
        
        for class_name, apis in missing_by_class.items():
            suggested_file = route_suggestions.get(class_name, 'unknown_routes.py')
            print(f"\n📝 Add to {suggested_file}:")
            for api in apis:
                print(f"   @router.{api['http_method'].lower()}(\"{api['url'].replace('/api/v1', '')}\")")
                print(f"   async def {api['method'].lower()}(...):")
                print(f"       # Implement {api['method']} logic")
                print()
    
    def check_extra_backend_routes(self):
        """Check for backend routes that don't have frontend API calls"""
        print(f"\n🔍 CHECKING FOR UNUSED BACKEND ROUTES:")
        print(f"{'='*50}")
        
        # Get all backend routes
        all_backend_routes = []
        for file_name, file_data in self.backend_routes.items():
            for route in file_data['routes']:
                route['file'] = file_name
                all_backend_routes.append(route)
        
        # Find routes without frontend matches
        unused_routes = []
        for route in all_backend_routes:
            found_match = False
            normalized_backend_url = self.normalize_url(route['full_url'])
            
            for class_name, methods in self.frontend_apis.items():
                for method in methods:
                    normalized_frontend_url = self.normalize_url(method['url'])
                    if (normalized_backend_url == normalized_frontend_url and 
                        route['method'] == method['http_method']):
                        found_match = True
                        break
                if found_match:
                    break
            
            if not found_match:
                unused_routes.append(route)
        
        if unused_routes:
            print(f"⚠️  Found {len(unused_routes)} backend routes without frontend API calls:")
            for route in unused_routes:
                print(f"   {route['method']} {route['full_url']} ({route['file']})")
        else:
            print("✅ All backend routes have corresponding frontend API calls")
    
    def generate_implementation_report(self):
        """Generate a comprehensive implementation report"""
        print(f"\n📄 GENERATING IMPLEMENTATION REPORT...")
        
        report_file = "COMPLIANCE_API_VERIFICATION_REPORT.md"
        
        with open(report_file, 'w') as f:
            f.write("# Compliance API Verification Report\n\n")
            f.write("## Summary\n\n")
            
            total_apis = sum(len(methods) for methods in self.frontend_apis.values())
            matched_count = len(self.matched_apis)
            missing_count = len(self.missing_apis)
            
            f.write(f"- **Total Frontend APIs**: {total_apis}\n")
            if total_apis > 0:
                f.write(f"- **✅ Implemented APIs**: {matched_count} ({matched_count/total_apis*100:.1f}%)\n")
                f.write(f"- **❌ Missing APIs**: {missing_count} ({missing_count/total_apis*100:.1f}%)\n\n")
            else:
                f.write("- **✅ Implemented APIs**: 0 (0.0%)\n")
                f.write("- **❌ Missing APIs**: 0 (0.0%)\n\n")
            
            # Coverage by class
            f.write("## Coverage by API Class\n\n")
            for class_name, methods in self.frontend_apis.items():
                class_total = len(methods)
                class_matched = sum(1 for api in self.matched_apis if api['frontend']['class'] == class_name)
                coverage_pct = (class_matched / class_total * 100) if class_total > 0 else 0
                f.write(f"### {class_name}\n")
                f.write(f"- Coverage: {coverage_pct:.1f}% ({class_matched}/{class_total})\n\n")
            
            # Missing APIs
            if self.missing_apis:
                f.write("## Missing API Implementations\n\n")
                missing_by_class = {}
                for api in self.missing_apis:
                    class_name = api['class']
                    if class_name not in missing_by_class:
                        missing_by_class[class_name] = []
                    missing_by_class[class_name].append(api)
                
                for class_name, apis in missing_by_class.items():
                    f.write(f"### {class_name}\n\n")
                    for api in apis:
                        f.write(f"- ❌ `{api['method']}` -> `{api['http_method']} {api['url']}`\n")
                    f.write("\n")
            
            # Matched APIs
            f.write("## Successfully Implemented APIs\n\n")
            matched_by_class = {}
            for api in self.matched_apis:
                class_name = api['frontend']['class']
                if class_name not in matched_by_class:
                    matched_by_class[class_name] = []
                matched_by_class[class_name].append(api)
            
            for class_name, apis in matched_by_class.items():
                f.write(f"### {class_name}\n\n")
                for api in apis:
                    frontend = api['frontend']
                    backend = api['backend']
                    f.write(f"- ✅ `{frontend['method']}` -> `{frontend['http_method']} {frontend['url']}`\n")
                    f.write(f"  - Backend: `{backend['function']}` in `{api['file']}`\n")
                f.write("\n")
        
        print(f"✅ Report generated: {report_file}")
    
    def run_verification(self):
        """Run the complete verification process"""
        print("🚀 STARTING COMPLIANCE FRONTEND-BACKEND API VERIFICATION")
        print("="*80)
        
        self.extract_frontend_apis()
        self.extract_backend_routes() 
        self.verify_api_coverage()
        self.analyze_missing_apis()
        self.check_extra_backend_routes()
        self.generate_implementation_report()
        
        print(f"\n🎯 VERIFICATION COMPLETE!")
        print("="*80)

if __name__ == "__main__":
    verifier = ComplianceFrontendBackendVerifier()
    verifier.run_verification()