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

# Define the paths
base_dir = os.path.dirname(os.path.abspath(__file__))
racine_models_dir = os.path.join(base_dir, "data_wave", "backend", "scripts_automation", "app", "models", "racine_models")
container_name = "data_governance_backend"
container_base_path = "/app/app/models/racine_models"

# Files to copy
files_to_copy = [
    "racine_orchestration_models.py",
    "racine_workspace_models.py"
]

# Copy each file
for file_name in files_to_copy:
    local_file_path = os.path.join(racine_models_dir, file_name)
    container_file_path = f"{container_base_path}/{file_name}"
    
    success = copy_file_to_container(local_file_path, container_name, container_file_path)
    if not success:
        print(f"Failed to copy {file_name}. Aborting.")
        exit(1)

# Restart the container
restart_container(container_name)