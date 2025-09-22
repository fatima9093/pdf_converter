const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkLogin() {
  try {
    // Check what users exist
    console.log('📋 Checking users in database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        passwordHash: true,
      }
    });
    
    console.log('Found', users.length, 'users:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Has Password: ${!!user.passwordHash} - Blocked: ${user.isBlocked}`);
    });
    
    // Test login with common credentials
    const testEmail = 'fatimaahmad9093@gmail.com';
    const testPassword = 'admin123'; // or try other passwords you might have used
    
    console.log('\n🔍 Testing login with:', testEmail, '/', testPassword);
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (user) {
      console.log('✅ User found');
      if (user.passwordHash) {
        const isValid = await bcrypt.compare(testPassword, user.passwordHash);
        console.log('🔑 Password correct:', isValid);
      } else {
        console.log('❌ User has no password (maybe created via Google)');
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogin();