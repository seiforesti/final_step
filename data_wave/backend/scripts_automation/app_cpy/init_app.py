import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Define directory structure
directories = [
    "app/api",
    "app/api/routes",
    "app/models",
    "app/services",
    "app/utils",
    "tests",
    "docker/mysql/init",
    "docker/postgres/init",
    "docker/mongo_seed",
]

# Create directories
for directory in directories:
    os.makedirs(directory, exist_ok=True)
    logger.info(f"Created directory: {directory}")

# Create __init__.py files
init_files = [
    "app/__init__.py",
    "app/api/__init__.py",
    "app/api/routes/__init__.py",
    "app/models/__init__.py",
    "app/services/__init__.py",
    "app/utils/__init__.py",
    "tests/__init__.py",
]

for init_file in init_files:
    if not os.path.exists(init_file):
        with open(init_file, "w") as f:
            f.write("# This file is intentionally left empty to mark this directory as a Python package.\n")
        logger.info(f"Created file: {init_file}")

logger.info("Initialization complete!")