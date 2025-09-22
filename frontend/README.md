# PDF Converter - Frontend

The Next.js frontend application for the PDF Converter project. This application provides a modern, responsive interface for PDF conversion tools with authentication and user management features.

## Architecture

- **Frontend**: Next.js 15 with App Router and TypeScript
- **Backend Communication**: Connects to Express.js backend on port 3002
- **Authentication**: JWT-based auth with HTTP-only cookies
- **State Management**: React Context for global state

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

**Note**: This is the frontend application. For full setup including backend, see the main README.md in the root directory.

1. **Install frontend dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create `.env.local` file:
```env
NEXT_PUBLIC_EXPRESS_API_URL=http://localhost:3002
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - **Note**: Backend must be running on port 3002 for full functionality

## Usage

1. **Navigate to the Tools page** in the Next.js application
2. **Click on any conversion tool:**
   - Word/Excel/PowerPoint files → Uses Express backend with LibreOffice
   - PDF operations → Uses Next.js API routes
3. **Upload your files** using the drag-and-drop interface
4. **Download the converted files** automatically

## API Endpoints

### Express Backend API (http://localhost:3002)

The frontend communicates with the Express backend for file conversions:

- `POST /convert` - Office documents to PDF
- `POST /pdf-to-word` - PDF to Word conversion
- `POST /pdf-to-excel` - PDF to Excel conversion
- `POST /pdf-to-powerpoint` - PDF to PowerPoint conversion
- `POST /pdf-to-jpg` - PDF to images
- `POST /api/auth/*` - Authentication endpoints

### Next.js API Routes (http://localhost:3000/api)

Internal API routes for frontend functionality:
- `POST /api/convert` - PDF operations (merge, split, compress)
- `GET /api/file-records` - User file history
- `POST /api/track-conversion` - Conversion tracking

## Frontend Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (pages)/              # Page components
│   │   ├── api/                  # API route handlers
│   │   └── globals.css           # Global styles
│   ├── components/               # Reusable React components
│   ├── contexts/                 # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions and configs
│   └── types/                    # TypeScript type definitions
├── public/                       # Static assets
└── package.json                  # Dependencies and scripts
```

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_EXPRESS_API_URL=http://localhost:3002
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Port Configuration

- **Frontend (Next.js)**: Port 3000 (default)
- **Backend (Express)**: Port 3002 (configurable via `PORT` env var)

## Development

### Frontend Development
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Full Stack Development
From the root directory:
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build both applications
npm run start        # Start both in production mode
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