---
name: "resend"
version: "6.9.3"
downloads: 11.1M/month
description: >
  Node.js library for the Resend API. Use when: <a href="https://resend.com/docs/send-with-nextjs">Next.js</a>; <a href="https://resend.com/docs/send-with-remix">Remix</a>; <a href="https://resend.com/docs/send-with-nuxt">Nuxt</a>. NOT for: SMS or push notifications; real-time chat messaging.
---

# resend

## Overview
Node.js library for the Resend API. ```jsx import React from 'react'; export default function EmailTemplate({ firstName, product }) { return ( <div> <h1>Welcome, {firstName}!</h1> <p>Thanks for trying {product}.

## Installation
```bash
npm install resend
```

## Core API / Usage
```bash
npm install resend
# or
yarn add resend
```

```js
import { Resend } from 'resend';
const resend = new Resend('re_xxxx...xxxxxx');
```

## Common Patterns
### Pattern 1

```js
const { data } = await resend.emails.send({
  from: 'you@example.com',
  to: 'user@gmail.com',
  replyTo: 'you@example.com',
  subject: 'hello world',
  text: 'it works!',
});

console.log(`Email ${data.id} has been sent`);
```

### Pattern 2

```js
const { data } = await resend.emails.send({
  from: 'you@example.com',
  to: 'user@gmail.com',
  replyTo: 'you@example.com',
  subject: 'hello world',
  html: '<strong>it works!</strong>',
});

console.log(`Emaill ${data.id} with customer HTML content has been sent.`);
```

### Pattern 3

```js
import React from 'react';

export default function EmailTemplate({ firstName, product }) {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
      <p>Thanks for trying {product}. We’re thrilled to have you on board.</p>
    </div>
  );
}
```

## Configuration
```js
import { Resend } from 'resend';
const resend = new Resend('re_xxxx...xxxxxx');
```

## Tips & Gotchas
- In order to send from your own domain, you will first need to verify your domain in the Resend Dashboard.
- Current version: 6.9.3. Check the changelog when upgrading across major versions.
