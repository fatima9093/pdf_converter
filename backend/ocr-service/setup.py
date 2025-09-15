#!/usr/bin/env python3
"""
Setup script for PDF OCR Conversion Service
Installs required dependencies and tests the setup
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"   Error: {e.stderr.strip() if e.stderr else str(e)}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    
    print("✅ Python version is compatible")
    return True

def install_system_dependencies():
    """Install system-level dependencies"""
    print("\n📦 Installing system dependencies...")
    
    # Check if we're on Windows, Linux, or macOS
    import platform
    system = platform.system().lower()
    
    if system == "windows":
        print("🪟 Windows detected")
        print("📝 Please install the following manually:")
        print("   1. Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki")
        print("   2. Poppler: https://github.com/oschwartz10612/poppler-windows/releases")
        print("   3. Add both to your system PATH")
        return True
        
    elif system == "linux":
        print("🐧 Linux detected")
        commands = [
            "sudo apt-get update",
            "sudo apt-get install -y tesseract-ocr",
            "sudo apt-get install -y poppler-utils",
            "sudo apt-get install -y python3-dev",
            "sudo apt-get install -y libgl1-mesa-glx libglib2.0-0"
        ]
        
        for cmd in commands:
            if not run_command(cmd, f"Running: {cmd}"):
                print("⚠️ Some system dependencies may not have installed correctly")
                
    elif system == "darwin":  # macOS
        print("🍎 macOS detected")
        commands = [
            "brew install tesseract",
            "brew install poppler"
        ]
        
        for cmd in commands:
            if not run_command(cmd, f"Running: {cmd}"):
                print("⚠️ Some system dependencies may not have installed correctly")
    
    return True

def install_python_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    
    requirements_file = Path(__file__).parent / "requirements.txt"
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    cmd = f"{sys.executable} -m pip install -r {requirements_file}"
    return run_command(cmd, "Installing Python packages")

def test_installation():
    """Test if all dependencies are working"""
    print("\n🧪 Testing installation...")
    
    tests = []
    
    # Test Tesseract
    try:
        import pytesseract
        version = pytesseract.get_tesseract_version()
        print(f"✅ Tesseract OCR: {version}")
        tests.append(True)
    except Exception as e:
        print(f"❌ Tesseract OCR test failed: {e}")
        tests.append(False)
    
    # Test pdf2image
    try:
        from pdf2image import convert_from_path
        print("✅ pdf2image: Available")
        tests.append(True)
    except Exception as e:
        print(f"❌ pdf2image test failed: {e}")
        tests.append(False)
    
    # Test document libraries
    doc_libs = [
        ('python-docx', 'docx'),
        ('openpyxl', 'openpyxl'),
        ('python-pptx', 'pptx')
    ]
    
    for lib_name, import_name in doc_libs:
        try:
            __import__(import_name)
            print(f"✅ {lib_name}: Available")
            tests.append(True)
        except Exception as e:
            print(f"❌ {lib_name} test failed: {e}")
            tests.append(False)
    
    # Test EasyOCR (optional)
    try:
        import easyocr
        print("✅ EasyOCR: Available")
        tests.append(True)
    except Exception as e:
        print(f"⚠️ EasyOCR test failed (optional): {e}")
        tests.append(True)  # Don't fail overall test for optional dependency
    
    success_rate = sum(tests) / len(tests)
    
    if success_rate == 1.0:
        print("\n🎉 All tests passed! OCR service is ready to use.")
        return True
    elif success_rate >= 0.8:
        print(f"\n⚠️ Most tests passed ({int(success_rate * 100)}%). OCR service should work with some limitations.")
        return True
    else:
        print(f"\n❌ Many tests failed ({int(success_rate * 100)}% success). Please check your installation.")
        return False

def main():
    print("🚀 PDF OCR Conversion Service Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install system dependencies
    install_system_dependencies()
    
    # Install Python dependencies
    if not install_python_dependencies():
        print("❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Test installation
    if test_installation():
        print("\n✅ Setup completed successfully!")
        print("\n📝 Next steps:")
        print("   1. Test the conversion: python pdf_ocr_converter.py sample.pdf output.docx --format docx")
        print("   2. Start your Node.js backend server")
        print("   3. Upload a PDF file through the frontend")
    else:
        print("\n❌ Setup completed with errors. Please review the issues above.")
        sys.exit(1)

if __name__ == '__main__':
    main()
