---
name: zod
description: >
  TypeScript-first schema declaration and validation library with static type inference.
  Use when: validating API inputs, form data, environment variables, config files, or any
  runtime data that needs type-safe parsing. NOT for: JSON Schema generation (use typebox),
  legacy JS projects without TypeScript.
---

# zod

## Overview

Zod is a TypeScript-first schema declaration and validation library that lets you define
schemas and automatically infer TypeScript types from them. It eliminates the need to
declare types twice — once for TypeScript and once for runtime validation. Zod schemas are
immutable, composable, and provide detailed error messages out of the box.

## Installation

```bash
npm install zod
yarn add zod
pnpm add zod
```

Requires TypeScript 4.5+ with `strict` mode enabled in `tsconfig.json`.

## Core API / Commands

### Primitive schemas

```ts
import { z } from "zod";

const nameSchema = z.string().min(1).max(100);
const ageSchema = z.number().int().positive();
const emailSchema = z.string().email();
const activeSchema = z.boolean();
const createdSchema = z.date();
```

### Object schemas and type inference

```ts
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0).optional(),
  role: z.enum(["admin", "user", "moderator"]),
});

type User = z.infer<typeof UserSchema>;
// { name: string; email: string; age?: number; role: "admin" | "user" | "moderator" }

const result = UserSchema.safeParse(input);
if (result.success) {
  console.log(result.data); // fully typed User
} else {
  console.log(result.error.issues);
}
```

### Coercion

```ts
const QuerySchema = z.object({
  page: z.coerce.number().int().positive(),
  active: z.coerce.boolean(),
  date: z.coerce.date(),
});

QuerySchema.parse({ page: "3", active: "true", date: "2024-01-01" });
// { page: 3, active: true, date: Date }
```

## Common Patterns

### Discriminated unions for API responses

```ts
const ApiResponse = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.unknown() }),
  z.object({ status: z.literal("error"), message: z.string(), code: z.number() }),
]);

type ApiResponse = z.infer<typeof ApiResponse>;
```

### Transform and pipe for data normalization

```ts
const SlugSchema = z
  .string()
  .transform((val) => val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));

const MoneySchema = z
  .string()
  .pipe(z.coerce.number().positive().multipleOf(0.01));
```

### Custom validation with refine and superRefine

```ts
const PasswordForm = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const NonEmptyArray = z.array(z.string()).superRefine((arr, ctx) => {
  if (arr.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Array must not be empty" });
  }
});
```

### Environment variable validation

```ts
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_KEY: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);
```

## Configuration

Zod has no global configuration. Behavior is controlled per-schema:

```ts
// Strict objects (reject unknown keys)
const Strict = z.object({ name: z.string() }).strict();

// Strip unknown keys (default)
const Stripped = z.object({ name: z.string() }).strip();

// Pass through unknown keys
const Passthrough = z.object({ name: z.string() }).passthrough();

// Custom error messages
const Name = z.string({
  required_error: "Name is required",
  invalid_type_error: "Name must be a string",
}).min(1, { message: "Name cannot be empty" });
```

## Tips & Gotchas

- Use `safeParse()` instead of `parse()` when you want to handle errors without try/catch — `parse()` throws `ZodError` on failure.
- `z.infer<typeof schema>` only gives you the output type; use `z.input<typeof schema>` to get the input type before transforms.
- Zod objects strip unknown keys by default. Use `.strict()` to reject them or `.passthrough()` to keep them.
- `.optional()` makes a field `T | undefined`, while `.nullable()` makes it `T | null`. Use `.nullish()` for `T | null | undefined`.
- `.default()` applies during parsing — it fills in `undefined` values but not `null`. Pair with `.nullable().default(fallback)` if you need null handling.
- When using `.refine()` on an object, errors are added to the root by default. Pass `{ path: ["fieldName"] }` to attach the error to a specific field.
- For recursive types, use `z.lazy()`: `const Category: z.ZodType<Cat> = z.object({ name: z.string(), children: z.lazy(() => Category).array() })`.
- `z.union()` tries each schema in order and returns the first match. `z.discriminatedUnion()` is faster because it checks the discriminant field first.
- Use `z.preprocess()` when you need to transform data before validation, or `z.pipe()` to chain schemas sequentially.
