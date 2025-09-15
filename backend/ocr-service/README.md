# PDF OCR Conversion Service

This service provides intelligent PDF to Office document conversion using OCR (Optical Character Recognition) for scanned/image-based PDFs.

## Features

- 🔍 **Smart PDF Detection**: Automatically detects text-based vs image-based PDFs
- 🤖 **Dual OCR Engines**: Supports both Tesseract and EasyOCR
- 📄 **Multiple Output Formats**: Word (DOCX), Excel (XLSX), PowerPoint (PPTX)
- 🎯 **Layout Preservation**: Attempts to preserve document structure and layout
- 📊 **Detailed Logging**: Comprehensive conversion process logging

## System Requirements

### Required Software
- Python 3.8 or higher
- Tesseract OCR
- Poppler (for PDF to image conversion)

### Platform-Specific Installation

#### Windows
1. **Tesseract OCR**: Download from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
2. **Poppler**: Download from [poppler-windows](https://github.com/oschwartz10612/poppler-windows/releases)
3. Add both to your system PATH

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr poppler-utils python3-dev libgl1-mesa-glx libglib2.0-0
```

#### macOS
```bash
brew install tesseract poppler
```

## Installation

### Automatic Setup
```bash
cd backend/ocr-service
python setup.py
```

### Manual Setup
```bash
cd backend/ocr-service
pip install -r requirements.txt
```

## Usage

### Command Line
```bash
python pdf_ocr_converter.py input.pdf output.docx --format docx --ocr-engine tesseract
```

### Parameters
- `input_pdf`: Path to input PDF file
- `output_file`: Path for output file
- `--format`: Output format (docx, xlsx, pptx)
- `--ocr-engine`: OCR engine (tesseract, easyocr)
- `--dpi`: DPI for PDF to image conversion (default: 200)

### Examples

#### Convert PDF to Word
```bash
python pdf_ocr_converter.py document.pdf document.docx --format docx
```

#### Convert PDF to Excel with EasyOCR
```bash
python pdf_ocr_converter.py spreadsheet.pdf spreadsheet.xlsx --format xlsx --ocr-engine easyocr
```

#### Convert PDF to PowerPoint with high DPI
```bash
python pdf_ocr_converter.py presentation.pdf presentation.pptx --format pptx --dpi 300
```

## Integration with Node.js Backend

The service is automatically integrated with the Node.js backend through:

1. **PDF Type Detection**: Node.js detects if PDF is text-based or image-based
2. **Smart Routing**: 
   - Text-based PDFs → LibreOffice conversion
   - Image-based PDFs → OCR conversion
   - LibreOffice failures → OCR fallback
3. **Result Processing**: Node.js handles file cleanup and response

## OCR Engine Comparison

### Tesseract OCR
- ✅ **Pros**: Fast, lightweight, good for simple documents
- ❌ **Cons**: Less accurate on complex layouts, handwriting
- 🎯 **Best for**: Typed documents, simple layouts

### EasyOCR
- ✅ **Pros**: Better accuracy, handles multiple languages, complex layouts
- ❌ **Cons**: Slower, larger memory footprint
- 🎯 **Best for**: Complex documents, mixed languages, handwriting

## Output Format Details

### Word (DOCX)
- Preserves paragraph structure
- Groups text blocks logically
- Maintains reading order
- Adds page breaks for multi-page documents

### Excel (XLSX)
- Organizes text into table structure
- Creates separate worksheets for each page
- Auto-adjusts column widths
- Attempts to detect tabular data

### PowerPoint (PPTX)
- Creates slides for each PDF page
- Adds title slide with metadata
- Groups text into bullet points
- Preserves basic layout structure

## Troubleshooting

### Common Issues

#### "Tesseract not found"
- Ensure Tesseract is installed and in PATH
- On Windows, check PATH includes Tesseract installation directory

#### "pdf2image conversion failed"
- Ensure Poppler is installed and in PATH
- Check PDF file is not corrupted or password-protected

#### "Low OCR accuracy"
- Try increasing DPI: `--dpi 300`
- Switch OCR engines: `--ocr-engine easyocr`
- Ensure PDF images are high quality

#### "Python module not found"
- Run setup script: `python setup.py`
- Manual install: `pip install -r requirements.txt`

### Performance Optimization

#### For Speed
- Use Tesseract OCR engine
- Lower DPI (150-200)
- Process smaller PDFs

#### For Accuracy
- Use EasyOCR engine
- Higher DPI (300-400)
- Preprocess images if needed

## API Response Format

### Success Response
```json
{
  "success": true,
  "pages_processed": 3,
  "total_characters": 1250,
  "output_file": "/path/to/output.docx",
  "format": "docx"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "traceback": "Detailed error trace"
}
```

## Development

### Testing
```bash
python pdf_ocr_converter.py test_document.pdf test_output.docx --format docx
```

### Adding New Features
1. Extend `PDFOCRConverter` class
2. Add new output format handlers
3. Update command line arguments
4. Test with various PDF types

## License

This service is part of the PDF Converter project and follows the same licensing terms.
