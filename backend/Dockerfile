FROM node:18-alpine

# Install only essential dependencies
RUN apk add --no-cache \
    poppler-utils \
    libreoffice \
    python3 \
    py3-pip

# Verify poppler installation
RUN which pdftoppm && pdftoppm -v

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --omit=dev

# Copy only necessary files
COPY src/ ./src/
COPY prisma/ ./prisma/

# Build the application
RUN npm run build

# Expose port
EXPOSE 3002

CMD ["npm", "start"]
