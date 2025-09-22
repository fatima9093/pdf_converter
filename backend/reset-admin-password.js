const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'fatimaahmad9093@gmail.com';
    const newPassword = 'admin123';

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    console.log('Password reset successfully!');
    console.log('Email:', email);
    console.log('Password:', newPassword);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
