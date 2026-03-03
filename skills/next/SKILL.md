---
name: "next"
version: "16.1.6"
downloads: 129.7M/month
description: >
  The React Framework. Use when: building full-stack React applications with server-side rendering; static site generation with incremental static regeneration; API routes and serverless functions. NOT for: simple static HTML sites without React; non-React frontend projects.
---

# next

## Overview
Next.js is the React framework for production. It provides a complete solution for building React applications with hybrid static and server rendering, TypeScript support, smart bundling, route pre-fetching, and built-in CSS support with zero configuration required.

## Installation
```bash
npm install next react react-dom
```

## Core API / Usage
```js
// pages/index.js — basic page component
export default function Home() {
  return <h1>Welcome to Next.js</h1>;
}

// pages/api/hello.js — API route
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from Next.js' });
}
```

```js
// App Router (app/page.tsx) — Next.js 13+
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  return <main>{json.title}</main>;
}
```

## Common Patterns

### Server-Side Rendering (SSR)
```js
// pages/posts/[id].js
export async function getServerSideProps({ params }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();
  return { props: { post } };
}

export default function Post({ post }) {
  return <article><h1>{post.title}</h1><p>{post.body}</p></article>;
}
```

### Static Site Generation (SSG)
```js
export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  const paths = posts.map((post) => ({ params: { id: String(post.id) } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();
  return { props: { post }, revalidate: 60 };
}
```

### Middleware
```js
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  if (!request.cookies.get('token')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
```

## Configuration
```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
  experimental: {
    serverActions: true,
  },
};
module.exports = nextConfig;
```

## Tips & Gotchas
- Includes built-in TypeScript type definitions — add `tsconfig.json` and Next.js auto-configures it.
- The App Router (Next.js 13+) uses React Server Components by default; add `'use client'` directive for client components.
- `next/image` requires width and height props or `fill` for responsive images — it optimizes images automatically.
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser; all others are server-only.
- API routes in `pages/api/` run as serverless functions — they don't have access to React component context.
