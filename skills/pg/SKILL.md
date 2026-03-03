---
name: pg
description: >
  Non-blocking PostgreSQL client for Node.js. Use when: connecting to PostgreSQL, running parameterized queries, using connection pools, LISTEN/NOTIFY, COPY streams. NOT for: MySQL/SQLite, ORMs (use drizzle-orm/typeorm on top of pg instead).
---

# pg

## Overview
`pg` (node-postgres) is the foundational PostgreSQL client for Node.js. It provides both single-client and connection pool interfaces, parameterized queries to prevent SQL injection, transaction management, streaming results, COPY protocol support, and LISTEN/NOTIFY for real-time event handling. Most PostgreSQL ORMs and query builders use `pg` under the hood.

## Installation
```bash
npm install pg
npm install -D @types/pg    # TypeScript types
```

## Core API / Commands

### Single Client
```ts
import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://user:pass@localhost:5432/mydb',
});
await client.connect();

const res = await client.query('SELECT NOW() AS current_time');
console.log(res.rows[0].current_time);

await client.end();
```

### Connection Pool (recommended for production)
```ts
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'app',
  password: 'secret',
  max: 20,                     // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Pool auto-manages checkout/checkin
const { rows } = await pool.query('SELECT * FROM users WHERE active = $1', [true]);

// Or manually checkout a client
const client = await pool.connect();
try {
  const res = await client.query('SELECT * FROM users');
  console.log(res.rows);
} finally {
  client.release();            // ALWAYS release back to pool
}
```

### Parameterized Queries
```ts
// Positional parameters ($1, $2, ...)
const { rows } = await pool.query(
  'SELECT * FROM users WHERE email = $1 AND age > $2',
  ['alice@example.com', 18]
);

// INSERT with RETURNING
const { rows: [newUser] } = await pool.query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  ['Alice', 'alice@example.com']
);
```

## Common Patterns

### Transactions
```ts
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO accounts (id, balance) VALUES ($1, $2)', [1, 1000]);
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 1]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 2]);
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

### LISTEN/NOTIFY (Real-time Events)
```ts
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

client.on('notification', (msg) => {
  console.log(`Channel: ${msg.channel}, Payload: ${msg.payload}`);
  const data = JSON.parse(msg.payload!);
});

await client.query('LISTEN new_orders');

// From another connection (or trigger):
// NOTIFY new_orders, '{"orderId": 42}';
```

### Streaming Large Result Sets
```ts
import { Pool } from 'pg';
import QueryStream from 'pg-query-stream';

const client = await pool.connect();
const query = new QueryStream('SELECT * FROM large_table WHERE created_at > $1', ['2025-01-01']);
const stream = client.query(query);

stream.on('data', (row) => {
  // Process each row without buffering entire result
});
stream.on('end', () => client.release());
stream.on('error', (err) => {
  client.release();
  console.error(err);
});
```

### COPY (Bulk Import)
```ts
import { pipeline } from 'stream/promises';
import { from as copyFrom } from 'pg-copy-streams';
import fs from 'fs';

const client = await pool.connect();
const ingestStream = client.query(copyFrom('COPY users (name, email) FROM STDIN CSV HEADER'));
const fileStream = fs.createReadStream('users.csv');
await pipeline(fileStream, ingestStream);
client.release();
```

## Configuration

```ts
const pool = new Pool({
  // Connection
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'app',
  password: 'secret',
  connectionString: 'postgresql://...',   // alternative to individual fields

  // Pool sizing
  max: 20,                              // max pool size
  min: 4,                               // min idle connections
  idleTimeoutMillis: 30000,             // close idle clients after 30s
  connectionTimeoutMillis: 2000,        // fail if no connection in 2s

  // SSL
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('ca-cert.pem').toString(),
  },

  // Statement timeout (per query)
  statement_timeout: 10000,             // 10s query timeout
});
```

## Tips & Gotchas
- **Always** use parameterized queries (`$1`, `$2`) instead of string interpolation to prevent SQL injection; `pg` escapes values automatically.
- When using a `Pool`, always call `client.release()` in a `finally` block -- leaked clients exhaust the pool and cause connection starvation.
- `pool.query()` is a shortcut that checks out a client, runs the query, and releases it -- but it cannot be used for transactions (you need a dedicated client for `BEGIN`/`COMMIT`).
- Column names are case-folded to lowercase by PostgreSQL; `SELECT MyColumn` returns `mycolumn` in `rows[0]`.
- `Pool` emits an `'error'` event for idle client errors -- always attach a handler: `pool.on('error', (err) => { ... })`.
- For large INSERTs, use `COPY` or `unnest` with arrays instead of individual `INSERT` statements -- orders of magnitude faster.
- Set `statement_timeout` in the pool config or per-query to prevent long-running queries from blocking connections.
- `pg` returns `bigint` columns as strings (JavaScript cannot safely represent 64-bit integers); parse them explicitly if needed.
