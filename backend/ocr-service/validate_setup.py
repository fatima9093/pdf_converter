#!/usr/bin/env python3
"""
Simple validation script for Enhanced PDF to PowerPoint Converter
"""

import sys
import os

def validate_imports():
    """Test essential imports"""
    print("🔍 Validating enhanced converter setup...")
    
    essential_modules = [
        'fitz',  # PyMuPDF
        'pptx',  # python-pptx
        'cv2',   # opencv-python
        'numpy'
    ]
    
    success = True
    
    for module in essential_modules:
        try:
            __import__(module)
            print(f"✅ {module} - OK")
        except ImportError as e:
            print(f"❌ {module} - MISSING: {e}")
            success = False
    
    return success

def check_file_structure():
    """Check if required files exist"""
    print("\n📁 Checking file structure...")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    required_files = [
        'enhanced_pdf_to_ppt_converter.py',
        'requirements.txt',
        'setup_enhanced_converter.py'
    ]
    
    success = True
    
    for file in required_files:
        file_path = os.path.join(current_dir, file)
        if os.path.exists(file_path):
            print(f"✅ {file} - EXISTS")
        else:
            print(f"❌ {file} - MISSING")
            success = False
    
    return success

def main():
    print("Enhanced PDF to PowerPoint Converter - Setup Validation")
    print("=" * 55)
    
    files_ok = check_file_structure()
    imports_ok = validate_imports()
    
    print("\n" + "=" * 55)
    
    if files_ok and imports_ok:
        print("🎉 Setup validation PASSED!")
        print("Enhanced converter is ready to use.")
        return True
    else:
        print("❌ Setup validation FAILED!")
        if not files_ok:
            print("Missing required files.")
        if not imports_ok:
            print("Missing required Python packages.")
        print("\nPlease run: pip install -r requirements.txt")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


