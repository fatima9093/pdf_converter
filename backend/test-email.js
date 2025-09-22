// Test script for email functionality
const { emailService } = require('./dist/lib/emailService');

// Mock contact data for testing
const mockContact = {
  id: 'test-contact-id',
  name: 'John',
  surname: 'Doe',
  email: 'john.doe@example.com',
  subject: 'GENERAL',
  message: 'This is a test message from the contact form to verify email functionality.',
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0 Test Browser',
  createdAt: new Date()
};

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test SMTP connection
  console.log('1. Testing SMTP connection...');
  const connectionResult = await emailService.verifyConnection();
  
  if (connectionResult) {
    console.log('✅ SMTP connection successful!\n');
    
    // Test sending email
    console.log('2. Testing email sending...');
    const emailResult = await emailService.sendContactFormNotification(mockContact);
    
    if (emailResult) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your admin email inbox for the test message.');
    } else {
      console.log('❌ Failed to send test email. Check your SMTP configuration.');
    }
  } else {
    console.log('❌ SMTP connection failed. Please check your environment variables:');
    console.log('   - SMTP_HOST');
    console.log('   - SMTP_PORT');
    console.log('   - SMTP_USER');
    console.log('   - SMTP_PASS');
    console.log('   - ADMIN_EMAIL');
  }
  
  console.log('\n🏁 Email test completed.');
}

// Run the test
testEmailService().catch(error => {
  console.error('❌ Email test failed with error:', error);
  process.exit(1);
});
