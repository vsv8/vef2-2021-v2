import pg from 'pg';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const {
    DATABASE_URL: connectionString,
    NODE_ENV: nodeEnv = 'development',
  } = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}
  
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;
  
const pool = new pg.Pool({ connectionString, ssl });

async function query(q) {
  const client = await pool.connect();

  try {
    const result = await client.query(q);

    const { rows } = result;
    return rows;
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
}

async function main() {
  console.info(`Set upp gagnagrunn á ${connectionString}`);
  // droppa töflu ef til
  await query('DROP TABLE IF EXISTS applications');
  console.info('Töflu eytt');

  // búa til töflu út frá skema
  try {
    const createTable = await fs.readFile('./sql/schema.sql');
    await query(createTable.toString('utf8'));
    console.info('Tafla búin til');
  } catch (e) {
    console.error('Villa við að búa til töflu:', e.message);
    return;
  }

  try {
    const insert = await fs.readFile('./sql/fake.sql');
    await query(insert.toString('utf8'));
    console.info('Gögnum bætt við');
  } catch (e) {
    console.error('Villa við að bæta gögnum við:', e.message);
  }
}

main().catch((err) => {
  console.error(err);
});