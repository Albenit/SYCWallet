const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// Parse DATABASE_URL to keep adapter in sync with prisma.config.ts
function parseDbUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    };
  } catch {
    return null;
  }
}

const fromUrl = process.env.DATABASE_URL
  ? parseDbUrl(process.env.DATABASE_URL)
  : null;

const adapter = new PrismaMariaDb({
  host: fromUrl?.host || process.env.DB_HOST || 'localhost',
  port: fromUrl?.port || parseInt(process.env.DB_PORT || '3306', 10),
  user: fromUrl?.user || process.env.DB_USER || 'root',
  password: fromUrl?.password || process.env.DB_PASSWORD || '',
  database: fromUrl?.database || process.env.DB_NAME || 'sycwallet',
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;