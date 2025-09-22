const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSystemLogs() {
  try {
    console.log('🌱 Seeding system logs...');

    // Sample system logs
    const sampleLogs = [
      // No sample data - empty array
    ];

    // Create logs with different timestamps (spread over the last 7 days)
    const now = new Date();
    for (let i = 0; i < sampleLogs.length; i++) {
      const log = sampleLogs[i];
      const hoursAgo = Math.floor(Math.random() * 168); // Random time in last 7 days
      const createdAt = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));

      await prisma.systemLog.create({
        data: {
          ...log,
          createdAt
        }
      });
    }

    console.log('✅ System logs seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding system logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSystemLogs();

