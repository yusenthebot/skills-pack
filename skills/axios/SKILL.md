---
name: axios
description: >
  Promise-based HTTP client for the browser and Node.js. Use when: making REST API calls, needing request/response interceptors, configuring reusable HTTP instances, handling file uploads. NOT for: GraphQL-specific clients, WebSocket connections.
---

# axios

## Overview
Axios is a widely-used, promise-based HTTP client that works in both Node.js and the browser. It provides a clean API for making HTTP requests with features like automatic JSON parsing, request/response interceptors, request cancellation, and configurable defaults. It handles edge cases like XSRF protection and request timeouts out of the box.

## Installation
```bash
npm install axios
yarn add axios
pnpm add axios
```

## Core API / Commands

### Basic Requests
```js
import axios from 'axios';

// GET request
const { data } = await axios.get('/users', { params: { page: 2 } });

// POST request with body
const response = await axios.post('/users', {
  name: 'Alice',
  email: 'alice@example.com',
});

// Other methods
await axios.put('/users/1', { name: 'Bob' });
await axios.patch('/users/1', { name: 'Bob' });
await axios.delete('/users/1');
```

### Creating an Instance
```js
const api = axios.create({
  baseURL: 'https://api.example.com/v2',
  timeout: 10000,
  headers: { 'Authorization': `Bearer ${token}` },
});

const { data } = await api.get('/users');
```

## Common Patterns

### Request/Response Interceptors
```js
// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const newToken = await refreshToken();
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);
```

### File Upload with Progress
```js
const formData = new FormData();
formData.append('file', fileBuffer, 'report.pdf');

await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (event) => {
    const percent = Math.round((event.loaded * 100) / event.total);
    console.log(`Upload: ${percent}%`);
  },
});
```

### Request Cancellation with AbortController
```js
const controller = new AbortController();

const promise = axios.get('/slow-endpoint', {
  signal: controller.signal,
});

// Cancel the request after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  await promise;
} catch (err) {
  if (axios.isCancel(err)) {
    console.log('Request was cancelled');
  }
}
```

## Configuration

```js
// Global defaults
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.timeout = 15000;
axios.defaults.headers.common['Accept'] = 'application/json';

// Per-request config
await axios.get('/data', {
  timeout: 5000,
  responseType: 'arraybuffer',        // 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream'
  validateStatus: (status) => status < 500, // treat 4xx as non-errors
  maxRedirects: 3,                     // Node.js only
  decompress: true,                    // auto-decompress gzip/deflate
});
```

## Tips & Gotchas
- **axios throws on non-2xx by default** — use `validateStatus` to customize which status codes throw.
- **`data` vs `response`** — destructure `{ data }` for the payload; the full response includes `status`, `headers`, `config`.
- **Interceptor order matters** — request interceptors run in reverse order of registration; response interceptors run in order.
- **FormData in Node.js** — axios v1+ detects `FormData` and sets `Content-Type` automatically including the boundary; do not set it manually.
- **Timeouts only cover response start** — `timeout` fires if no response bytes arrive within the period, not total transfer time.
- **Query params serialization** — nested objects in `params` are serialized with brackets by default; use `paramsSerializer` for custom formats.
- **The legacy `CancelToken` API is deprecated** — always prefer `AbortController` with the `signal` option.
- **Concurrent requests** — use `Promise.all([axios.get('/a'), axios.get('/b')])` instead of the deprecated `axios.all`.
