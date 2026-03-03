---
name: ioredis
description: >
  Full-featured Redis client for Node.js with Cluster, Sentinel, and streams support. Use when: caching, pub/sub messaging, rate limiting, session storage, job queues with Redis. NOT for: in-memory caching without Redis, non-Redis key-value stores.
---

# ioredis

## Overview
ioredis is a robust, performant Redis client for Node.js that supports Redis commands, pipelining, transactions, Lua scripting, Pub/Sub, Cluster, Sentinel, and Streams. It features automatic reconnection, offline queuing, and full TypeScript support. It is the most widely used Redis client in the Node.js ecosystem.

## Installation
```bash
npm install ioredis
```

## Core API / Commands

### Basic Connection and Commands
```ts
import Redis from 'ioredis';

const redis = new Redis();                          // localhost:6379
const redis2 = new Redis(6379, '10.0.0.1');         // custom host/port
const redis3 = new Redis('redis://:password@host:6379/0'); // connection string

// Basic commands
await redis.set('key', 'value');
await redis.set('key', 'value', 'EX', 60);         // expires in 60s
const val = await redis.get('key');                 // 'value'

await redis.hset('user:1', 'name', 'Alice', 'age', '30');
const user = await redis.hgetall('user:1');         // { name: 'Alice', age: '30' }

await redis.lpush('queue', 'job1', 'job2');
const job = await redis.rpop('queue');              // 'job1'

await redis.sadd('tags', 'node', 'redis', 'ts');
const members = await redis.smembers('tags');       // ['node', 'redis', 'ts']

await redis.del('key');
```

### Pipelines (Batched Commands)
```ts
const pipeline = redis.pipeline();
pipeline.set('a', '1');
pipeline.set('b', '2');
pipeline.get('a');
pipeline.get('b');
const results = await pipeline.exec();
// results = [[null, 'OK'], [null, 'OK'], [null, '1'], [null, '2']]
```

### Transactions (MULTI/EXEC)
```ts
const results = await redis.multi()
  .set('counter', '0')
  .incr('counter')
  .incr('counter')
  .exec();
// results = [[null, 'OK'], [null, 1], [null, 2]]
```

## Common Patterns

### Pub/Sub
```ts
const sub = new Redis();
const pub = new Redis();

// Subscribe
await sub.subscribe('notifications', 'alerts');
sub.on('message', (channel, message) => {
  console.log(`${channel}: ${message}`);
});

// Publish
await pub.publish('notifications', JSON.stringify({ type: 'new_order', id: 42 }));

// Pattern subscribe
await sub.psubscribe('user:*');
sub.on('pmessage', (pattern, channel, message) => {
  console.log(`${pattern} -> ${channel}: ${message}`);
});
```

### Lua Scripting
```ts
// Atomic rate limiter using Lua
const rateLimitScript = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local current = tonumber(redis.call('GET', key) or '0')
  if current >= limit then
    return 0
  end
  redis.call('INCR', key)
  if current == 0 then
    redis.call('EXPIRE', key, window)
  end
  return 1
`;

// Define a custom command
redis.defineCommand('rateLimit', {
  numberOfKeys: 1,
  lua: rateLimitScript,
});

const allowed = await (redis as any).rateLimit('ratelimit:user:1', 100, 60);
```

### Cluster Mode
```ts
import Redis from 'ioredis';

const cluster = new Redis.Cluster([
  { host: '10.0.0.1', port: 6380 },
  { host: '10.0.0.2', port: 6380 },
  { host: '10.0.0.3', port: 6380 },
], {
  redisOptions: { password: 'secret' },
  scaleReads: 'slave',            // read from replicas
  natMap: {},                     // NAT mapping if needed
});

await cluster.set('foo', 'bar');
const val = await cluster.get('foo');
```

### Streams
```ts
// Add to stream
await redis.xadd('events', '*', 'type', 'click', 'page', '/home');

// Read from stream
const entries = await redis.xrange('events', '-', '+', 'COUNT', 10);

// Consumer group
await redis.xgroup('CREATE', 'events', 'mygroup', '0', 'MKSTREAM');
const messages = await redis.xreadgroup(
  'GROUP', 'mygroup', 'consumer1',
  'COUNT', 5, 'BLOCK', 2000,
  'STREAMS', 'events', '>'
);
```

## Configuration

```ts
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  password: 'secret',
  db: 0,
  keyPrefix: 'app:',               // auto-prefix all keys
  retryStrategy(times) {            // custom reconnect logic
    const delay = Math.min(times * 50, 2000);
    return delay;                   // return null to stop retrying
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,               // set true to connect manually
  connectTimeout: 10000,
});
```

## Tips & Gotchas
- Pub/Sub requires a **dedicated** Redis connection -- you cannot use the same client for subscriptions and regular commands.
- All values returned from Redis are strings (or `null`); always parse numbers and JSON explicitly.
- `keyPrefix` is applied automatically to commands but NOT to Lua scripts -- you must handle prefixes manually inside Lua.
- Use `pipeline()` for batching unrelated commands (no atomicity) and `multi()` for transactions (atomic execution).
- `lazyConnect: true` defers connection until the first command; useful if you want to handle connection errors explicitly with `await redis.connect()`.
- When using Cluster, multi-key commands (`MGET`, `MSET`) only work if all keys hash to the same slot -- use `{hashtag}` syntax to force co-location: `user:{123}:name`, `user:{123}:email`.
- Set `maxRetriesPerRequest: null` (infinite retries) for worker processes that must never drop commands, but be careful with memory buildup in the offline queue.
- `redis.disconnect()` gracefully closes after pending commands; `redis.quit()` sends the QUIT command to the server first.
