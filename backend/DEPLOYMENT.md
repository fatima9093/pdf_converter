# PDF Converter Backend Deployment Guide

## Prerequisites
- VPS server with Ubuntu/Debian (or similar Linux distribution)
- LibreOffice installed ✅ (you mentioned this is done)
- Node.js 18+ installed
- PM2 process manager
- Nginx (optional but recommended for reverse proxy)
- Domain name or server IP

## Step 1: Server Setup

### 1.1 Update your server
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js (if not already installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1.3 Install PM2 globally
```bash
sudo npm install -g pm2
```

### 1.4 Install Nginx (optional but recommended)
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Verify LibreOffice installation
```bash
soffice --version
# Should show LibreOffice version
```

## Step 2: Deploy Your Application

### 2.1 Clone/Upload your project to the server
```bash
# Option 1: Using Git (recommended)
git clone <your-repo-url> /var/www/pdf-converter
cd /var/www/pdf-converter/backend

# Option 2: Upload files via SCP/SFTP to /var/www/pdf-converter/backend
```

### 2.2 Set proper permissions
```bash
sudo chown -R $USER:$USER /var/www/pdf-converter
chmod -R 755 /var/www/pdf-converter
```

### 2.3 Install dependencies
```bash
cd /var/www/pdf-converter/backend
npm install
```

### 2.4 Build the TypeScript project
```bash
npm run build
```

### 2.5 Create production directories
```bash
mkdir -p uploads temp
chmod 755 uploads temp
```

## Step 3: Configure Environment

### 3.1 Create environment file
```bash
# Create .env file in backend directory
nano .env
```

Add the following content:
```env
NODE_ENV=production
PORT=3002
# Add any other environment variables your app needs
```

## Step 4: Configure PM2

### 4.1 Start your application with PM2
```bash
pm2 start dist/server.js --name "pdf-converter" --instances 1
```

### 4.2 Save PM2 configuration
```bash
pm2 save
pm2 startup
# Follow the instructions shown to enable PM2 auto-start
```

### 4.3 Monitor your application
```bash
pm2 status
pm2 logs pdf-converter
pm2 monit
```

## Step 5: Configure Nginx (Recommended)

### 5.1 Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/pdf-converter
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com; # Replace with your domain or server IP
    
    client_max_body_size 50M; # Match your file upload limit
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings for large file uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

### 5.2 Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/pdf-converter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Configure Firewall

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 'Nginx Full'

# Or if not using Nginx, allow your app port directly
sudo ufw allow 3002

# Enable firewall
sudo ufw enable
```

## Step 7: SSL Certificate (Optional but Recommended)

### Using Certbot for free SSL:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Step 8: Test Your Deployment

### 8.1 Test the API endpoint
```bash
curl http://your-domain.com/
# or
curl http://your-server-ip:3002/
```

### 8.2 Test file upload
```bash
curl -X POST -F "file=@test-document.docx" http://your-domain.com/convert
```

## Useful Commands

### PM2 Management
```bash
pm2 restart pdf-converter    # Restart app
pm2 stop pdf-converter       # Stop app
pm2 delete pdf-converter     # Delete app from PM2
pm2 logs pdf-converter       # View logs
pm2 flush                    # Clear logs
```

### Check Application Status
```bash
pm2 status                   # PM2 status
sudo systemctl status nginx # Nginx status
netstat -tulpn | grep :3002 # Check if port is listening
```

### View Logs
```bash
pm2 logs pdf-converter       # Application logs
sudo tail -f /var/log/nginx/access.log  # Nginx access logs
sudo tail -f /var/log/nginx/error.log   # Nginx error logs
```

### Update Deployment
```bash
cd /var/www/pdf-converter/backend
git pull                     # Pull latest changes
npm install                  # Install new dependencies
npm run build               # Build TypeScript
pm2 restart pdf-converter   # Restart application
```

## Troubleshooting

### Common Issues:

1. **LibreOffice Permission Issues**
   ```bash
   sudo chown -R www-data:www-data /var/www/pdf-converter/backend/temp
   sudo chown -R www-data:www-data /var/www/pdf-converter/backend/uploads
   ```

2. **Port Already in Use**
   ```bash
   sudo lsof -i :3002
   sudo kill -9 <PID>
   ```

3. **File Upload Size Limits**
   - Check nginx client_max_body_size
   - Check your application's multer limits
   - Check system disk space

4. **LibreOffice Headless Issues**
   ```bash
   # Test LibreOffice conversion manually
   soffice --headless --convert-to pdf --outdir /tmp test-file.docx
   ```

## Security Considerations

1. **File Upload Security**
   - Your app already validates file types
   - Consider adding virus scanning for production
   - Monitor disk usage for uploaded files

2. **System Security**
   - Keep system packages updated
   - Use fail2ban for SSH protection
   - Regular security audits

3. **Application Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Monitor application logs

## Monitoring

Consider setting up:
- Log rotation for application logs
- Disk space monitoring
- Application performance monitoring
- Uptime monitoring

Your PDF converter should now be successfully deployed and accessible via your domain or server IP!
