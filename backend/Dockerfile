FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libreoffice \
    python3 \
    python3-pip \
    python3-venv \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (override managed env issue)
RUN pip3 install --no-cache-dir --break-system-packages \
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

# Copy package files first for caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for TypeScript compilation)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY ocr-service/ ./ocr-service/
COPY tsconfig.json ./
COPY ecosystem.config.js ./

# ✅ Generate Prisma client
RUN npx prisma generate

# Build the TypeScript application
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --omit=dev

EXPOSE 3002
CMD ["npm", "start"]
