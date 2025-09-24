import nodemailer from 'nodemailer';
import { Contact } from '@prisma/client';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private adminEmail: string;
  private isConfigured: boolean = false;

  constructor() {
    // Check if required environment variables are present
    const requiredEnvVars = ['IONOS_SMTP_USER', 'IONOS_SMTP_PASS', 'ADMIN_EMAIL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️  Email service not configured. Missing: ${missingVars.join(', ')}`);
      this.isConfigured = false;
      // Create a mock transporter that logs instead of sending
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    } else {
      console.log('✅ Email service configured successfully');
      this.isConfigured = true;
      
      // Get SMTP configuration from environment variables
      const emailConfig: EmailConfig = {
        host: process.env.IONOS_SMTP_HOST || 'smtp.ionos.com',
        port: parseInt(process.env.IONOS_SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.IONOS_SMTP_USER || '',
          pass: process.env.IONOS_SMTP_PASS || ''
        }
      };
  
      this.adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  
      // Create transporter
      this.transporter = nodemailer.createTransport(emailConfig);
    }
  }

  // Verify SMTP connection
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }

  // Send contact form notification to admin
  async sendContactFormNotification(contactData: Contact): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('Email service not configured, logging contact form submission instead:');
      console.log(JSON.stringify(contactData, null, 2));
      return true; // Return true to not fail the request
    }

    try {
      const subjectText = this.getSubjectText(contactData.subject);
      
      const mailOptions = {
        from: `"PDF Converter Contact Form" <${process.env.IONOS_SMTP_USER}>`,
        to: this.adminEmail,
        subject: `New Contact Form Submission - ${subjectText}`,
        html: this.generateContactEmailTemplate(contactData),
        text: this.generateContactEmailText(contactData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Contact form notification sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send contact form notification:', error);
      return false;
    }
  }

  // Generate HTML email template
  private generateContactEmailTemplate(contact: Contact): string {
    const subjectText = this.getSubjectText(contact.subject);
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background-color: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 30px -30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .field {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            .field:last-child {
                border-bottom: none;
            }
            .label {
                font-weight: 600;
                color: #555;
                margin-bottom: 5px;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 0.5px;
            }
            .value {
                font-size: 16px;
                color: #333;
            }
            .message-content {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #667eea;
                white-space: pre-wrap;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .subject-badge {
                display: inline-block;
                background-color: #667eea;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .metadata {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin-top: 20px;
                font-size: 14px;
                color: #666;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📧 New Contact Form Submission</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">PDF Converter Platform</p>
            </div>
            
            <div class="field">
                <div class="label">Contact Person</div>
                <div class="value">${contact.name} ${contact.surname}</div>
            </div>
            
            <div class="field">
                <div class="label">Email Address</div>
                <div class="value">
                    <a href="mailto:${contact.email}" style="color: #667eea; text-decoration: none;">
                        ${contact.email}
                    </a>
                </div>
            </div>
            
            <div class="field">
                <div class="label">Subject</div>
                <div class="value">
                    <span class="subject-badge">${subjectText}</span>
                </div>
            </div>
            
            <div class="field">
                <div class="label">Message</div>
                <div class="value">
                    <div class="message-content">${contact.message}</div>
                </div>
            </div>
            
            <div class="metadata">
                <strong>📊 Submission Details:</strong><br>
                <strong>ID:</strong> ${contact.id}<br>
                <strong>Submitted:</strong> ${contact.createdAt.toLocaleString()}<br>
                <strong>IP Address:</strong> ${contact.ipAddress || 'Unknown'}<br>
                <strong>User Agent:</strong> ${contact.userAgent || 'Unknown'}
            </div>
            
            <div class="footer">
                <p>This email was automatically generated from your PDF Converter contact form.</p>
                <p>Please respond directly to <strong>${contact.email}</strong> to reply to this inquiry.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate plain text email
  private generateContactEmailText(contact: Contact): string {
    const subjectText = this.getSubjectText(contact.subject);
    
    return `
New Contact Form Submission - PDF Converter Platform

Contact Person: ${contact.name} ${contact.surname}
Email: ${contact.email}
Subject: ${subjectText}

Message:
${contact.message}

---
Submission Details:
ID: ${contact.id}
Submitted: ${contact.createdAt.toLocaleString()}
IP Address: ${contact.ipAddress || 'Unknown'}
User Agent: ${contact.userAgent || 'Unknown'}

Please respond directly to ${contact.email} to reply to this inquiry.
    `;
  }

  // Convert enum subject to readable text
  private getSubjectText(subject: string): string {
    const subjectMap: Record<string, string> = {
      'GENERAL': 'General Inquiry',
      'BILLING': 'Billing Question',
      'SALES': 'Sales Inquiry',
      'FEATURE': 'Feature Request',
      'PROBLEM': 'Technical Problem',
      'PRIVACY': 'Privacy Concern',
      'OTHER': 'Other'
    };
    
    return subjectMap[subject] || subject;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default EmailService;
