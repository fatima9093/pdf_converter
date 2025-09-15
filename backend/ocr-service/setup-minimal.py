#!/usr/bin/env python3
"""
Setup script for OCR service with minimal dependencies
Installs only essential packages without EasyOCR to avoid PyTorch conflicts
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"INFO: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"SUCCESS: {description}")
        return result
    except subprocess.CalledProcessError as e:
        print(f"ERROR: {description} failed")
        print(f"Command: {command}")
        print(f"Return code: {e.returncode}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return None

def main():
    print("INFO: Setting up OCR service with minimal dependencies")
    
    # Get the directory containing this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    requirements_file = os.path.join(script_dir, "requirements-minimal.txt")
    
    if not os.path.exists(requirements_file):
        print(f"ERROR: Requirements file not found: {requirements_file}")
        sys.exit(1)
    
    # Upgrade pip first
    run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip")
    
    # Install requirements
    result = run_command(f"{sys.executable} -m pip install -r \"{requirements_file}\"", "Installing dependencies")
    
    if result:
        print("\nSUCCESS: OCR service setup completed successfully!")
        print("INFO: EasyOCR is disabled to avoid PyTorch conflicts")
        print("INFO: The service will use Tesseract OCR only")
    else:
        print("\nERROR: OCR service setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
