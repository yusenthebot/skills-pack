---
name: "jotai"
version: "2.18.0"
downloads: 11.9M/month
description: >
  👻 Primitive and flexible state management for React. Use when: building component-based UIs; client-side state and rendering; interactive user interfaces. NOT for: server-side CLI utilities; database access layer.
---

# jotai

## Overview
👻 Primitive and flexible state management for React. - Minimal core API (2kb) - Many utilities and extensions - No string keys (compared to Recoil) Examples: Demo 1 | Demo 2 ### First, create a primitive atom An atom represents a piece of state.

## Installation
```bash
npm install jotai
```

## Core API / Usage
```js
import { atom } from 'jotai'

const countAtom = atom(0)
const countryAtom = atom('Japan')
const citiesAtom = atom(['Tokyo', 'Kyoto', 'Osaka'])
const mangaAtom = atom({ 'Dragon Ball': 1984, 'One Piece': 1997, Naruto: 1999 })
```

```js
import { useAtom } from 'jotai'

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return (
    <h1>
      {count}
      <button onClick={() => setCount((c) => c + 1)}>one up</button>
      ...
```

## Common Patterns
### Pattern 1

```js
const doubledCountAtom = atom((get) => get(countAtom) * 2)

function DoubleCounter() {
  const [doubledCount] = useAtom(doubledCountAtom)
  return <h2>{doubledCount}</h2>
}
```

### Pattern 2

```js
const count1 = atom(1)
const count2 = atom(2)
const count3 = atom(3)

const sum = atom((get) => get(count1) + get(count2) + get(count3))
```

### Pattern 3

```js
const atoms = [count1, count2, count3, ...otherAtoms]
const sum = atom((get) => atoms.map(get).reduce((acc, count) => acc + count))
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/jotai) for configuration options and advanced settings.

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Current version: 2.18.0. Check the changelog when upgrading across major versions.
