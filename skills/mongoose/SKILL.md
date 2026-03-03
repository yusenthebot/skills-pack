---
name: mongoose
description: >
  MongoDB object data modeling (ODM) for Node.js. Use when: working with MongoDB, defining document schemas with validation, using middleware/hooks, populating references. NOT for: SQL databases, schemaless-by-design workflows, browser-side MongoDB access.
---

# mongoose

## Overview
Mongoose provides schema-based data modeling for MongoDB in Node.js. It handles schema validation, type casting, query building, middleware hooks, and relationship population out of the box. Mongoose wraps the native MongoDB driver and adds a structured layer for defining document shapes, virtuals, and business logic directly on models.

## Installation
```bash
npm install mongoose
```

## Core API / Commands

### Connecting
```ts
import mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/myapp', {
  maxPoolSize: 10,
});

// Connection events
mongoose.connection.on('error', (err) => console.error(err));
mongoose.connection.on('disconnected', () => console.log('Disconnected'));
```

### Schema and Model
```ts
import { Schema, model, Types } from 'mongoose';

interface IUser {
  name: string;
  email: string;
  age?: number;
  posts: Types.ObjectId[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  age: { type: Number, min: 0, max: 150 },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

const User = model<IUser>('User', userSchema);
```

### CRUD Operations
```ts
// Create
const user = await User.create({ name: 'Alice', email: 'alice@example.com' });

// Read
const found = await User.findById(user._id);
const users = await User.find({ age: { $gte: 18 } }).sort({ name: 1 }).limit(10);
const one = await User.findOne({ email: 'alice@example.com' });

// Update
await User.findByIdAndUpdate(user._id, { age: 30 }, { new: true, runValidators: true });
await User.updateMany({ age: { $lt: 18 } }, { $set: { minor: true } });

// Delete
await User.findByIdAndDelete(user._id);
await User.deleteMany({ age: { $lt: 13 } });
```

## Common Patterns

### Middleware (Hooks)
```ts
// Pre-save hook
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// Post-save hook
userSchema.post('save', function (doc) {
  console.log(`User ${doc.name} saved`);
});

// Pre-query hook (runs before find/findOne)
userSchema.pre('find', function () {
  this.where({ active: true }); // auto-filter inactive users
});
```

### Populate (References)
```ts
const postSchema = new Schema({
  title: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});
const Post = model('Post', postSchema);

// Populate author and nested comments
const post = await Post.findById(id)
  .populate('author', 'name email')       // select specific fields
  .populate({ path: 'comments', populate: { path: 'author' } });
```

### Virtuals and lean()
```ts
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// lean() returns plain JS objects (faster, no Mongoose document overhead)
const plainUsers = await User.find().lean();
// plainUsers[0] is a plain object -- no .save(), no virtuals
```

### Aggregation Pipeline
```ts
const stats = await User.aggregate([
  { $match: { age: { $gte: 18 } } },
  { $group: { _id: '$role', count: { $sum: 1 }, avgAge: { $avg: '$age' } } },
  { $sort: { count: -1 } },
]);
```

### Transactions
```ts
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  const user = await User.create([{ name: 'Bob', email: 'bob@example.com' }], { session });
  await Post.create([{ title: 'Hello', author: user[0]._id }], { session });
});
session.endSession();
```

## Configuration

| Option | Description |
|--------|-------------|
| `timestamps: true` | Auto-add `createdAt` and `updatedAt` fields |
| `toJSON: { virtuals: true }` | Include virtuals in `.toJSON()` output |
| `strict: true` (default) | Ignore fields not in the schema |
| `strictQuery: true` | Filter out unknown fields in query conditions |
| `versionKey: '__v'` | Document version key (set `false` to disable) |

## Tips & Gotchas
- Always pass `{ new: true }` to `findByIdAndUpdate` if you want the updated document returned; the default returns the old one.
- `{ runValidators: true }` must be set on update operations -- validators only run automatically on `save()` and `create()` by default.
- `User.create([...], { session })` requires an array when used with transactions -- passing a single object with session will throw.
- `.lean()` skips Mongoose hydration and returns ~5x faster, but you lose virtuals, getters, `.save()`, and middleware.
- Indexes defined in schemas (`{ unique: true }`, `schema.index()`) are only created at app startup via `ensureIndexes`; in production, create indexes via migration scripts or `autoIndex: false`.
- `populate()` issues a separate query per ref -- for large datasets, use `$lookup` in an aggregation pipeline instead.
- Discriminators allow single-collection inheritance: `const Admin = User.discriminator('Admin', adminSchema)`.
- Always handle the `'error'` event on `mongoose.connection` to prevent unhandled promise rejections on connection loss.
