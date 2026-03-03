---
name: "@sinclair/typebox"
description: >
  JSON Schema Type Builder with static type inference for TypeScript.
  Use when: you need both JSON Schema and TypeScript types from a single definition,
  building Fastify or Elysia apps, integrating with JSON Schema validators like Ajv.
  NOT for: projects that don't need JSON Schema, simple form validation (use Zod or Valibot).
---

# @sinclair/typebox

## Overview

TypeBox is a JSON Schema type builder that creates in-memory JSON Schema objects that can be
statically inferred as TypeScript types. It bridges the gap between JSON Schema (the universal
validation standard) and TypeScript's type system, letting you define a schema once and get
both runtime validation (via Ajv or TypeBox's own compiler) and compile-time types. TypeBox is
the built-in schema system for Fastify and is also used by Elysia and other frameworks.

## Installation

```bash
npm install @sinclair/typebox
yarn add @sinclair/typebox
pnpm add @sinclair/typebox
```

For runtime validation, also install the compiler or use Ajv:

```bash
npm install @sinclair/typebox  # TypeCompiler is included
# OR use Ajv
npm install ajv
```

## Core API / Commands

### Basic type builders

```ts
import { Type, type Static } from "@sinclair/typebox";

const StringType = Type.String();                    // { type: "string" }
const NumberType = Type.Number();                    // { type: "number" }
const IntegerType = Type.Integer();                  // { type: "integer" }
const BooleanType = Type.Boolean();                  // { type: "boolean" }
const NullType = Type.Null();                        // { type: "null" }
const LiteralType = Type.Literal("admin");           // { const: "admin" }
const EnumType = Type.Union([                        // { anyOf: [...] }
  Type.Literal("admin"),
  Type.Literal("user"),
  Type.Literal("editor"),
]);
```

### Object schemas with type inference

```ts
const UserSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String({ minLength: 1, maxLength: 100 }),
  email: Type.String({ format: "email" }),
  age: Type.Optional(Type.Integer({ minimum: 0 })),
  role: Type.Union([
    Type.Literal("admin"),
    Type.Literal("user"),
  ]),
  tags: Type.Array(Type.String()),
  createdAt: Type.String({ format: "date-time" }),
});

type User = Static<typeof UserSchema>;
// {
//   id: string;
//   name: string;
//   email: string;
//   age?: number;
//   role: "admin" | "user";
//   tags: string[];
//   createdAt: string;
// }
```

### Validation with TypeCompiler

```ts
import { TypeCompiler } from "@sinclair/typebox/compiler";

const C = TypeCompiler.Compile(UserSchema);

const isValid = C.Check(data);            // boolean
const errors = [...C.Errors(data)];       // detailed error iterator
const decoded = C.Decode(data);           // parse and return typed result (throws on error)

// Or use Value module for one-off checks
import { Value } from "@sinclair/typebox/value";

const valid = Value.Check(UserSchema, data);
const cloned = Value.Clone(data);
const cleaned = Value.Clean(UserSchema, data);     // remove unknown properties
const defaulted = Value.Default(UserSchema, data); // apply defaults
const converted = Value.Convert(UserSchema, data); // coerce types
const decoded = Value.Decode(UserSchema, data);    // full decode pipeline
```

## Common Patterns

### Fastify route schemas

```ts
import Fastify from "fastify";
import { Type, type Static } from "@sinclair/typebox";

const CreateUserBody = Type.Object({
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: "email" }),
  role: Type.Optional(Type.Union([
    Type.Literal("admin"),
    Type.Literal("user"),
  ])),
});

const UserResponse = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  email: Type.String(),
  role: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
});

const app = Fastify();

app.post<{
  Body: Static<typeof CreateUserBody>;
  Reply: Static<typeof UserResponse>;
}>("/users", {
  schema: {
    body: CreateUserBody,
    response: { 201: UserResponse },
  },
}, async (request, reply) => {
  const { name, email, role } = request.body; // fully typed
  // ...create user
  reply.status(201).send(user);
});
```

### Composable schemas with Ref and reuse

```ts
const AddressSchema = Type.Object({
  street: Type.String(),
  city: Type.String(),
  state: Type.String({ minLength: 2, maxLength: 2 }),
  zip: Type.String({ pattern: "^\\d{5}$" }),
});

const ContactSchema = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
  phone: Type.Optional(Type.String({ pattern: "^\\+?[1-9]\\d{1,14}$" })),
  address: AddressSchema,
  mailingAddress: Type.Optional(AddressSchema),
});

type Contact = Static<typeof ContactSchema>;
```

### Discriminated unions

```ts
const CircleSchema = Type.Object({
  kind: Type.Literal("circle"),
  radius: Type.Number({ minimum: 0 }),
});

const RectSchema = Type.Object({
  kind: Type.Literal("rectangle"),
  width: Type.Number({ minimum: 0 }),
  height: Type.Number({ minimum: 0 }),
});

const ShapeSchema = Type.Union([CircleSchema, RectSchema]);
type Shape = Static<typeof ShapeSchema>;

// With Ajv discriminator optimization
const ShapeSchemaDiscriminated = Type.Union([CircleSchema, RectSchema], {
  discriminator: { propertyName: "kind" },
});
```

### Transform types (encode/decode)

```ts
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const DateSchema = Type.Transform(Type.String({ format: "date-time" }))
  .Decode((value) => new Date(value))   // string -> Date
  .Encode((value) => value.toISOString()); // Date -> string

// Static<typeof DateSchema> is Date (decoded type)
const date = Value.Decode(DateSchema, "2024-01-15T00:00:00Z"); // Date object
const str = Value.Encode(DateSchema, new Date()); // ISO string
```

## Configuration

### Schema options

```ts
// All type builders accept JSON Schema annotations
const Name = Type.String({
  minLength: 1,
  maxLength: 100,
  description: "The user's full name",
  examples: ["John Doe"],
  default: "Anonymous",
});

// additionalProperties control
const StrictObj = Type.Object(
  { name: Type.String() },
  { additionalProperties: false }
);

// Record types for dictionaries
const Headers = Type.Record(Type.String(), Type.String());
// { type: "object", patternProperties: { "^(.*)$": { type: "string" } } }

// Partial and Required modifiers
const PartialUser = Type.Partial(UserSchema);  // all fields optional
const RequiredUser = Type.Required(PartialUser); // all fields required again
```

### Using with Ajv

```ts
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validate = ajv.compile(UserSchema);
if (!validate(data)) {
  console.log(validate.errors);
}
```

## Tips & Gotchas

- `Static<typeof Schema>` extracts the TypeScript type. For Transform types, `Static` gives the decoded type — use `StaticEncode` for the encoded type and `StaticDecode` for the decoded type.
- TypeBox schemas are plain JSON Schema objects at runtime. You can serialize them with `JSON.stringify()` and use them with any JSON Schema-compatible validator.
- `Type.Optional()` wraps a property to make it optional in the TypeScript type. In JSON Schema, it removes the field from the `required` array.
- Use `TypeCompiler.Compile()` for best validation performance — it generates optimized validation code. For one-off checks, `Value.Check()` is simpler but slower.
- `Type.Transform()` with `.Decode()` and `.Encode()` creates bidirectional transforms. Use `Value.Decode()` and `Value.Encode()` to apply them — not `Value.Check()` which ignores transforms.
- TypeBox does not validate formats like `email` or `uuid` by itself. When using Ajv, install `ajv-formats`. When using `TypeCompiler`, format checks are included automatically.
- `Type.Intersect([A, B])` creates an allOf schema. It works like TypeScript's `&` operator for combining object types.
- `Type.Recursive()` handles self-referencing types: `const Tree = Type.Recursive((This) => Type.Object({ value: Type.Number(), children: Type.Array(This) }))`.
- `Value.Clean()` strips unknown properties, `Value.Default()` applies defaults, and `Value.Convert()` coerces types. Chain them: `Value.Decode(Schema, Value.Default(Schema, Value.Clean(Schema, data)))`.
- TypeBox integrates natively with Fastify — just pass TypeBox schemas to route `schema` options and Fastify handles validation and serialization automatically.
