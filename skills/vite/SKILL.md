---
name: vite
description: >
  Fast frontend build tool. Use when: React/Vue/Svelte projects, ES modules dev server, library bundling. NOT for: Node.js server apps, projects requiring Webpack-specific plugins with no Vite equivalent.
---

# vite

## Installation
```bash
npm create vite@latest my-app -- --template react-ts
# or add to existing:
npm install -D vite
```

## vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

## CLI Commands

```bash
vite          # dev server (localhost:5173)
vite build    # production build
vite preview  # preview production build locally
```

## Library Mode

```ts
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs'],
      fileName: (format) => `my-lib.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],  // don't bundle react
    },
  },
});
```

## Env Variables

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

```ts
// Access with VITE_ prefix only
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.MODE);      // 'development' | 'production'
console.log(import.meta.env.DEV);       // boolean
console.log(import.meta.env.PROD);      // boolean
```

## Common Patterns

### Path aliases
```ts
// tsconfig.json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
// vite.config.ts
resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
```

### Multiple pages (MPA)
```ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
    },
  },
});
```

## Tips & Gotchas
- Only env vars prefixed with `VITE_` are exposed to client code (security by default)
- `import.meta.glob('./components/*.tsx')` for dynamic imports of multiple files
- HMR is automatic — no config needed for React/Vue
- Use `vite-plugin-inspect` to debug plugin transforms
- `.env.local` is git-ignored by default — use for secrets
