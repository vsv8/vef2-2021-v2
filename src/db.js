import pg from 'pg';
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

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function query(q, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, values);

    return result.rows;
  } catch (err) {
    console.log(err); // eslint-disable-line
    return err;
  } finally {
    await client.release();
  }
}

async function insert(data) {
  const q = `
    INSERT INTO signatures
    (name, nationalId, comment, anonymous)
    VALUES
    ($1, $2, $3, $4)`;

  const values = [data.name, data.nationalId, data.comment, data.anonymous];

  return query(q, values);
}

async function select() {
  const result = await query('SELECT * FROM signatures ORDER BY id');

  return result;
}

export { insert, select, query };
