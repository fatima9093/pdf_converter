FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    poppler-utils \
    libreoffice \
    python3 \
    py3-pip \
    tesseract-ocr \
    bash

# Create and activate virtual environment
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Install Python dependencies inside venv
RUN pip install --no-cache-dir \
    pdf2image \
    pytesseract \
    python-docx \
    openpyxl \
    python-pptx \
    PyPDF2 \
    pdfplumber \
    pdf2docx

# Verify installations
RUN which pdftoppm && pdftoppm -v
RUN python3 --version
RUN tesseract --version

WORKDIR /app

# Copy package files first (better caching for Node deps)
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --omit=dev

# Copy only necessary files
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY ocr-service/ ./ocr-service/
COPY tsconfig.json ./
COPY ecosystem.config.js ./

# Build Node.js application
RUN npm run build

# Expose port
EXPOSE 3002

# Start app
CMD ["npm", "start"]
