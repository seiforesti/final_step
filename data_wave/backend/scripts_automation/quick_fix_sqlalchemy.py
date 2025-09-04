#!/usr/bin/env python3
"""
Quick fix for SQLAlchemy compatibility issues.
"""

import os
import sys

def fix_sqlalchemy_compatibility():
    """Fix SQLAlchemy compatibility issues."""
    
    print("🔧 Fixing SQLAlchemy compatibility issues...")
    
    # Update requirements.txt with compatible versions
    requirements_file = "requirements.txt"
    
    if os.path.exists(requirements_file):
        with open(requirements_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace SQLAlchemy version with a more compatible one
        content = content.replace(
            'sqlalchemy==2.0.23',
            'sqlalchemy==1.4.53'
        )
        
        # Also update SQLModel to a compatible version
        content = content.replace(
            'sqlmodel==0.0.14',
            'sqlmodel==0.0.12'
        )
        
        with open(requirements_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Updated requirements.txt with compatible SQLAlchemy version")
    
    # Create a simple database test script
    test_script = '''#!/usr/bin/env python3
"""
Simple database connectivity test.
"""

import os
import sys

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def test_database_connection():
    """Test basic database connection."""
    try:
        # Try to import and test database connection
        from app.db_session import engine
        from sqlalchemy import text
        
        print("🔍 Testing database connection...")
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Database connection test: PASSED")
                return True
            else:
                print("❌ Database connection test: FAILED - Unexpected result")
                return False
                
    except Exception as e:
        print(f"❌ Database connection test: FAILED - {e}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)
'''
    
    with open("test_db_connection.py", 'w', encoding='utf-8') as f:
        f.write(test_script)
    
    print("✅ Created simple database test script")
    print("🎉 SQLAlchemy compatibility fixes completed!")

if __name__ == "__main__":
    fix_sqlalchemy_compatibility()
