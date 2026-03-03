---
name: typescript
description: >
  TypeScript compiler and language. Use when: adding types to JavaScript, catching bugs at compile time, IDE autocomplete, large codebases. NOT for: quick scripts where types add friction, runtime type checking (use Zod).
---

# typescript

## Installation
```bash
npm install -D typescript
npx tsc --init  # generate tsconfig.json
```

## tsconfig.json (recommended)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Key Types

```ts
// Primitives
let name: string = 'Alice';
let age: number = 25;
let active: boolean = true;

// Arrays
let tags: string[] = ['a', 'b'];
let pairs: [string, number][] = [['a', 1]]; // tuple array

// Objects
interface User {
  id: number;
  name: string;
  email?: string; // optional
  readonly createdAt: Date;
}

// Union & Intersection
type Status = 'pending' | 'active' | 'inactive';
type AdminUser = User & { role: 'admin'; permissions: string[] };

// Generic
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

## Utility Types

```ts
type Partial<T>        // all fields optional
type Required<T>       // all fields required
type Readonly<T>       // all fields readonly
type Pick<T, K>        // select fields
type Omit<T, K>        // exclude fields
type Record<K, V>      // { [key: K]: V }
type Exclude<T, U>     // remove U from T union
type Extract<T, U>     // keep only U from T union
type NonNullable<T>    // remove null/undefined
type ReturnType<F>     // infer function return type
type Parameters<F>     // infer function param types
type Awaited<T>        // unwrap Promise<T> → T

// Usage
type UserPreview = Pick<User, 'id' | 'name'>;
type UpdateUser = Partial<Omit<User, 'id' | 'createdAt'>>;
```

## Advanced Patterns

### Discriminated unions
```ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handle(result: Result<User>) {
  if (result.success) {
    console.log(result.data.name); // typed as User
  } else {
    console.log(result.error);
  }
}
```

### Type guards
```ts
function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'id' in val;
}
```

### Template literal types
```ts
type EventName = `on${Capitalize<string>}`;
type CSSProperty = `${string}-${string}`;
```

## CLI Commands

```bash
tsc                    # compile
tsc --watch            # watch mode
tsc --noEmit           # type-check only (no output)
tsc --showConfig       # show resolved config
```

## Tips & Gotchas
- `strict: true` enables: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc — always enable
- `as unknown as T` is the safer cast vs `as T` directly
- Don't use `any` — use `unknown` and narrow with type guards
- `satisfies` operator (TS 4.9): validates type without widening
- For ESM: `"module": "NodeNext"` requires `.js` extensions in imports even for `.ts` files
