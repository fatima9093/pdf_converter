"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = globalThis.prisma || new client_1.PrismaClient({
    log: ['warn', 'error'],
});
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
// optional: auto-reconnect
async function connectWithRetry(retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            console.log('✅ Database connected');
            return;
        }
        catch (err) {
            console.error(`❌ Attempt ${i + 1} failed`, err);
            if (i === retries - 1)
                throw err;
            await new Promise(res => setTimeout(res, delay));
        }
    }
}
connectWithRetry();
exports.default = prisma;
