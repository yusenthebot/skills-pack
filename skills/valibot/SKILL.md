---
name: valibot
description: >
  Modular, tree-shakable schema validation library with a tiny bundle size.
  Use when: you need Zod-like validation with minimal bundle impact, building client-side
  apps where bundle size matters, using pipe-based composition. NOT for: projects already
  using Zod without bundle concerns, legacy CommonJS-only environments.
---

# valibot

## Overview

Valibot is a modular schema validation library designed for minimal bundle size. Unlike
Zod's method-chaining approach, Valibot uses a pipe-based, function-composition API where
each validation rule is an independent function that can be tree-shaken. This results in
bundles that are often 10-30x smaller than Zod for equivalent schemas. Valibot provides
full TypeScript type inference comparable to Zod.

## Installation

```bash
npm install valibot
yarn add valibot
pnpm add valibot
```

Requires TypeScript 5.0+.

## Core API / Commands

### Basic schemas

```ts
import * as v from "valibot";

const StringSchema = v.string();
const EmailSchema = v.pipe(v.string(), v.email());
const NumberSchema = v.pipe(v.number(), v.minValue(0));
const BooleanSchema = v.boolean();
const DateSchema = v.date();
const LiteralSchema = v.literal("admin");
const EnumSchema = v.picklist(["admin", "user", "editor"]);
```

### Object schemas and inference

```ts
const UserSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  email: v.pipe(v.string(), v.email()),
  age: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  role: v.picklist(["admin", "user", "editor"]),
});

type User = v.InferOutput<typeof UserSchema>;

// Safe parsing (returns result object)
const result = v.safeParse(UserSchema, input);
if (result.success) {
  console.log(result.output); // typed User
} else {
  console.log(result.issues);
}

// Throws on failure
const user = v.parse(UserSchema, input);
```

### Pipe-based composition

```ts
// The pipe function chains schema -> validators -> transforms
const SlugSchema = v.pipe(
  v.string(),
  v.toLowerCase(),
  v.trim(),
  v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  v.minLength(1),
  v.maxLength(200)
);

const PortSchema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(1),
  v.maxValue(65535)
);
```

## Common Patterns

### Nested objects and arrays

```ts
const AddressSchema = v.object({
  street: v.pipe(v.string(), v.minLength(1)),
  city: v.pipe(v.string(), v.minLength(1)),
  zip: v.pipe(v.string(), v.regex(/^\d{5}$/)),
  country: v.pipe(v.string(), v.length(2)),
});

const OrderSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  items: v.pipe(
    v.array(
      v.object({
        productId: v.pipe(v.string(), v.uuid()),
        quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
        price: v.pipe(v.number(), v.minValue(0)),
      })
    ),
    v.minLength(1)
  ),
  shipping: AddressSchema,
});
```

### Discriminated unions

```ts
const ShapeSchema = v.variant("type", [
  v.object({
    type: v.literal("circle"),
    radius: v.pipe(v.number(), v.minValue(0)),
  }),
  v.object({
    type: v.literal("rectangle"),
    width: v.pipe(v.number(), v.minValue(0)),
    height: v.pipe(v.number(), v.minValue(0)),
  }),
  v.object({
    type: v.literal("triangle"),
    base: v.pipe(v.number(), v.minValue(0)),
    height: v.pipe(v.number(), v.minValue(0)),
  }),
]);

type Shape = v.InferOutput<typeof ShapeSchema>;
```

### Custom validation and transforms

```ts
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8, "Password must be at least 8 characters"),
  v.regex(/[A-Z]/, "Must contain an uppercase letter"),
  v.regex(/[0-9]/, "Must contain a digit"),
  v.regex(/[^a-zA-Z0-9]/, "Must contain a special character")
);

// Transform: coerce string to number
const NumericStringSchema = v.pipe(
  v.string(),
  v.transform((input) => Number(input)),
  v.number(),
  v.minValue(0)
);

// Custom validation with check
const EvenNumberSchema = v.pipe(
  v.number(),
  v.integer(),
  v.check((input) => input % 2 === 0, "Must be an even number")
);
```

### Form validation with React Hook Form

```ts
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email("Invalid email")),
  password: v.pipe(v.string(), v.minLength(8, "At least 8 characters")),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: valibotResolver(LoginSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Login</button>
    </form>
  );
}
```

## Configuration

Valibot has no global configuration. Behavior is controlled per-schema:

```ts
// Optional fields
const Schema = v.object({
  required: v.string(),
  optional: v.optional(v.string()),                // string | undefined
  withDefault: v.optional(v.string(), "fallback"),  // string (defaults to "fallback")
  nullable: v.nullable(v.string()),                 // string | null
  nullish: v.nullish(v.string()),                   // string | null | undefined
});

// Strict objects (reject unknown keys)
const StrictSchema = v.object({ name: v.string() }, "Unknown keys not allowed");

// Loose objects (allow unknown keys)
const LooseSchema = v.looseObject({ name: v.string() });

// Custom error messages on any validator
const Name = v.pipe(v.string("Must be a string"), v.minLength(1, "Cannot be empty"));
```

## Tips & Gotchas

- Valibot's modular design means unused validators are tree-shaken. Import only what you need: `import { string, pipe, email } from "valibot"` for the smallest bundle.
- Use `v.InferOutput<typeof schema>` for the output type (after transforms) and `v.InferInput<typeof schema>` for the input type (before transforms).
- `v.parse()` throws `ValiError` on failure. Use `v.safeParse()` for result-based error handling without try/catch.
- `v.variant()` is the equivalent of Zod's `discriminatedUnion()`. Use it instead of `v.union()` when objects share a discriminant field for better performance and error messages.
- `v.pipe()` is the core composition mechanism. The first argument must be a schema (e.g., `v.string()`), followed by validators and transforms in order.
- `v.transform()` inside a pipe changes the output type. After a transform, subsequent validators in the pipe operate on the transformed type.
- `v.fallback()` wraps a schema and provides a fallback value if parsing fails: `v.fallback(v.string(), "default")` — this never throws.
- Unlike Zod, Valibot does not coerce by default. Use explicit transforms or `v.pipe(v.unknown(), v.transform(...))` for coercion.
- Error messages can be set as the last argument to most validator functions: `v.minLength(5, "Too short")`.
- For recursive types, use `v.lazy()`: `const Tree = v.object({ value: v.number(), children: v.array(v.lazy(() => Tree)) })`.
