// db.js - PostgreSQL connection pool

const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',        // same as pgAdmin
    port: 5432,               // default Postgres port
    user: 'postgres',         // your Postgres user
    password: 'Postgres123!',  //
    database: 'emergency_waitlist'   // your DB name from pgAdmin
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected PG error', err);
});

module.exports = pool;