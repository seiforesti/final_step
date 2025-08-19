import os
import subprocess

def run_sql_in_container(container_name, sql_command):
    """Run a SQL command in the PostgreSQL database inside the container"""
    try:
        # Create a temporary SQL file
        with open("temp_sql_command.sql", "w") as f:
            f.write(sql_command)
        
        # Copy the SQL file to the container
        copy_cmd = ["docker", "cp", "temp_sql_command.sql", f"{container_name}:/tmp/temp_sql_command.sql"]
        subprocess.run(copy_cmd, check=True, capture_output=True)
        
        # Execute the SQL file in the container
        exec_cmd = [
            "docker", "exec", container_name,
            "bash", "-c", "psql -U postgres -d data_governance -f /tmp/temp_sql_command.sql"
        ]
        
        result = subprocess.run(exec_cmd, capture_output=True, text=True)
        
        # Remove the temporary file
        os.remove("temp_sql_command.sql")
        
        if result.returncode == 0:
            print(f"Successfully executed SQL: {sql_command}")
            print(f"Output: {result.stdout}")
            return True
        else:
            print(f"Error executing SQL: {sql_command}")
            print(f"Error output: {result.stderr}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

def restart_container(container_name):
    """Restart the Docker container"""
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

# Container name
container_name = "data_governance_backend"

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

# Execute each SQL command
for sql in sql_commands:
    success = run_sql_in_container(container_name, sql)
    if not success:
        print(f"Failed to execute SQL: {sql}. Continuing with next command.")

# Restart the container
restart_container(container_name)