---
name: better-sqlite3
description: >
  Fast, synchronous SQLite3 driver for Node.js. Use when: embedded databases, local-first apps, CLI tools, testing with real SQL, single-server applications. NOT for: client-side/browser use, distributed databases, high-concurrency multi-writer workloads.
---

# better-sqlite3

## Overview
better-sqlite3 is the fastest and most reliable SQLite3 library for Node.js. Unlike other SQLite bindings, it uses a fully synchronous API, which is actually faster for SQLite because it avoids the overhead of libuv thread-pool scheduling. It supports transactions, prepared statements, WAL mode, user-defined functions, aggregates, and online backups.

## Installation
```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3    # TypeScript types
```

## Core API / Commands

### Opening a Database
```ts
import Database from 'better-sqlite3';

const db = new Database('myapp.db');                  // file-based
const memDb = new Database(':memory:');                // in-memory
const readOnly = new Database('myapp.db', { readonly: true });

// Enable WAL mode (recommended for performance)
db.pragma('journal_mode = WAL');
```

### Prepared Statements
```ts
// Prepare once, execute many times (much faster)
const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
const result = insert.run('Alice', 'alice@example.com');
console.log(result.lastInsertRowid);   // BigInt
console.log(result.changes);           // number of rows affected

// SELECT single row
const getUser = db.prepare('SELECT * FROM users WHERE id = ?');
const user = getUser.get(1);           // { id: 1, name: 'Alice', ... } or undefined

// SELECT all rows
const getAllUsers = db.prepare('SELECT * FROM users WHERE active = ?');
const users = getAllUsers.all(1);       // array of row objects

// Iterate (memory-efficient for large results)
const stmt = db.prepare('SELECT * FROM large_table');
for (const row of stmt.iterate()) {
  // process one row at a time
}
```

### Named Parameters
```ts
const stmt = db.prepare('INSERT INTO users (name, email) VALUES (@name, @email)');
stmt.run({ name: 'Bob', email: 'bob@example.com' });

// Also supports $name and :name syntax
const stmt2 = db.prepare('SELECT * FROM users WHERE name = $name');
const user = stmt2.get({ name: 'Bob' });
```

## Common Patterns

### Transactions
```ts
// Transactions are critical for performance with multiple writes
const insertMany = db.transaction((users: { name: string; email: string }[]) => {
  const insert = db.prepare('INSERT INTO users (name, email) VALUES (@name, @email)');
  for (const user of users) {
    insert.run(user);
  }
  return users.length;
});

// Runs atomically -- all succeed or all rollback
const count = insertMany([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' },
]);

// Nested transactions use SAVEPOINTs
const outerTx = db.transaction(() => {
  db.prepare('INSERT INTO logs (msg) VALUES (?)').run('start');
  const innerTx = db.transaction(() => {
    db.prepare('INSERT INTO logs (msg) VALUES (?)').run('inner');
  });
  innerTx();
});
outerTx();
```

### User-Defined Functions
```ts
// Scalar function
db.function('upper_first', (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const row = db.prepare("SELECT upper_first('hello') AS result").get();
// row.result === 'Hello'

// Aggregate function
db.aggregate('concat_all', {
  start: '',
  step: (accumulator: string, value: string) => {
    return accumulator ? `${accumulator}, ${value}` : value;
  },
});
const { result } = db.prepare('SELECT concat_all(name) AS result FROM users').get() as any;
```

### Backup
```ts
// Online backup (non-blocking, can be used while db is in use)
await db.backup('backup.db');

// With progress callback
await db.backup('backup.db', {
  progress({ totalPages, remainingPages }) {
    console.log(`Backup progress: ${totalPages - remainingPages}/${totalPages}`);
    return 200;   // pages to copy before next progress call
  },
});
```

### Schema Setup Pattern
```ts
const db = new Database('app.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
`);
```

## Configuration

| Pragma | Description |
|--------|-------------|
| `journal_mode = WAL` | Write-Ahead Logging -- much better read concurrency |
| `foreign_keys = ON` | Enforce foreign key constraints (off by default in SQLite!) |
| `synchronous = NORMAL` | Balance between safety and speed (FULL is safest, OFF is fastest) |
| `cache_size = -64000` | 64MB page cache (negative = KB) |
| `busy_timeout = 5000` | Wait 5s for locks instead of failing immediately |
| `temp_store = MEMORY` | Store temp tables in memory |

## Tips & Gotchas
- The API is **synchronous** by design -- this is intentional and actually faster for SQLite because it avoids thread-pool overhead. Do not wrap calls in `setTimeout` or similar.
- Always enable `pragma foreign_keys = ON` per connection -- SQLite disables foreign key enforcement by default, and the setting does not persist across connections.
- Wrapping bulk inserts in a `db.transaction()` is 10-100x faster than individual inserts because SQLite commits after every statement by default.
- `lastInsertRowid` returns a `BigInt` in newer versions; use `Number(result.lastInsertRowid)` if you need a regular number (safe for IDs under 2^53).
- SQLite has no native `BOOLEAN` or `DATE` type -- booleans are stored as 0/1 integers, and dates are stored as TEXT or INTEGER (Unix timestamps).
- `db.prepare()` returns a reusable statement object; preparing once and calling `.run()`/`.get()`/`.all()` many times is significantly faster than calling `db.exec()` repeatedly.
- Use `.pluck(true)` on a prepared statement to return only the first column value instead of a row object: `db.prepare('SELECT count(*) FROM users').pluck().get()` returns a number directly.
- For read-heavy workloads, open a separate read-only connection alongside the write connection to maximize WAL concurrency.
