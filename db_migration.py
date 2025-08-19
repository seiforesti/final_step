import os
import json
from pathlib import Path
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Load database configuration
with open('db_config.json', 'r') as f:
    config = json.load(f)

def create_database():
    """Create database if it doesn't exist"""
    try:
        # First try to connect as postgres superuser
        conn = psycopg2.connect(
            user='postgres',
            password='postgres',
            host=config['host'],
            port=config['port']
        )
    except:
        print("❌ Could not connect as postgres user. Please ensure PostgreSQL is running and postgres user exists.")
        raise
        
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    with conn.cursor() as cur:
        # Create app_user role if not exists
        try:
            cur.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (config['user'],))
            exists = cur.fetchone()
            if not exists:
                print(f"Creating role {config['user']}...")
                cur.execute(f"CREATE ROLE {config['user']} WITH LOGIN PASSWORD %s", (config['password'],))
                print(f"✅ Role {config['user']} created successfully")
        except Exception as e:
            print(f"❌ Error creating role: {str(e)}")
            raise
    
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (config['dbname'],))
        exists = cur.fetchone()
        
        if not exists:
            print(f"Creating database {config['dbname']}...")
            try:
                cur.execute(f"CREATE DATABASE {config['dbname']} OWNER {config['user']}")
                print(f"✅ Database {config['dbname']} created successfully")
            except Exception as e:
                print(f"❌ Error creating database: {str(e)}")
                raise
                
        # Grant privileges
        cur.execute(f"GRANT ALL PRIVILEGES ON DATABASE {config['dbname']} TO {config['user']}")
    
    conn.close()

def run_migration(conn, sql_file):
    """Run a single SQL migration file"""
    print(f"Running migration: {sql_file}")
    with open(sql_file, 'r') as f:
        sql = f.read()
        
    with conn.cursor() as cur:
        try:
            cur.execute(sql)
            conn.commit()
            print(f"✅ Successfully ran migration: {sql_file}")
        except Exception as e:
            conn.rollback()
            print(f"❌ Error running migration {sql_file}: {str(e)}")
            raise

def main():
    """Run all migrations"""
    # Create database first
    create_database()
    
    # Connect to the specific database
    conn = psycopg2.connect(
        dbname=config['dbname'],
        user=config['user'],
        password=config['password'],
        host=config['host'],
        port=config['port']
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    migrations_dir = Path('migrations')
    if not migrations_dir.exists():
        print("Creating migrations directory...")
        migrations_dir.mkdir()
        
    # Get all .sql files in migrations directory
    migrations = sorted(migrations_dir.glob('*.sql'))
    
    try:
        for migration in migrations:
            run_migration(conn, str(migration))
            
        print("\n✨ All migrations completed successfully!")
            
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        raise
        
    finally:
        conn.close()

if __name__ == '__main__':
    main()
