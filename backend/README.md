# PDF Converter Backend

Express.js backend server for converting Office documents (Word, Excel, PowerPoint) to PDF using LibreOffice.

## Prerequisites

### LibreOffice Installation

This backend requires LibreOffice to be installed on your system for document conversion.

#### Windows
1. Download LibreOffice from https://www.libreoffice.org/download/download/
2. Install LibreOffice
3. Add LibreOffice to your system PATH or ensure `soffice` command is available

#### macOS
```bash
brew install --cask libreoffice
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install libreoffice
```

#### Linux (CentOS/RHEL)
```bash
sudo yum install libreoffice
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3001

## API Endpoints

### POST /convert
Convert Office documents to PDF.

**Supported file types:**
- Word: `.doc`, `.docx`
- Excel: `.xls`, `.xlsx`
- PowerPoint: `.ppt`, `.pptx`

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with a `file` field containing the document to convert

**Response:**
- Success: PDF file as binary data with appropriate headers
- Error: JSON object with error message

**Example using curl:**
```bash
curl -X POST \
  -F "file=@document.docx" \
  http://localhost:3001/convert \
  -o converted.pdf
```

## Environment Variables

- `PORT`: Server port (default: 3001)

## File Handling

- Uploaded files are temporarily stored in `uploads/` directory
- Converted PDFs are temporarily stored in `temp/` directory
- All temporary files are automatically cleaned up after conversion

## Troubleshooting

### LibreOffice not found
If you get an error about `soffice` command not being found:

1. **Windows**: Ensure LibreOffice is installed and `soffice.exe` is in your PATH
2. **macOS/Linux**: Ensure LibreOffice is installed and `soffice` command is available

### Conversion timeout
The conversion process has a 30-second timeout. For very large files, you may need to increase this in `src/server.ts`.

### Permission errors
Ensure the server has read/write permissions for the `uploads/` and `temp/` directories.
