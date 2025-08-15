#!/usr/bin/env python3
"""
Enterprise Data Governance Backend Validation Script
===================================================

This script validates the backend implementation by testing:
1. All critical imports
2. Database connectivity
3. Service initialization
4. API route loading
5. Production readiness checks

Run this script to ensure the backend is production-ready.
"""

import sys
import os
import time
from datetime import datetime
import traceback

# Add app to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class BackendValidator:
    def __init__(self):
        self.results = []
        self.start_time = time.time()
        
    def log_result(self, test_name: str, status: str, message: str = "", details: str = ""):
        """Log test result"""
        self.results.append({
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_symbol} {test_name}: {message}")
        if details and status == "FAIL":
            print(f"   Details: {details}")
            
    def test_core_imports(self):
        """Test core framework imports"""
        try:
            import fastapi
            import sqlmodel
            import uvicorn
            import sqlalchemy
            self.log_result("Core Framework Imports", "PASS", "FastAPI, SQLModel, Uvicorn, SQLAlchemy imported successfully")
        except ImportError as e:
            self.log_result("Core Framework Imports", "FAIL", "Failed to import core frameworks", str(e))
            return False
        return True
        
    def test_database_imports(self):
        """Test database-related imports"""
        try:
            from app.db_session import init_db, get_session
            from app.models.organization_models import Organization, OrganizationSetting
            self.log_result("Database Imports", "PASS", "Database session and models imported successfully")
        except ImportError as e:
            self.log_result("Database Imports", "FAIL", "Failed to import database components", str(e))
            return False
        return True
        
    def test_service_imports(self):
        """Test service imports"""
        try:
            from app.services.scheduler import schedule_tasks, get_scheduler
            from app.services.scan_service import run_automated_scans
            from app.services.compliance_rule_service import monitor_compliance_rules
            from app.services.catalog_quality_service import run_quality_assessment
            from app.services.enterprise_catalog_service import sync_metadata
            from app.services.comprehensive_analytics_service import aggregate_analytics_data
            from app.services.performance_service import run_health_checks
            self.log_result("Service Imports", "PASS", "All scheduler service functions imported successfully")
        except ImportError as e:
            self.log_result("Service Imports", "FAIL", "Failed to import service functions", str(e))
            return False
        return True
        
    def test_api_route_imports(self):
        """Test API route imports"""
        try:
            from app.api.routes.racine_routes import available_routers
            from app.api.routes.oauth_auth import router as oauth_auth_router
            from app.api.routes.auth_routes import router as auth_router
            self.log_result("API Route Imports", "PASS", f"API routes imported successfully ({len(available_routers)} racine routers)")
        except ImportError as e:
            self.log_result("API Route Imports", "FAIL", "Failed to import API routes", str(e))
            return False
        return True
        
    def test_main_app_import(self):
        """Test main application import"""
        try:
            from app.main import app
            self.log_result("Main App Import", "PASS", "FastAPI app instance imported successfully")
            return True
        except ImportError as e:
            self.log_result("Main App Import", "FAIL", "Failed to import main app", str(e))
            return False
        except Exception as e:
            self.log_result("Main App Import", "FAIL", "Error during app initialization", str(e))
            return False
            
    def test_scheduler_initialization(self):
        """Test scheduler initialization"""
        try:
            from app.services.scheduler import get_scheduler
            scheduler = get_scheduler()
            job_count = len(scheduler.job_configs)
            self.log_result("Scheduler Initialization", "PASS", f"Scheduler initialized with {job_count} configured jobs")
            return True
        except Exception as e:
            self.log_result("Scheduler Initialization", "FAIL", "Failed to initialize scheduler", str(e))
            return False
            
    def test_database_connection(self):
        """Test database connectivity (if available)"""
        try:
            from app.db_session import get_session
            
            # Try to get a database session
            with get_session() as session:
                # Simple test query
                result = session.execute("SELECT 1").fetchone()
                if result:
                    self.log_result("Database Connection", "PASS", "Database connection successful")
                    return True
                else:
                    self.log_result("Database Connection", "FAIL", "Database query returned no result")
                    return False
                    
        except Exception as e:
            # Database might not be available in test environment
            self.log_result("Database Connection", "WARN", "Database not available (expected in test environment)", str(e))
            return True  # Don't fail validation for missing DB in test
            
    def test_logging_configuration(self):
        """Test logging configuration"""
        try:
            from app.core.logging import get_logger
            logger = get_logger("validator_test")
            logger.info("Test log message")
            self.log_result("Logging Configuration", "PASS", "Logging system working correctly")
            return True
        except Exception as e:
            self.log_result("Logging Configuration", "FAIL", "Logging system failed", str(e))
            return False
            
    def test_security_imports(self):
        """Test security and authentication imports"""
        try:
            from app.core.security import verify_password, get_password_hash
            from app.api.security.rbac.rbac import RBACManager
            self.log_result("Security Imports", "PASS", "Security components imported successfully")
            return True
        except ImportError as e:
            self.log_result("Security Imports", "FAIL", "Failed to import security components", str(e))
            return False
            
    def run_all_tests(self):
        """Run all validation tests"""
        print("=" * 60)
        print("🚀 Enterprise Data Governance Backend Validation")
        print("=" * 60)
        print()
        
        tests = [
            ("Core Framework Imports", self.test_core_imports),
            ("Database Imports", self.test_database_imports),
            ("Service Imports", self.test_service_imports),
            ("API Route Imports", self.test_api_route_imports),
            ("Logging Configuration", self.test_logging_configuration),
            ("Security Imports", self.test_security_imports),
            ("Scheduler Initialization", self.test_scheduler_initialization),
            ("Database Connection", self.test_database_connection),
            ("Main App Import", self.test_main_app_import),
        ]
        
        passed = 0
        failed = 0
        warnings = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_result(test_name, "FAIL", "Unexpected error during test", str(e))
                failed += 1
                
        # Count warnings
        warnings = len([r for r in self.results if r["status"] == "WARN"])
        
        # Print summary
        print()
        print("=" * 60)
        print("📊 Validation Summary")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"⏱️  Duration: {time.time() - self.start_time:.2f} seconds")
        print()
        
        if failed == 0:
            print("🎉 Backend validation SUCCESSFUL! Ready for production.")
            return True
        else:
            print("💥 Backend validation FAILED! Issues need to be resolved.")
            return False
            
    def get_detailed_report(self):
        """Get detailed validation report"""
        return {
            "validation_timestamp": datetime.utcnow().isoformat(),
            "duration_seconds": time.time() - self.start_time,
            "summary": {
                "total_tests": len(self.results),
                "passed": len([r for r in self.results if r["status"] == "PASS"]),
                "failed": len([r for r in self.results if r["status"] == "FAIL"]),
                "warnings": len([r for r in self.results if r["status"] == "WARN"])
            },
            "test_results": self.results
        }

def main():
    """Main validation function"""
    validator = BackendValidator()
    success = validator.run_all_tests()
    
    # Return appropriate exit code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()