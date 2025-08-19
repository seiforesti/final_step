import os
import subprocess

def copy_file_to_container():
    """
    Copy the updated scan_models.py file to the Docker container.
    """
    source_file = r"c:\Users\seifa\OneDrive\Desktop\final_correction\data_wave\backend\scripts_automation\app\models\scan_models.py"
    container_name = "data_governance_backend"
    container_path = "/app/app/models/scan_models.py"
    
    # Command to copy the file to the container
    cmd = f"docker cp \"{source_file}\" {container_name}:{container_path}"
    
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"Successfully copied {source_file} to {container_name}:{container_path}")
        print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error copying file: {e}")
        print(f"Error output: {e.stderr}")
        return False

def restart_container():
    """
    Restart the Docker container to apply the changes.
    """
    container_name = "data_governance_backend"
    
    try:
        result = subprocess.run(f"docker restart {container_name}", shell=True, check=True, capture_output=True, text=True)
        print(f"Successfully restarted {container_name}")
        print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error restarting container: {e}")
        print(f"Error output: {e.stderr}")
        return False

if __name__ == "__main__":
    # Copy the updated file to the container
    if copy_file_to_container():
        # Restart the container to apply changes
        restart_container()