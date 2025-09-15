#!/bin/bash

# PDF Converter Backend Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting PDF Converter Backend Deployment..."

# Configuration
APP_NAME="pdf-converter"
APP_DIR="/var/www/pdf-converter/backend"
NGINX_SITE="pdf-converter"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Check if required commands exist
command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed. Aborting."; exit 1; }
command -v pm2 >/dev/null 2>&1 || { print_error "PM2 is required but not installed. Run: sudo npm install -g pm2"; exit 1; }
command -v soffice >/dev/null 2>&1 || { print_error "LibreOffice is required but not installed. Aborting."; exit 1; }

print_status "All required dependencies are installed"

# Create application directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    print_warning "Creating application directory: $APP_DIR"
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER /var/www/pdf-converter
fi

# Navigate to application directory
cd "$APP_DIR"
print_status "Changed to directory: $APP_DIR"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build TypeScript
print_status "Building TypeScript..."
npm run build

# Create necessary directories
print_status "Creating upload and temp directories..."
mkdir -p uploads temp logs
chmod 755 uploads temp logs

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "Creating .env file..."
    cat > .env << EOF
NODE_ENV=production
PORT=3002
EOF
    print_status ".env file created"
else
    print_status ".env file already exists"
fi

# PM2 deployment
print_status "Deploying with PM2..."

# Stop existing process if running
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    print_status "Stopping existing PM2 process..."
    pm2 stop $APP_NAME
    pm2 delete $APP_NAME
fi

# Start with PM2 using ecosystem file if it exists, otherwise use simple command
if [ -f "ecosystem.config.js" ]; then
    print_status "Starting with PM2 ecosystem config..."
    pm2 start ecosystem.config.js --env production
else
    print_status "Starting with PM2 simple config..."
    pm2 start dist/server.js --name $APP_NAME --instances 1
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup (user will need to run the generated command)
print_warning "Setting up PM2 startup..."
pm2 startup | tail -n 1 > pm2_startup_command.txt
print_warning "Please run the command in pm2_startup_command.txt as root to enable PM2 auto-start"

# Test if application is running
print_status "Testing application..."
sleep 5

if curl -f http://localhost:3002/ > /dev/null 2>&1; then
    print_status "Application is running successfully!"
else
    print_error "Application test failed. Check PM2 logs: pm2 logs $APP_NAME"
    exit 1
fi

# Nginx configuration (optional)
if command -v nginx >/dev/null 2>&1; then
    if [ -f "nginx.conf" ] && [ ! -f "/etc/nginx/sites-available/$NGINX_SITE" ]; then
        print_warning "Nginx detected. Would you like to configure it? (y/n)"
        read -r configure_nginx
        if [ "$configure_nginx" = "y" ] || [ "$configure_nginx" = "Y" ]; then
            print_status "Configuring Nginx..."
            sudo cp nginx.conf /etc/nginx/sites-available/$NGINX_SITE
            sudo ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/
            
            # Test nginx configuration
            if sudo nginx -t; then
                sudo systemctl reload nginx
                print_status "Nginx configured successfully!"
                print_warning "Don't forget to update server_name in /etc/nginx/sites-available/$NGINX_SITE"
            else
                print_error "Nginx configuration test failed"
            fi
        fi
    else
        print_status "Nginx already configured or config file not found"
    fi
fi

# Final status
print_status "Deployment completed successfully! 🎉"
echo ""
echo "📋 Next steps:"
echo "1. Update your domain/IP in nginx configuration if using Nginx"
echo "2. Set up SSL certificate using: sudo certbot --nginx -d your-domain.com"
echo "3. Test your API: curl http://your-domain.com/"
echo ""
echo "📊 Useful commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs $APP_NAME"
echo "- Restart app: pm2 restart $APP_NAME"
echo "- Monitor: pm2 monit"
echo ""
echo "🌐 Your PDF Converter API should be accessible at:"
echo "- Local: http://localhost:3002"
if command -v nginx >/dev/null 2>&1; then
    echo "- Domain: http://your-domain.com (after DNS setup)"
fi
