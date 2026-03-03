---
name: mysql2
description: >
  Fast MySQL/MariaDB client for Node.js with prepared statements and streaming. Use when: connecting to MySQL/MariaDB, running parameterized queries, streaming large result sets, using connection pools. NOT for: PostgreSQL, SQLite, MongoDB, or ORM-level abstractions.
---

# mysql2

## Overview
mysql2 is a high-performance MySQL client for Node.js that supports prepared statements, connection pooling, streaming, multiple statements, and both callback and Promise APIs. It is wire-protocol compatible with the original `mysql` package but significantly faster, with built-in support for the MySQL binary protocol for prepared statements.

## Installation
```bash
npm install mysql2
```

## Core API / Commands

### Single Connection
```ts
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'myapp',
});

const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [1]);
console.log(rows);

await connection.end();
```

### Connection Pool (recommended)
```ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Pool auto-manages connections
const [rows] = await pool.execute('SELECT * FROM users WHERE active = ?', [true]);
```

### Prepared Statements with execute()
```ts
// execute() uses the binary protocol (prepared statements) -- safer and faster
const [rows] = await pool.execute(
  'SELECT * FROM orders WHERE user_id = ? AND status = ?',
  [42, 'pending']
);

// INSERT
const [result] = await pool.execute(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Alice', 'alice@example.com']
);
console.log(result.insertId);    // auto-increment ID
console.log(result.affectedRows);

// query() uses text protocol -- needed for multiple statements
const [rows2] = await pool.query('SELECT 1 + 1 AS result');
```

## Common Patterns

### Transactions
```ts
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();

  await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [100, 1]);
  await conn.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [100, 2]);

  await conn.commit();
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  conn.release();   // return connection to pool
}
```

### Streaming Large Results
```ts
import mysql from 'mysql2';

// Use callback API for streaming (not promise wrapper)
const connection = mysql.createConnection({ host: 'localhost', user: 'root', database: 'myapp' });

const stream = connection.query('SELECT * FROM large_table')
  .stream();

stream.on('data', (row) => {
  // Process row by row without buffering
});
stream.on('end', () => connection.end());
stream.on('error', (err) => console.error(err));
```

### Multiple Statements
```ts
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'myapp',
  multipleStatements: true,    // must enable explicitly
});

const [results] = await connection.query(`
  SELECT * FROM users;
  SELECT * FROM orders;
`);
// results[0] = users rows, results[1] = orders rows
```

### Named Placeholders
```ts
import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'myapp',
  namedPlaceholders: true,
});

const conn = connection.promise();

const [rows] = await conn.execute(
  'SELECT * FROM users WHERE name = :name AND age > :age',
  { name: 'Alice', age: 18 }
);
```

## Configuration

```ts
const pool = mysql.createPool({
  // Connection
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'secret',
  database: 'myapp',

  // Pool
  connectionLimit: 10,          // max connections
  waitForConnections: true,     // queue when pool exhausted
  queueLimit: 0,                // unlimited queue (0 = no limit)

  // SSL
  ssl: {
    ca: fs.readFileSync('ca.pem'),
    rejectUnauthorized: true,
  },

  // Behavior
  timezone: '+00:00',           // store/retrieve in UTC
  charset: 'utf8mb4',           // full Unicode support
  multipleStatements: false,    // enable for multi-query
  namedPlaceholders: false,     // enable for :name syntax
  dateStrings: false,           // true = return dates as strings
  decimalNumbers: false,        // true = return DECIMAL as numbers
  typeCast: true,               // auto type casting
});
```

## Tips & Gotchas
- Use `execute()` (prepared statements) over `query()` for user input -- it handles escaping via the binary protocol and is faster for repeated queries.
- The promise wrapper is accessed via `mysql2/promise` -- do not mix callback and promise APIs on the same connection.
- `multipleStatements: true` is a SQL injection risk if combined with user input; only enable it for trusted queries (migrations, seeds).
- Always call `conn.release()` in a `finally` block when using `pool.getConnection()` -- leaked connections exhaust the pool.
- MySQL `BIGINT` values are returned as strings by default because JavaScript cannot safely represent 64-bit integers; set `supportBigNumbers: true` and `bigNumberStrings: true` for explicit control.
- `execute()` caches prepared statements per connection -- calling `execute` with thousands of distinct queries can cause memory issues; use `query()` for dynamic SQL.
- `pool.execute()` checks out a connection, runs the prepared statement, and releases it automatically -- no need for `getConnection()` for single queries.
- Set `charset: 'utf8mb4'` to support emojis and full Unicode; plain `utf8` in MySQL only handles 3-byte characters.
