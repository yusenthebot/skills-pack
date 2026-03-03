---
name: joi
description: >
  Powerful object schema validation library for JavaScript.
  Use when: validating request bodies in Express/Hapi, config objects, or complex nested data
  with conditional rules. NOT for: TypeScript type inference (use Zod), client-side bundle-sensitive
  apps (Joi is large).
---

# joi

## Overview

Joi is a mature, battle-tested schema validation library for JavaScript. It provides a rich,
expressive API for describing data shapes with chained validators, conditional logic, and
custom error formatting. Joi is widely used in Node.js backend applications, particularly
with Hapi and Express, for validating request payloads, query parameters, and configuration.

## Installation

```bash
npm install joi
yarn add joi
pnpm add joi
```

Note: The package is `joi` (lowercase). The older `@hapi/joi` is deprecated.

## Core API / Commands

### Basic schema definition

```js
const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(150),
  role: Joi.string().valid("admin", "user", "editor").default("user"),
  created: Joi.date().default(Date.now),
});

const { error, value } = userSchema.validate(requestBody);
if (error) {
  console.log(error.details[0].message);
} else {
  console.log(value); // validated and with defaults applied
}
```

### Alternatives and conditional validation

```js
const paymentSchema = Joi.object({
  method: Joi.string().valid("card", "bank", "paypal").required(),
  cardNumber: Joi.string().creditCard().when("method", {
    is: "card",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  bankAccount: Joi.string().when("method", {
    is: "bank",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  paypalEmail: Joi.string().email().when("method", {
    is: "paypal",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});
```

### Array and nested object schemas

```js
const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().precision(2).required(),
      })
    )
    .min(1)
    .required(),
  shipping: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    zip: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required(),
  }).required(),
});
```

## Common Patterns

### Express middleware validation

```js
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({ errors: messages });
    }
    req.body = value;
    next();
  };
}

app.post("/users", validate(userSchema), (req, res) => {
  // req.body is validated and cleaned
});
```

### Custom validators and error messages

```js
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .custom((value, helpers) => {
    if (!/[A-Z]/.test(value)) {
      return helpers.error("password.uppercase");
    }
    if (!/[0-9]/.test(value)) {
      return helpers.error("password.digit");
    }
    return value;
  })
  .messages({
    "password.uppercase": "Password must contain at least one uppercase letter",
    "password.digit": "Password must contain at least one digit",
    "string.min": "Password must be at least {#limit} characters",
  });
```

### Referencing other fields

```js
const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
  minAge: Joi.number().integer().min(0),
  maxAge: Joi.number().integer().greater(Joi.ref("minAge")),
});
```

## Configuration

### Validation options

```js
schema.validate(data, {
  abortEarly: false,       // collect all errors, not just the first
  stripUnknown: true,      // remove unknown keys from objects
  allowUnknown: false,     // reject unknown keys (default)
  convert: true,           // attempt type coercion (default true)
  presence: "required",    // make all fields required by default
  noDefaults: false,       // skip applying defaults
});
```

### Shared schemas with extend

```js
const customJoi = Joi.extend((joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.slug": "{{#label}} must be a valid URL slug",
  },
  rules: {
    slug: {
      validate(value, helpers) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return helpers.error("string.slug");
        }
        return value;
      },
    },
  },
}));

const slug = customJoi.string().slug();
```

## Tips & Gotchas

- Joi does NOT infer TypeScript types from schemas. If you need type inference, consider Zod or use a wrapper library like `joi-to-typescript`.
- `abortEarly` defaults to `true`, meaning validation stops at the first error. Set it to `false` for form validation where you want all errors at once.
- `stripUnknown: true` silently removes unknown keys. This is usually what you want for API input but can hide bugs — use `allowUnknown: false` (default) during development.
- `Joi.ref("field")` references a sibling field in the same object. For nested references, use `Joi.ref("parent.child")` or `Joi.ref("/root/path")` with the `in` option.
- `Joi.when()` is powerful but can get complex — consider breaking large conditional schemas into multiple schemas combined with `Joi.alternatives().try()`.
- The `.default()` value is applied after validation succeeds. If the input is `undefined`, the default is used. If the input is `null`, validation fails unless `.allow(null)` is set.
- Joi's bundle size is ~150KB minified. For browser/client-side usage, consider lighter alternatives like Zod or Valibot.
- Use `.label("Friendly Name")` to improve error messages: `"Friendly Name" is required` instead of `"value" is required`.
- `.pattern()` accepts both RegExp and string patterns, but always anchor your regex (`^...$`) to avoid partial matches.
