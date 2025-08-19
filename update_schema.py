import os
import subprocess

def copy_file_to_container(local_path, container_name, container_path):
    # Check if the local file exists
    if not os.path.exists(local_path):
        print(f"Error: Local file {local_path} does not exist.")
        return False
    
    # Copy the file to the container
    try:
        result = subprocess.run(
            ["docker", "cp", local_path, f"{container_name}:{container_path}"],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"Successfully copied {local_path} to {container_name}:{container_path}")
        print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error copying file: {e}")
        print(f"Error output: {e.stderr}")
        return False

def restart_container(container_name):
    # Restart the container
    try:
        result = subprocess.run(
            ["docker", "restart", container_name],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"Successfully restarted {container_name}")
        print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error restarting container: {e}")
        print(f"Error output: {e.stderr}")
        return False

# Create a Python script to update the database schema
schema_update_script = """
# update_schema.py
from sqlalchemy import create_engine, text
import os

# Get database connection string from environment variable
db_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@postgres:5432/data_governance')

# Create engine
engine = create_engine(db_url)

# SQL commands to update the field types
sql_commands = [
    # Update RacineOrchestrationMaster.created_by and last_modified_by
    "ALTER TABLE racine_orchestration_master ALTER COLUMN created_by TYPE INTEGER USING created_by::integer;",
    "ALTER TABLE racine_orchestration_master ALTER COLUMN last_modified_by TYPE INTEGER USING NULLIF(last_modified_by, '')::integer;",
    
    # Update RacineWorkspaceMember.user_id
    "ALTER TABLE racine_workspace_member ALTER COLUMN user_id TYPE INTEGER USING user_id::integer;",
    
    # Update RacineWorkspace.owner_id
    "ALTER TABLE racine_workspace ALTER COLUMN owner_id TYPE INTEGER USING owner_id::integer;",
    
    # Update RacineWorkspaceTemplate.created_by
    "ALTER TABLE racine_workspace_template ALTER COLUMN created_by TYPE INTEGER USING created_by::integer;"
]

# Execute each SQL command in separate transactions
for sql in sql_commands:
    try:
        with engine.begin() as connection:
            connection.execute(text(sql))
        print(f"Successfully executed: {sql}")
    except Exception as e:
        print(f"Error executing {sql}: {e}")

# Now try to update the ARRAY columns in separate transactions
array_sql_commands = [
    # Update ScanResult.classification_labels to ARRAY type
    "ALTER TABLE scan_result ALTER COLUMN classification_labels TYPE TEXT[] USING classification_labels::TEXT[];",
    
    # Update CustomScanRule.ml_model_references to ARRAY type
    "ALTER TABLE custom_scan_rule ALTER COLUMN ml_model_references TYPE TEXT[] USING ml_model_references::TEXT[];"
]

for sql in array_sql_commands:
    try:
        with engine.begin() as connection:
            connection.execute(text(sql))
        print(f"Successfully executed: {sql}")
    except Exception as e:
        print(f"Error executing {sql}: {e}")

print("Schema update completed.")
"""

# Write the schema update script to a file
with open("update_schema.py", "w") as f:
    f.write(schema_update_script)

# Define the paths
container_name = "data_governance_backend"
local_script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "update_schema.py")
container_script_path = "/app/update_schema.py"

# Copy the script to the container
success = copy_file_to_container(local_script_path, container_name, container_script_path)
if not success:
    print("Failed to copy the schema update script to the container.")
    exit(1)

# Run the script in the container
try:
    result = subprocess.run(
        ["docker", "exec", container_name, "python", "/app/update_schema.py"],
        capture_output=True,
        text=True,
        check=True
    )
    print("Schema update script executed successfully.")
    print(f"Output: {result.stdout}")
except subprocess.CalledProcessError as e:
    print(f"Error executing schema update script: {e}")
    print(f"Error output: {e.stderr}")

# Restart the container
restart_container(container_name)