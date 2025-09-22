#!/usr/bin/env python3
"""
Installation script for Professional PDF to Excel Converter
Handles system dependencies and Python packages
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stderr:
            print(f"   Error: {e.stderr.strip()}")
        return False

def install_system_dependencies():
    """Install system dependencies based on OS"""
    system = platform.system().lower()
    
    print(f"🖥️  Detected OS: {system}")
    
    if system == "windows":
        print("📋 Windows detected - manual installation required:")
        print("   1. Install Java: https://java.com/en/download/")
        print("   2. Install Ghostscript: https://www.ghostscript.com/download/gsdnld.html")
        print("   3. Add both to your PATH environment variable")
        return True
    
    elif system == "darwin":  # macOS
        # Install Homebrew dependencies
        commands = [
            ("brew install ghostscript", "Installing Ghostscript via Homebrew"),
            ("brew install openjdk", "Installing Java via Homebrew"),
        ]
        
        for command, description in commands:
            if not run_command(command, description):
                print(f"⚠️  Failed to install via Homebrew. Please install manually:")
                print(f"   - Ghostscript: brew install ghostscript")
                print(f"   - Java: brew install openjdk")
                return False
        return True
    
    elif system == "linux":
        # Install apt dependencies (Ubuntu/Debian)
        commands = [
            ("sudo apt-get update", "Updating package list"),
            ("sudo apt-get install -y ghostscript", "Installing Ghostscript"),
            ("sudo apt-get install -y default-jre", "Installing Java Runtime"),
            ("sudo apt-get install -y python3-tk", "Installing Python Tkinter"),
        ]
        
        for command, description in commands:
            if not run_command(command, description):
                print(f"⚠️  Failed to install system dependencies. Please run manually:")
                print(f"   sudo apt-get install ghostscript default-jre python3-tk")
                return False
        return True
    
    else:
        print(f"❓ Unknown OS: {system}. Please install manually:")
        print("   - Ghostscript")
        print("   - Java Runtime Environment (JRE)")
        return False

def install_python_packages():
    """Install Python packages"""
    print("🐍 Installing Python packages...")
    
    # Upgrade pip first
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install packages from requirements file
    requirements_file = "requirements-professional.txt"
    if not os.path.exists(requirements_file):
        print(f"❌ Requirements file not found: {requirements_file}")
        return False
    
    if not run_command(f"{sys.executable} -m pip install -r {requirements_file}", "Installing Python packages"):
        return False
    
    return True

def test_installation():
    """Test if all libraries are properly installed"""
    print("🧪 Testing installation...")
    
    tests = [
        ("import camelot", "Camelot"),
        ("import tabula", "Tabula"),
        ("import pandas", "Pandas"),
        ("import openpyxl", "OpenPyXL"),
        ("import cv2", "OpenCV"),
        ("import PyPDF2", "PyPDF2"),
    ]
    
    all_passed = True
    
    for test_code, library_name in tests:
        try:
            exec(test_code)
            print(f"   ✅ {library_name} - OK")
        except ImportError as e:
            print(f"   ❌ {library_name} - FAILED: {e}")
            all_passed = False
    
    return all_passed

def main():
    """Main installation process"""
    print("🚀 Professional PDF to Excel Converter Installation")
    print("=" * 50)
    
    # Step 1: Install system dependencies
    print("\n📦 Step 1: Installing system dependencies...")
    if not install_system_dependencies():
        print("⚠️  System dependencies installation had issues. You may need to install manually.")
    
    # Step 2: Install Python packages
    print("\n📦 Step 2: Installing Python packages...")
    if not install_python_packages():
        print("❌ Python package installation failed. Please check the errors above.")
        return False
    
    # Step 3: Test installation
    print("\n📦 Step 3: Testing installation...")
    if test_installation():
        print("\n🎉 Installation completed successfully!")
        print("\n📋 Next steps:")
        print("   1. Test the converter: python professional_pdf_converter.py test.pdf output.xlsx")
        print("   2. Update your server.ts to use the new converter")
        return True
    else:
        print("\n⚠️  Installation completed with some issues.")
        print("   Please check the failed imports above and install manually if needed.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
