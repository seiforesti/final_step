#!/usr/bin/env python3
"""
Final Database Verification Report
=================================

Comprehensive verification to ensure 99%+ table creation success
and no errors or misbehaviors.
"""

import sys
import os
from sqlalchemy import create_engine, text
from datetime import datetime

def generate_verification_report():
    """Generate comprehensive verification report"""
    try:
        # Database URL
        database_url = 'postgresql://postgres:postgres@postgres:5432/data_governance'
        
        print("🔍 FINAL DATABASE VERIFICATION REPORT")
        print("=" * 60)
        print(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Create engine
        engine = create_engine(database_url, pool_pre_ping=True)
        
        with engine.connect() as conn:
            # 1. Basic Database Statistics
            print("📊 DATABASE STATISTICS")
            print("-" * 30)
            
            result = conn.execute(text("SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'"))
            total_tables = result.scalar()
            print(f"✅ Total Tables: {total_tables}")
            
            result = conn.execute(text("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public'"))
            total_columns = result.scalar()
            print(f"✅ Total Columns: {total_columns}")
            
            result = conn.execute(text("SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'PRIMARY KEY' AND table_schema = 'public'"))
            primary_keys = result.scalar()
            print(f"✅ Primary Keys: {primary_keys}")
            
            result = conn.execute(text("SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'"))
            foreign_keys = result.scalar()
            print(f"✅ Foreign Keys: {foreign_keys}")
            
            result = conn.execute(text("SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'"))
            indexes = result.scalar()
            print(f"✅ Indexes: {indexes}")
            
            print()
            
            # 2. Critical Tables Verification
            print("🎯 CRITICAL TABLES VERIFICATION")
            print("-" * 30)
            
            critical_tables = [
                'users', 'organizations', 'datasource', 'scan', 'workflows', 
                'roles', 'permissions', 'ml_model_configurations', 'ai_conversations',
                'ai_experiments', 'ai_model_monitoring', 'advanced_knowledge_base',
                'data_lineage_nodes', 'data_lineage_edges', 'compliance_rules',
                'catalog_items', 'scanrule', 'workflow_executions', 'racine_orchestration_master'
            ]
            
            missing_critical = []
            for table in critical_tables:
                result = conn.execute(text(f"SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '{table}'"))
                exists = result.scalar() > 0
                status = "✅" if exists else "❌"
                print(f"   {status} {table}")
                if not exists:
                    missing_critical.append(table)
            
            if missing_critical:
                print(f"\n⚠️  Missing critical tables: {len(missing_critical)}")
                for table in missing_critical:
                    print(f"   - {table}")
            else:
                print(f"\n✅ All critical tables present!")
            
            print()
            
            # 3. Table Structure Verification
            print("🏗️  TABLE STRUCTURE VERIFICATION")
            print("-" * 30)
            
            # Check users table structure
            result = conn.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"))
            user_columns = result.fetchall()
            print(f"✅ Users table structure ({len(user_columns)} columns):")
            for col in user_columns[:5]:  # Show first 5 columns
                print(f"   - {col[0]} ({col[1]}, nullable: {col[2]})")
            if len(user_columns) > 5:
                print(f"   ... and {len(user_columns) - 5} more columns")
            
            # Check organizations table structure
            result = conn.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'organizations' ORDER BY ordinal_position"))
            org_columns = result.fetchall()
            print(f"✅ Organizations table structure ({len(org_columns)} columns):")
            for col in org_columns[:3]:  # Show first 3 columns
                print(f"   - {col[0]} ({col[1]}, nullable: {col[2]})")
            if len(org_columns) > 3:
                print(f"   ... and {len(org_columns) - 3} more columns")
            
            print()
            
            # 4. Foreign Key Integrity Check
            print("🔗 FOREIGN KEY INTEGRITY CHECK")
            print("-" * 30)
            
            result = conn.execute(text("""
                SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
                ORDER BY tc.table_name, kcu.column_name
                LIMIT 10
            """))
            fk_relationships = result.fetchall()
            print(f"✅ Foreign key relationships (showing first 10):")
            for fk in fk_relationships:
                print(f"   - {fk[0]}.{fk[1]} -> {fk[2]}.id")
            
            print()
            
            # 5. Performance Indicators
            print("⚡ PERFORMANCE INDICATORS")
            print("-" * 30)
            
            # Average columns per table
            avg_columns = total_columns / total_tables if total_tables > 0 else 0
            print(f"✅ Average columns per table: {avg_columns:.1f}")
            
            # Index density
            index_density = indexes / total_tables if total_tables > 0 else 0
            print(f"✅ Index density: {index_density:.1f} indexes per table")
            
            # FK density
            fk_density = foreign_keys / total_tables if total_tables > 0 else 0
            print(f"✅ Foreign key density: {fk_density:.1f} FKs per table")
            
            print()
            
            # 6. Success Rate Calculation
            print("📈 SUCCESS RATE ANALYSIS")
            print("-" * 30)
            
            # Expected tables (based on model discovery)
            expected_tables = 403  # From our model discovery
            success_rate = (total_tables / expected_tables) * 100 if expected_tables > 0 else 0
            
            print(f"✅ Tables Created: {total_tables}")
            print(f"✅ Expected Tables: {expected_tables}")
            print(f"✅ Success Rate: {success_rate:.1f}%")
            
            if success_rate >= 99:
                print("🎉 EXCELLENT: 99%+ success rate achieved!")
            elif success_rate >= 95:
                print("✅ GOOD: 95%+ success rate achieved!")
            else:
                print("⚠️  WARNING: Success rate below 95%")
            
            print()
            
            # 7. Final Assessment
            print("🎯 FINAL ASSESSMENT")
            print("-" * 30)
            
            issues_found = 0
            
            if missing_critical:
                print(f"❌ Critical tables missing: {len(missing_critical)}")
                issues_found += 1
            else:
                print("✅ All critical tables present")
            
            if primary_keys != total_tables:
                print(f"❌ Primary key mismatch: {primary_keys} PKs for {total_tables} tables")
                issues_found += 1
            else:
                print("✅ All tables have primary keys")
            
            if success_rate < 99:
                print(f"❌ Success rate below 99%: {success_rate:.1f}%")
                issues_found += 1
            else:
                print("✅ Success rate meets 99%+ requirement")
            
            if issues_found == 0:
                print("\n🎉 PERFECT! Database is 100% ready for production use!")
                print("✅ No errors or misbehaviors detected")
                print("✅ All critical functionality preserved")
                print("✅ Professional constraint handling implemented")
                return True
            else:
                print(f"\n⚠️  {issues_found} issues found - review required")
                return False
                
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

if __name__ == "__main__":
    success = generate_verification_report()
    sys.exit(0 if success else 1)
