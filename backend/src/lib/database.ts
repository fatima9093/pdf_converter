import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient({
  log: ['warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Enhanced connection retry with exponential backoff
async function connectWithRetry(retries = 10, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err);
      if (i === retries - 1) {
        console.error('💥 All database connection attempts failed');
        throw err;
      }
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s...
      const waitTime = delay * Math.pow(2, i);
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(res => setTimeout(res, waitTime));
    }
  }
}

// Connect on startup with better error handling
(async () => {
  try {
    await connectWithRetry();
  } catch (err) {
    console.error('🚨 Failed to connect to database:', err);
    // Don't exit immediately, let the server start and retry
    console.log('🔄 Will retry connection in background...');
  }
})();

// Periodic reconnection for Railway (every 5 minutes)
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.log('🔄 Database connection lost, attempting to reconnect...');
    try {
      await prisma.$connect();
      console.log('✅ Database reconnected successfully');
    } catch (reconnectError) {
      console.error('❌ Failed to reconnect to database:', reconnectError);
    }
  }
}, 300000); // 5 minutes

export default prisma;


