import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: '192.168.1.200',
  user: 'dba',
  password: 'DBAdmin2000',
  database: 'miniapps',
  port: 5432,
});

async function run() {
  try {
    await pool.query('ALTER TABLE aplicativos ADD COLUMN cep_api_user VARCHAR(255);');
    console.log('Added cep_api_user');
  } catch (e) {
    console.error('Error user:', e);
  }
  try {
    await pool.query('ALTER TABLE aplicativos ADD COLUMN cep_api_password VARCHAR(255);');
    console.log('Added cep_api_password');
  } catch (e) {
    console.error('Error password:', e);
  }
  process.exit(0);
}
run();
