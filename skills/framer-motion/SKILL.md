---
name: "framer-motion"
version: "12.34.5"
downloads: 113.8M/month
description: >
  A simple and powerful JavaScript animation library. Use when: Simple API: First-class React, JavaScript, and Vue packages; Hybrid engine: Power of JavaScript combined with native browser APIs for 120fps, GPU-accelerated animations; Production-ready: TypeScript, extensive test suite, tree-shakable, tiny footprint. NOT for: server-side CLI utilities; database access layer.
---

# framer-motion

## Overview
A simple and powerful JavaScript animation library. ✨ Sponsors ## Why Motion? - Simple API: First-class React, JavaScript, and Vue packages.

## Installation
```bash
npm install framer-motion
```

## Core API / Usage
```bash
npm install motion
```

```js
import { motion } from "motion/react"

function Component() {
    return <motion.div animate={{ x: 100 }} />
}
```

## Common Patterns
### Pattern 1

```js
import { animate } from "motion"

animate("#box", { x: 100 })
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/framer-motion) for configuration options and advanced settings.

## Tips & Gotchas
- Includes built-in TypeScript type definitions.
- Works in both Node.js and browser environments.
