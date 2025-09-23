FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libreoffice \
    python3 \
    python3-pip \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Create Python virtual environment
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

# Copy package files first for caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY ocr-service/ ./ocr-service/
COPY tsconfig.json ./
COPY ecosystem.config.js ./

# Build Node.js app
RUN npm run build

EXPOSE 3002
CMD ["npm", "start"]
