# Email Configuration Setup

## Overview
The PDF Converter platform now includes email notifications for contact form submissions. When users submit the contact form, an email notification is automatically sent to the admin email address.

## Required Environment Variables

Add the following variables to your `.env` file in the backend directory:

```env
# IONOS SMTP Email Configuration
IONOS_SMTP_HOST="smtp.ionos.com"        # Your IONOS SMTP server host
IONOS_SMTP_PORT="587"                   # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE="false"                     # true for SSL (port 465), false for TLS (port 587)
IONOS_SMTP_USER="your-email@yourdomain.com"  # Your IONOS email address
IONOS_SMTP_PASS="your-password"         # Your IONOS email password
ADMIN_EMAIL="admin@yourdomain.com"      # Email address to receive contact form notifications
```

## Gmail Setup Instructions

If you're using Gmail, follow these steps:

### 1. Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

### 2. Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Select "App passwords" under "2-Step Verification"
3. Generate a new app password for "Mail"
4. Use this app password as `SMTP_PASS` (not your regular Gmail password)

### 3. Configuration for Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-16-character-app-password"
ADMIN_EMAIL="admin@yourdomain.com"
```

## IONOS Setup Instructions

IONOS is your current configured email provider. Here's how to set it up:

### 1. IONOS Email Configuration
```env
IONOS_SMTP_HOST="smtp.ionos.com"
IONOS_SMTP_PORT="587"
SMTP_SECURE="false"
IONOS_SMTP_USER="your-email@yourdomain.com"
IONOS_SMTP_PASS="your-email-password"
ADMIN_EMAIL="admin@yourdomain.com"
```

### 2. IONOS SMTP Settings
- **SMTP Server**: `smtp.ionos.com`
- **Port**: `587` (TLS) or `465` (SSL)
- **Authentication**: Required
- **Use your full email address** as the username
- **Use your email password** (not an app-specific password like Gmail)

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

### Yahoo Mail
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

### Custom SMTP Server
```env
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

## Testing Email Configuration

After setting up your environment variables:

1. **Build the backend:**
   ```bash
   cd backend
   npm run build
   ```

2. **Run the email test:**
   ```bash
   node test-email.js
   ```

This will:
- Test the SMTP connection
- Send a test email to your admin email address
- Display success/error messages

## Email Template Features

The contact form emails include:

- **Professional HTML design** with modern styling
- **All form data** (name, email, subject, message)
- **Metadata** (submission ID, timestamp, IP address, user agent)
- **Direct reply functionality** - admin can reply directly to the user's email
- **Subject categorization** with color-coded badges
- **Responsive design** that works on all email clients

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Make sure you're using an app password, not your regular password
   - Verify 2FA is enabled for Gmail

2. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP host and port are correct

3. **Email Not Received**
   - Check spam/junk folder
   - Verify ADMIN_EMAIL is correct
   - Test with a different email address

### Debug Mode

To see detailed SMTP logs, you can modify the email service to include debug information:

```typescript
// In emailService.ts, add debug: true to the transporter config
this.transporter = nodemailer.createTransport({
  ...emailConfig,
  debug: true,
  logger: true
});
```

## Security Considerations

- **Never commit** your `.env` file to version control
- Use **app-specific passwords** instead of regular passwords
- Consider using **environment-specific configurations** for production
- **Regularly rotate** SMTP credentials
- **Monitor email sending** for unusual activity

## Production Deployment

For production environments:

1. Use a **dedicated SMTP service** (SendGrid, Mailgun, AWS SES)
2. Set up **proper DNS records** (SPF, DKIM, DMARC)
3. **Monitor email delivery** rates and bounces
4. **Configure rate limiting** for email sending
5. **Set up alerts** for failed email deliveries

## Support

If you encounter issues with email setup:

1. Check the console logs for detailed error messages
2. Run the test script to isolate the problem
3. Verify all environment variables are set correctly
4. Test with a simple SMTP client to verify credentials
