# PDF Converter

A comprehensive PDF conversion tool with both Next.js frontend and Express.js backend for handling various document formats.

## Architecture

- **Frontend**: Next.js application with React components
- **Backend**: Express.js server for Office document conversion using LibreOffice
- **Dual API**: Next.js API routes for PDF operations, Express backend for Office conversions

## Features

### PDF Operations (Next.js API)
- ✅ Merge multiple PDF files
- ✅ Split PDF into individual pages or custom ranges
- ✅ Compress PDF files (lossless optimization)
- ✅ Convert images (JPG/PNG) to PDF

### Office Document Conversion (Express Backend)
- 📄 Word to PDF (.doc, .docx)
- 📊 Excel to PDF (.xls, .xlsx)
- 📽️ PowerPoint to PDF (.ppt, .pptx)

## Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **LibreOffice** (for Office document conversion)

#### LibreOffice Installation

**Windows:**
- Download from https://www.libreoffice.org/download/download/
- Install and ensure `soffice` is in your PATH

**macOS:**
```bash
brew install --cask libreoffice
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install libreoffice

# CentOS/RHEL
sudo yum install libreoffice
```

### Installation & Setup

1. **Install dependencies for both frontend and backend:**

```bash
# Frontend (Next.js)
npm install

# Backend (Express)
cd backend
npm install
cd ..
```

2. **Start the development servers:**

```bash
# Terminal 1: Start the Express backend (port 3001)
cd backend
npm run dev

# Terminal 2: Start the Next.js frontend (port 3000)
npm run dev
```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Usage

1. **Navigate to the Tools page** in the Next.js application
2. **Click on any conversion tool:**
   - Word/Excel/PowerPoint files → Uses Express backend with LibreOffice
   - PDF operations → Uses Next.js API routes
3. **Upload your files** using the drag-and-drop interface
4. **Download the converted files** automatically

## API Endpoints

### Express Backend (http://localhost:3001)

#### POST /convert
Convert Office documents to PDF.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Response:**
- Success: PDF file download
- Error: JSON with error message

### Next.js API Routes (http://localhost:3000/api)

#### POST /api/convert
Handle PDF operations (merge, split, compress, image-to-pdf).

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with file(s) and toolId

## Project Structure

```
pdf_convertor/
├── src/                          # Next.js frontend
│   ├── app/                      # App router pages
│   ├── components/               # React components
│   ├── lib/                      # Utility libraries
│   └── types/                    # TypeScript types
├── backend/                      # Express server
│   ├── src/
│   │   └── server.ts            # Main Express server
│   ├── uploads/                 # Temporary upload storage
│   ├── temp/                    # Temporary conversion storage
│   └── package.json             # Backend dependencies
├── public/                       # Static assets
└── package.json                  # Frontend dependencies
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_EXPRESS_API_URL=http://localhost:3001
```

### Port Configuration

- **Frontend (Next.js)**: Port 3000 (default)
- **Backend (Express)**: Port 3001 (configurable via `PORT` env var)

## Development

### Frontend Development
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
```

### Backend Development
```bash
cd backend
npm run dev          # Start Express development server with nodemon
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
```

## Troubleshooting

### LibreOffice Issues

1. **Command not found**: Ensure LibreOffice is installed and `soffice` is in PATH
2. **Permission errors**: Check file permissions for upload/temp directories
3. **Conversion timeout**: Large files may need increased timeout (30s default)

### Network Issues

1. **CORS errors**: Backend includes CORS middleware for frontend communication
2. **Connection refused**: Ensure both servers are running on correct ports
3. **API not found**: Check that `NEXT_PUBLIC_EXPRESS_API_URL` is correctly set

### File Upload Issues

1. **File size limit**: Backend accepts files up to 50MB
2. **File type errors**: Check supported formats in each tool's configuration
3. **Upload failures**: Check browser network tab for detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

MIT License - see LICENSE file for details