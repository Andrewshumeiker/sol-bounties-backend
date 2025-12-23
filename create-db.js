const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '123',
    port: 5432,
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE sol_bounties');
    console.log('Database sol_bounties created successfully');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database sol_bounties already exists');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
}

createDb();
