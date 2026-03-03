---
name: "nodemailer"
version: "8.0.1"
downloads: 42.7M/month
description: >
  Easy as cake e-mail sending from your Node.js applications. Use when: sending transactional emails; email template rendering; bulk email delivery. NOT for: SMS or push notifications; real-time chat messaging.
---

# nodemailer

## Overview
Easy as cake e-mail sending from your Node.js applications. # Nodemailer Send emails from Node.js – easy as cake.

## Installation
```bash
npm install nodemailer
```

## Core API / Usage
```js
let configOptions = {
    host: 'smtp.example.com',
    port: 587,
    tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    }
};
```

```js
let configOptions = {
    host: '1.2.3.4',
    port: 465,
    secure: true,
    tls: {
        // must provide server name, otherwise TLS certificate check will fail
        servername: 'example.com'
    }
};
```

## Common Patterns
Refer to the [official documentation](https://github.com/nodemailer/nodemailer) for common patterns, recipes, and advanced usage examples.

```js
let configOptions = {
    host: '1.2.3.4',
    port: 465,
    secure: true,
    tls: {
        // must provide server name, otherwise TLS certificate check will fail
        servername: 'example.com'
    }
};
```

## Configuration
```js
let configOptions = {
    host: 'smtp.example.com',
    port: 587,
    tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    }
};
```

## Tips & Gotchas
- Install TypeScript types separately: `npm i -D @types/nodemailer`.
- This package is Node.js only — it does not work in browser environments.
