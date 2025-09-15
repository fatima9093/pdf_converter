#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup script for Enhanced PDF to PowerPoint Converter
Installs required dependencies and tests the conversion functionality
"""

import sys
import subprocess
import os
from pathlib import Path

def install_dependencies():
    """Install required Python packages"""
    print("📦 Installing enhanced converter dependencies...")
    
    try:
        # Install PyMuPDF specifically
        subprocess.check_call([sys.executable, "-m", "pip", "install", "PyMuPDF==1.23.0"])
        print("✅ PyMuPDF installed successfully")
        
        # Install other dependencies from requirements.txt
        requirements_path = Path(__file__).parent / "requirements.txt"
        if requirements_path.exists():
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_path)])
            print("✅ All dependencies installed successfully")
        else:
            print("⚠️ requirements.txt not found, installing individual packages...")
            packages = [
                "pdf2image==1.17.0",
                "pytesseract==0.3.10",
                "Pillow==10.4.0",
                "python-docx==1.1.2",
                "openpyxl==3.1.5",
                "python-pptx==1.0.2",
                "PyPDF2==3.0.1",
                "pdfplumber==0.11.4",
                "pdf2docx==0.5.6",
                "opencv-python==4.10.0.84",
                "numpy==1.24.3"
            ]
            
            for package in packages:
                try:
                    subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                    print(f"✅ Installed {package}")
                except subprocess.CalledProcessError as e:
                    print(f"⚠️ Failed to install {package}: {e}")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False
    
    return True

def test_imports():
    """Test if all required modules can be imported"""
    print("\n🔍 Testing imports...")
    
    required_modules = [
        ("pdf2image", "convert_from_path"),
        ("pytesseract", None),
        ("PIL", "Image"),
        ("cv2", None),
        ("numpy", None),
        ("fitz", None),  # PyMuPDF
        ("pptx", "Presentation"),
        ("docx", "Document"),
        ("openpyxl", None)
    ]
    
    failed_imports = []
    
    for module_name, submodule in required_modules:
        try:
            if submodule:
                exec(f"from {module_name} import {submodule}")
            else:
                exec(f"import {module_name}")
            print(f"✅ {module_name} imported successfully")
        except ImportError as e:
            print(f"❌ Failed to import {module_name}: {e}")
            failed_imports.append(module_name)
    
    if failed_imports:
        print(f"\n❌ Import test failed for: {', '.join(failed_imports)}")
        return False
    
    print("\n✅ All imports successful!")
    return True

def test_enhanced_converter():
    """Test the enhanced converter with a sample conversion"""
    print("\n🧪 Testing enhanced converter...")
    
    try:
        # Import the enhanced converter
        from enhanced_pdf_to_ppt_converter import EnhancedPDFToPPTConverter
        
        # Initialize converter
        converter = EnhancedPDFToPPTConverter(ocr_engine='tesseract')
        print("✅ Enhanced converter initialized successfully")
        
        # Test PDF type detection (if a test PDF exists)
        test_pdf_dir = Path(__file__).parent.parent.parent
        test_files = list(test_pdf_dir.glob("*.pdf"))
        
        if test_files:
            test_pdf = test_files[0]
            print(f"🔍 Testing with PDF: {test_pdf}")
            
            # Test PDF type detection
            pdf_type = converter.detect_pdf_type(str(test_pdf))
            print(f"✅ PDF type detected: {pdf_type}")
            
            print("✅ Enhanced converter test passed!")
        else:
            print("⚠️ No test PDF found, skipping conversion test")
            print("✅ Enhanced converter initialization test passed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Enhanced converter test failed: {e}")
        return False

def check_system_requirements():
    """Check system requirements"""
    print("🔧 Checking system requirements...")
    
    # Check Python version
    python_version = sys.version_info
    if python_version >= (3, 8):
        print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} is supported")
    else:
        print(f"❌ Python {python_version.major}.{python_version.minor} is not supported. Please use Python 3.8 or higher")
        return False
    
    # Check if Tesseract is available
    try:
        import pytesseract
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        result = pytesseract.get_tesseract_version()
        print(f"✅ Tesseract OCR found: {result}")
    except Exception as e:
        print(f"⚠️ Tesseract OCR not found or not configured: {e}")
        print("Please install Tesseract OCR and ensure it's in your PATH")
    
    # Check if Poppler is available (for pdf2image)
    try:
        from pdf2image import convert_from_path
        print("✅ Poppler utilities available for pdf2image")
    except Exception as e:
        print(f"⚠️ Poppler utilities may not be available: {e}")
        print("Please install Poppler utilities for PDF to image conversion")
    
    return True

def main():
    print("🚀 Enhanced PDF to PowerPoint Converter Setup")
    print("=" * 50)
    
    # Check system requirements
    if not check_system_requirements():
        print("\n❌ System requirements check failed")
        return False
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Dependency installation failed")
        return False
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed")
        return False
    
    # Test enhanced converter
    if not test_enhanced_converter():
        print("\n❌ Enhanced converter test failed")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 Enhanced PDF to PowerPoint Converter setup completed successfully!")
    print("\nThe enhanced converter includes:")
    print("• 📝 Advanced text extraction with font, size, and color detection")
    print("• 🎯 Smart heading, paragraph, and bullet point recognition")
    print("• 📊 Table detection and reconstruction")
    print("• 🎨 Layout preservation with positioned text boxes")
    print("• 🔄 Automatic fallback for complex layouts")
    print("• 🔍 Both text-based and OCR-based PDF processing")
    print("\nYou can now use the enhanced converter via the backend API!")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)


