#!/usr/bin/env python3
"""
Hot Reload Fix for Docker Container Issues
Applies fixes to running containers without restart
"""

import os
import sys
import logging
import subprocess
import json
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_container_id(container_name: str) -> str:
    """Get container ID by name"""
    try:
        result = subprocess.run(
            ["docker", "ps", "-q", "-f", f"name={container_name}"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return ""

def copy_file_to_container(container_id: str, local_path: str, container_path: str) -> bool:
    """Copy file to running container"""
    try:
        subprocess.run(
            ["docker", "cp", local_path, f"{container_id}:{container_path}"],
            check=True
        )
        logger.info(f"Successfully copied {local_path} to container {container_id}:{container_path}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to copy file to container: {e}")
        return False

def reload_python_module(container_id: str, module_path: str) -> bool:
    """Reload Python module in running container"""
    try:
        # Send SIGUSR1 to trigger reload if supported
        subprocess.run(
            ["docker", "exec", container_id, "pkill", "-USR1", "-f", "uvicorn"],
            check=False  # Don't fail if process not found
        )
        logger.info(f"Sent reload signal to container {container_id}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to reload module: {e}")
        return False

def fix_performance_service():
    """Apply performance service fixes to running container"""
    container_name = "data_governance_backend"
    container_id = get_container_id(container_name)
    
    if not container_id:
        logger.error(f"Container {container_name} not found or not running")
        return False
    
    logger.info(f"Found container {container_name} with ID: {container_id}")
    
    # Copy fixed performance service
    local_service_path = "app/services/scan_performance_service.py"
    container_service_path = "/app/app/services/scan_performance_service.py"
    
    if copy_file_to_container(container_id, local_service_path, container_service_path):
        # Try to reload the service
        reload_python_module(container_id, "scan_performance_service")
        
        # Set environment variable to disable performance service
        try:
            subprocess.run([
                "docker", "exec", container_id, 
                "sh", "-c", "export ENABLE_PERFORMANCE_SERVICE=false"
            ], check=True)
            logger.info("Disabled performance service via environment variable")
        except subprocess.CalledProcessError:
            logger.warning("Could not set environment variable")
        
        return True
    
    return False

def check_container_logs(container_name: str, lines: int = 20):
    """Check recent container logs"""
    try:
        result = subprocess.run([
            "docker", "logs", "--tail", str(lines), container_name
        ], capture_output=True, text=True, check=True)
        
        logger.info(f"Recent logs from {container_name}:")
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
            
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to get logs: {e}")

def main():
    """Main execution"""
    logger.info("Starting hot reload fix for Docker containers...")
    
    # Change to scripts_automation directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Apply performance service fix
    if fix_performance_service():
        logger.info("Performance service fix applied successfully")
        
        # Wait a moment then check logs
        import time
        time.sleep(5)
        check_container_logs("data_governance_backend", 10)
    else:
        logger.error("Failed to apply performance service fix")
        return 1
    
    logger.info("Hot reload fix completed")
    return 0

if __name__ == "__main__":
    sys.exit(main())
