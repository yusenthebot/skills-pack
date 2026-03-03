---
name: yup
description: >
  Schema validation library with a chainable API and runtime type coercion.
  Use when: building forms with Formik or React Hook Form, validating user input with
  coercion, defining reusable validation schemas. NOT for: strict TypeScript type inference
  (use Zod), server-side-only validation (consider Joi).
---

# yup

## Overview

Yup is a schema builder for runtime value parsing and validation. It provides a chainable,
expressive API for defining schemas that can coerce values, apply transforms, and validate
complex nested objects. Yup is particularly popular in the React ecosystem as the default
validation solution for Formik and a common choice for React Hook Form via resolvers.

## Installation

```bash
npm install yup
yarn add yup
pnpm add yup
```

Yup v1+ is ESM-first and ships TypeScript types.

## Core API / Commands

### Basic schemas

```ts
import * as yup from "yup";

const nameSchema = yup.string().required().min(1).max(100);
const ageSchema = yup.number().required().positive().integer();
const emailSchema = yup.string().required().email("Must be a valid email");
const activeSchema = yup.boolean().default(false);
const dateSchema = yup.date().min(new Date("2020-01-01"));
```

### Object schemas with shape

```ts
const userSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required(),
  age: yup.number().positive().integer().nullable(),
  role: yup.string().oneOf(["admin", "user", "editor"]).default("user"),
  address: yup.object({
    street: yup.string().required(),
    city: yup.string().required(),
    zip: yup.string().matches(/^\d{5}$/, "Must be a 5-digit zip code"),
  }),
});

type User = yup.InferType<typeof userSchema>;

// validate throws on error
try {
  const user = await userSchema.validate(input, { abortEarly: false });
} catch (err) {
  if (err instanceof yup.ValidationError) {
    console.log(err.errors); // string[]
    console.log(err.inner);  // per-field errors
  }
}
```

### Casting and coercion

```ts
// Yup coerces by default during validation
const schema = yup.number();
schema.cast("42"); // 42

const dateSchema = yup.date();
dateSchema.cast("2024-01-15"); // Date object

// strip unknown keys
const strict = yup.object({ name: yup.string() }).noUnknown();
```

## Common Patterns

### Formik integration

```tsx
import { Formik, Form, Field, ErrorMessage } from "formik";

const SignupSchema = yup.object({
  email: yup.string().email("Invalid email").required("Required"),
  password: yup
    .string()
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .required("Required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Required"),
});

function Signup() {
  return (
    <Formik
      initialValues={{ email: "", password: "", confirmPassword: "" }}
      validationSchema={SignupSchema}
      onSubmit={(values) => console.log(values)}
    >
      <Form>
        <Field name="email" type="email" />
        <ErrorMessage name="email" />
        <Field name="password" type="password" />
        <ErrorMessage name="password" />
        <button type="submit">Sign Up</button>
      </Form>
    </Formik>
  );
}
```

### Conditional validation with when

```ts
const shippingSchema = yup.object({
  deliveryMethod: yup.string().oneOf(["pickup", "delivery"]).required(),
  address: yup.string().when("deliveryMethod", {
    is: "delivery",
    then: (schema) => schema.required("Address is required for delivery"),
    otherwise: (schema) => schema.notRequired(),
  }),
  pickupDate: yup.date().when("deliveryMethod", {
    is: "pickup",
    then: (schema) => schema.required().min(new Date(), "Must be a future date"),
  }),
});
```

### Custom test validators

```ts
const usernameSchema = yup
  .string()
  .required()
  .test(
    "no-spaces",
    "Username cannot contain spaces",
    (value) => !value?.includes(" ")
  )
  .test(
    "is-available",
    "Username is already taken",
    async (value) => {
      if (!value) return true;
      const available = await checkUsernameAvailable(value);
      return available;
    }
  );
```

### Array validation

```ts
const cartSchema = yup.object({
  items: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().uuid().required(),
        quantity: yup.number().integer().min(1).max(99).required(),
      })
    )
    .min(1, "Cart must have at least one item")
    .required(),
});
```

## Configuration

### Validation options

```ts
schema.validate(data, {
  abortEarly: false,    // return all errors, not just the first
  strict: false,        // skip coercion, validate raw input
  stripUnknown: true,   // remove unknown object keys
  recursive: true,      // validate nested objects (default true)
  context: { user },    // pass external context to when/test
});

// Or use validateSync for synchronous validation (no async tests)
const result = schema.validateSync(data);

// Use isValid for a boolean check
const ok = await schema.isValid(data);
```

### Custom locale and error messages

```ts
yup.setLocale({
  mixed: {
    required: "${path} is required",
    oneOf: "${path} must be one of: ${values}",
  },
  string: {
    email: "${path} must be a valid email",
    min: "${path} must be at least ${min} characters",
  },
  number: {
    min: "${path} must be at least ${min}",
  },
});
```

## Tips & Gotchas

- Yup coerces values by default (e.g., `"42"` becomes `42` for number schemas). Pass `{ strict: true }` to `validate()` to disable coercion.
- `yup.ref("fieldName")` references a sibling field. It works inside `.oneOf()`, `.min()`, `.max()`, and `.when()` for cross-field validation.
- `abortEarly` defaults to `true`. For form validation, always set it to `false` so users see all errors at once.
- `.nullable()` allows `null` values. `.optional()` allows `undefined`. Without these, both `null` and `undefined` fail `.required()`.
- Async tests (like checking username availability) require using `validate()` not `validateSync()`. `validateSync` throws if the schema contains any async tests.
- `yup.InferType<typeof schema>` gives the output type after coercion. The input type may differ (e.g., string input coerced to number).
- `.transform()` runs before validation. Use it to normalize data: `yup.string().transform((v) => v?.trim())`.
- When using `.when()` in Yup v1+, the `then` and `otherwise` values must be functions: `then: (schema) => schema.required()`, not `then: yup.string().required()`.
- `.strip()` on a field removes it from the output after validation — useful for removing confirm-password fields from the final data.
- Error messages support interpolation: `${path}` is the field name, `${min}`, `${max}`, `${values}` are constraint values.
