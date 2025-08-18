"""
Test script to validate enterprise data governance imports and utilities.

This script tests the key imports and utility functions to ensure
proper integration after the import fixes.
"""

import sys
import traceback

def test_import(module_name, description=""):
    """Test importing a module and report results."""
    try:
        if module_name == "db_session":
            from db_session import get_session, get_db
            print(f"✅ {module_name}: Successfully imported get_session and get_db")
        elif module_name == "rbac":
            from api.security.rbac import get_current_user, check_permission
            print(f"✅ {module_name}: Successfully imported RBAC functions")
        elif module_name == "rate_limiter":
            from utils.rate_limiter import check_rate_limit, EnterpriseRateLimiter
            print(f"✅ {module_name}: Successfully imported rate limiting utilities")
        elif module_name == "cache":
            from utils.cache import get_cache, EnterpriseCache
            print(f"✅ {module_name}: Successfully imported cache utilities")
        elif module_name == "config":
            from core.config import settings, Settings
            print(f"✅ {module_name}: Successfully imported configuration system")
        elif module_name == "settings":
            from core.settings import get_setting, settings_manager
            print(f"✅ {module_name}: Successfully imported runtime settings")
        elif module_name == "logging_config":
            from core.logging_config import get_logger, configure_enterprise_logging
            print(f"✅ {module_name}: Successfully imported logging configuration")
        elif module_name == "cache_manager":
            from core.cache_manager import get_cache_manager, cache_get
            print(f"✅ {module_name}: Successfully imported cache manager")
        else:
            exec(f"import {module_name}")
            print(f"✅ {module_name}: Successfully imported")
        
        return True
    except Exception as e:
        print(f"❌ {module_name}: Import failed - {str(e)}")
        if "detailed" in description.lower():
            traceback.print_exc()
        return False

def test_core_services():
    """Test importing core enterprise services."""
    services = [
        ("services.enterprise_catalog_service", "Enterprise Catalog Service"),
        ("services.enterprise_scan_rule_service", "Enterprise Scan Rules Service"), 
        ("services.unified_scan_manager", "Unified Scan Manager"),
        ("services.scan_intelligence_service", "Scan Intelligence Service"),
        ("services.advanced_lineage_service", "Advanced Lineage Service"),
    ]
    
    success_count = 0
    for service, description in services:
        if test_import(service, description):
            success_count += 1
    
    return success_count, len(services)

def test_core_routes():
    """Test importing core enterprise routes."""
    routes = [
        ("api.routes.enterprise_catalog_routes", "Enterprise Catalog Routes"),
        ("api.routes.enterprise_scan_rules_routes", "Enterprise Scan Rules Routes"),
        ("api.routes.scan_orchestration_routes", "Scan Orchestration Routes"),
        ("api.routes.intelligent_scanning_routes", "Intelligent Scanning Routes"),
        ("api.routes.scan_analytics_routes", "Scan Analytics Routes"),
    ]
    
    success_count = 0
    for route, description in routes:
        if test_import(route, description):
            success_count += 1
    
    return success_count, len(routes)

def test_main_application():
    """Test that the main application can be imported."""
    try:
        # This will test that main.py can be loaded with all its imports
        import main
        print("✅ main.py: Successfully imported main application")
        return True
    except Exception as e:
        print(f"❌ main.py: Failed to import main application - {str(e)}")
        return False

def main():
    """Run all import tests."""
    print("🔍 ENTERPRISE DATA GOVERNANCE - IMPORT VALIDATION TESTS")
    print("=" * 60)
    
    # Test core utilities
    print("\n📦 Testing Core Utilities:")
    utilities = [
        ("db_session", "Database Session Management"),
        ("rbac", "RBAC Security System"),
        ("rate_limiter", "Enterprise Rate Limiter"),
        ("cache", "Enterprise Cache System"),
        ("config", "Configuration Management"),
        ("settings", "Runtime Settings"),
        ("logging_config", "Logging Configuration"),
        ("cache_manager", "Cache Manager"),
    ]
    
    util_success = 0
    for util, desc in utilities:
        if test_import(util, desc):
            util_success += 1
    
    # Test core services
    print("\n🛠️  Testing Core Services:")
    service_success, service_total = test_core_services()
    
    # Test core routes
    print("\n🔗 Testing Core Routes:")
    route_success, route_total = test_core_routes()
    
    # Test main application
    print("\n🚀 Testing Main Application:")
    main_success = test_main_application()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 IMPORT VALIDATION SUMMARY:")
    print(f"  Utilities: {util_success}/{len(utilities)} ({'✅' if util_success == len(utilities) else '❌'})")
    print(f"  Services:  {service_success}/{service_total} ({'✅' if service_success == service_total else '❌'})")
    print(f"  Routes:    {route_success}/{route_total} ({'✅' if route_success == route_total else '❌'})")
    print(f"  Main App:  {'✅' if main_success else '❌'}")
    
    total_success = util_success + service_success + route_success + (1 if main_success else 0)
    total_tests = len(utilities) + service_total + route_total + 1
    
    print(f"\n🎯 OVERALL: {total_success}/{total_tests} ({(total_success/total_tests)*100:.1f}%)")
    
    if total_success == total_tests:
        print("🎉 ALL IMPORTS SUCCESSFUL - SYSTEM READY FOR PRODUCTION!")
        return 0
    else:
        print("⚠️  SOME IMPORTS FAILED - CHECK DEPENDENCIES AND PATHS")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)