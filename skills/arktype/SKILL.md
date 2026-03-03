---
name: arktype
description: >
  TypeScript's 1:1 validator using type syntax at runtime. Use when: you want validation
  that mirrors TypeScript syntax exactly, need advanced type-level features like morphs
  and scopes, prefer concise string-based type definitions. NOT for: JavaScript-only projects
  without TypeScript, projects needing JSON Schema output.
---

# arktype

## Overview

ArkType lets you write runtime validators using syntax that mirrors TypeScript's own type
system. Instead of method chaining, you describe types using familiar string expressions like
`"string[]"`, `"number > 0"`, or `"'admin' | 'user'"`. ArkType provides deep TypeScript
integration with 1:1 correspondence between its runtime checks and inferred static types,
plus powerful features like morphs (transforms), narrows (custom guards), and scoped type
definitions.

## Installation

```bash
npm install arktype
yarn add arktype
pnpm add arktype
```

Requires TypeScript 5.1+.

## Core API / Commands

### Basic type definitions

```ts
import { type } from "arktype";

const name = type("string > 0");        // non-empty string
const age = type("number.integer >= 0"); // non-negative integer
const email = type("string.email");      // email format
const active = type("boolean");
const id = type("string.uuid");

// Validate
const result = name("hello");
if (result instanceof type.errors) {
  console.log(result.summary);
} else {
  console.log(result); // "hello" — typed as string
}
```

### Object types

```ts
const User = type({
  name: "string >= 1",
  email: "string.email",
  "age?": "number.integer >= 0",  // optional field
  role: "'admin' | 'user' | 'editor'",
});

type User = typeof User.infer;
// { name: string; email: string; age?: number; role: "admin" | "user" | "editor" }

const data = User({ name: "Alice", email: "alice@example.com", role: "admin" });
```

### Unions and intersections

```ts
const StringOrNumber = type("string | number");

const AdminUser = type({
  name: "string",
  role: "'admin'",
  permissions: "string[]",
});

const RegularUser = type({
  name: "string",
  role: "'user'",
});

const AnyUser = AdminUser.or(RegularUser);
```

## Common Patterns

### Morphs (transforms)

```ts
const toNumber = type("string").pipe((s) => Number(s));
// Input: string, Output: number

const normalizedEmail = type("string.email").pipe((email) =>
  email.toLowerCase().trim()
);

const parseDate = type("string")
  .pipe((s) => new Date(s))
  .narrow((d): d is Date => !isNaN(d.getTime()));

// Chain morphs
const StringToPositiveInt = type("string")
  .pipe((s) => Number(s))
  .narrow((n): n is number => Number.isInteger(n) && n > 0);
```

### Narrow (custom validation)

```ts
const EvenNumber = type("number.integer").narrow(
  (n): n is number => n % 2 === 0
);

const FutureDate = type("Date").narrow(
  (d): d is Date => d > new Date()
);

const NonEmptyArray = type("string[]").narrow(
  (arr): arr is string[] => arr.length > 0
);
```

### Scopes for complex type systems

```ts
import { scope } from "arktype";

const $ = scope({
  UserId: "string.uuid",
  Email: "string.email",
  Role: "'admin' | 'user' | 'moderator'",
  Address: {
    street: "string >= 1",
    city: "string >= 1",
    zip: "/^\\d{5}$/",
    country: "string == 2",
  },
  User: {
    id: "UserId",
    name: "string >= 1",
    email: "Email",
    role: "Role",
    "address?": "Address",
  },
  CreateUserInput: {
    name: "string >= 1",
    email: "Email",
    "role?": "Role",
  },
});

const types = $.export();
const user = types.User(input);
```

### Arrays and tuples

```ts
const Tags = type("string[] >= 1");      // non-empty string array
const Pair = type(["string", "number"]); // tuple [string, number]
const Matrix = type("number[][]");

const Config = type({
  ports: "number.integer[] >= 1",
  hosts: "string[]",
  "tags?": "(string | number)[]",
});
```

### Pattern matching with regex

```ts
const Slug = type("/^[a-z0-9]+(-[a-z0-9]+)*$/");
const HexColor = type("/^#[0-9a-fA-F]{6}$/");
const PhoneNumber = type("/^\\+?[1-9]\\d{1,14}$/");
```

## Configuration

ArkType has minimal configuration. Most behavior is defined at the type level:

```ts
// Default values via morphs
const WithDefaults = type({
  name: "string",
  "role?": type("'admin' | 'user'").pipe((v) => v ?? "user"),
});

// Undeclared key handling
const Strict = type({ name: "string" });
// By default ArkType rejects undeclared keys

// Error customization
const result = type("string >= 8")(input);
if (result instanceof type.errors) {
  // result.summary gives a human-readable message
  // result is iterable for individual issues
  for (const error of result) {
    console.log(error.path, error.message);
  }
}
```

## Tips & Gotchas

- ArkType uses string syntax for types: `"string"`, `"number > 0"`, `"string[]"`. These are parsed at both the type level and runtime, giving you autocomplete and validation in one step.
- Optional object keys use the `"key?"` syntax: `{ "name?": "string" }`. This mirrors TypeScript's optional property syntax.
- The `type()` result is callable — use it directly as a function: `const result = MyType(data)`. Check `result instanceof type.errors` for failures.
- Morphs (`.pipe()`) transform values and change the output type. Narrows (`.narrow()`) refine the type without changing it, acting as type guards.
- Use `scope()` when you have multiple interdependent types. Scopes let types reference each other by name and are resolved together.
- String constraints use comparison operators: `"string >= 1"` means length >= 1, `"number > 0"` means value > 0. The operator applies contextually to the base type.
- ArkType rejects unknown/undeclared keys in objects by default, unlike Zod which strips them. This is the safer default for validation.
- `typeof MyType.infer` gives you the TypeScript type. You can also use `typeof MyType.inferIn` for the input type (before morphs).
- Regex patterns are written as string literals in type expressions: `type("/^[a-z]+$/")`. They must start and end with `/`.
- ArkType errors have a `.summary` property for a human-readable string and are iterable for individual error objects with `.path` and `.message`.
- ArkType is still evolving (currently in beta). Check the docs for the latest API changes before upgrading.
