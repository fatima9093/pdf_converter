FROM node:18-alpine

# Install essential system dependencies only
RUN apk add --no-cache \
    poppler-utils \
    libreoffice \
    python3 \
    py3-pip

# Install minimal Python dependencies
RUN pip3 install --no-cache-dir \
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

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --omit=dev

# Copy only necessary files
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY ocr-service/ ./ocr-service/
COPY tsconfig.json ./
COPY ecosystem.config.js ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 3002

CMD ["npm", "start"]
