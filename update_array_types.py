import os
import re

def update_array_str_to_string(file_path):
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if the file imports String from sqlmodel
    if 'from sqlmodel import' in content and ', String' not in content:
        # Add String to the import
        content = re.sub(
            r'from sqlmodel import (.+)ARRAY(.+)',
            r'from sqlmodel import \1ARRAY\2, String',
            content
        )
    
    # Replace ARRAY(str) with ARRAY(String)
    content = content.replace('ARRAY(str)', 'ARRAY(String)')
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    
    return 'String' in content and 'ARRAY(str)' not in content

def process_directory(directory_path):
    updated_files = []
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'ARRAY(str)' in content:
                            if update_array_str_to_string(file_path):
                                updated_files.append(file_path)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
    
    return updated_files

if __name__ == "__main__":
    models_dir = r"c:\Users\seifa\OneDrive\Desktop\final_correction\data_wave\backend\scripts_automation\app\models"
    updated_files = process_directory(models_dir)
    
    print(f"Updated {len(updated_files)} files:")
    for file in updated_files:
        print(f"  - {file}")