import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient, ContactSubject } from '@prisma/client';
import rateLimit from 'express-rate-limit';
// @ts-ignore - Temporary fix for module resolution
import { emailService } from '../lib';
const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for contact form - 5 submissions per 15 minutes per IP
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 submissions per window
  message: {
    error: 'Too many contact form submissions. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules for contact form
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  
  body('surname')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Surname is required and must be less than 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('subject')
    .isIn(['general', 'billing', 'sales', 'feature', 'problem', 'privacy', 'other'])
    .withMessage('Please select a valid subject'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),
];

// Map frontend subject values to database enum values
const subjectMapping: Record<string, ContactSubject> = {
  'general': ContactSubject.GENERAL,
  'billing': ContactSubject.BILLING,
  'sales': ContactSubject.SALES,
  'feature': ContactSubject.FEATURE,
  'problem': ContactSubject.PROBLEM,
  'privacy': ContactSubject.PRIVACY,
  'other': ContactSubject.OTHER,
};

// POST /api/contact - Submit contact form
router.post('/contact', contactRateLimit, validateContactForm, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, surname, email, subject, message } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Create contact record in database
    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        surname: surname.trim(),
        email: email.toLowerCase(),
        subject: subjectMapping[subject],
        message: message.trim(),
        ipAddress,
        userAgent,
      }
    });

    // Log the contact form submission
    console.log(`Contact form submitted: ${contact.id} from ${email}`);

    // Send email notification to admin (don't wait for it to complete)
    emailService.sendContactFormNotification(contact).catch((error: any) => {
      console.error('Failed to send contact form email notification:', error);
      // Don't fail the request if email sending fails
    });

    // Return success response (don't expose internal ID)
    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you as soon as possible.',
      submittedAt: contact.createdAt
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your message. Please try again later.'
    });
  }
});

// GET /api/contact - Get all contact submissions (admin only)
router.get('/contact', async (req: Request, res: Response) => {
  try {
    // Note: Add authentication middleware here if needed
    // For now, this endpoint is open but should be protected in production
    
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      contacts
    });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching contact submissions.'
    });
  }
});

// PUT /api/contact/:id/status - Update contact status (admin only)
router.put('/contact/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        status,
        response: response || null,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      contact: updatedContact
    });

  } catch (error: any) {
    console.error('Error updating contact status:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while updating contact status.'
    });
  }
});

export default router;
