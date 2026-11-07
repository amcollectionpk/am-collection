/**
 * AM Collection — database init (schema + watch catalog seed)
 *
 * database/schema.sql aur database/seed-watches.sql ko DATABASE_URL wale
 * PostgreSQL par chalata hai. Dono files idempotent hain (IF NOT EXISTS /
 * ON CONFLICT), is liye ye script har deploy par dobara chal sakti hai —
 * maujooda orders/customers ko haath nahi lagta.
 *
 * Istemal:
 *   node scripts/init-db.js          (ya: npm run db:init)
 * Render par render.yaml ki buildCommand isay khud chalati hai, taake
 * free tier par (jahan pre-deploy command nahi milta) database deploy
 * ke saath hi ready ho jaye.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[init-db] DATABASE_URL set nahi hai — pehle env configure karein.');
    process.exit(1);
  }
  const needsSsl = process.env.PGSSL === 'true' || /render\.com|sslmode=require/.test(url);
  const client = new Client({
    connectionString: url,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });
  await client.connect();
  try {
    for (const file of ['schema.sql', 'seed-watches.sql']) {
      const sql = fs.readFileSync(path.join(__dirname, '..', 'database', file), 'utf8');
      console.log(`[init-db] running database/${file} ...`);
      await client.query(sql);
    }
    const { rows } = await client.query(
      "SELECT (SELECT COUNT(*)::int FROM products) AS products, (SELECT COUNT(*)::int FROM categories) AS categories"
    );
    console.log(`[init-db] done — products: ${rows[0].products}, categories: ${rows[0].categories}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('[init-db] FAILED:', e.message);
  process.exit(1);
});
