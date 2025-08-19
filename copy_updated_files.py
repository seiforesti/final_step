import os
import subprocess

def copy_files_to_container(source_dir, container_name, target_dir):
    copied_files = []
    for root, _, files in os.walk(source_dir):
        for file in files:
            if file.endswith('.py'):
                source_path = os.path.join(root, file)
                # Get the relative path from source_dir
                rel_path = os.path.relpath(source_path, source_dir)
                # Construct the target path in the container
                target_path = os.path.join(target_dir, rel_path).replace('\\', '/')
                
                # Create the directory structure in the container if needed
                target_dir_path = os.path.dirname(target_path)
                subprocess.run([
                    'docker', 'exec', container_name, 'mkdir', '-p', target_dir_path
                ], check=False)
                
                # Copy the file to the container
                cmd = ['docker', 'cp', source_path, f"{container_name}:{target_path}"]
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    copied_files.append((source_path, target_path))
                else:
                    print(f"Failed to copy {source_path}: {result.stderr}")
    
    return copied_files

if __name__ == "__main__":
    source_dir = r"c:\Users\seifa\OneDrive\Desktop\final_correction\data_wave\backend\scripts_automation\app\models"
    container_name = "data_governance_backend"
    target_dir = "/app/app/models"
    
    copied_files = copy_files_to_container(source_dir, container_name, target_dir)
    
    print(f"Copied {len(copied_files)} files to container:")
    for source, target in copied_files:
        print(f"  - {source} -> {target}")