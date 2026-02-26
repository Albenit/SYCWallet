const app = require('./app');
const dotenv = require('dotenv');
const prisma = require('./config/db');

dotenv.config();

const PORT = process.env.PORT || 5000;

async function main() {
  await prisma.$connect();
  console.log('✅ MySQL connected via Prisma');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});