---
name: listr2
description: >
  Terminal task lists with concurrent execution, subtasks, and multiple renderers. Use when: running multi-step CLI workflows, showing parallel task progress, building install/setup/deploy scripts. NOT for: single spinners (use ora), progress bars (use cli-progress), non-CLI contexts.
---

# listr2

## Overview
Listr2 is a terminal task list library for displaying sequential or concurrent task execution with real-time status updates. It supports subtasks, skip conditions, retry logic, multiple renderer backends, and input prompts within tasks. It is the maintained successor to the original listr package.

## Installation
```bash
npm install listr2
```

## Core API / Commands

```ts
import { Listr } from 'listr2';

const tasks = new Listr([
  {
    title: 'Install dependencies',
    task: async () => {
      await execa('npm', ['install']);
    },
  },
  {
    title: 'Run tests',
    task: async () => {
      await execa('npm', ['test']);
    },
  },
  {
    title: 'Build project',
    task: async () => {
      await execa('npm', ['run', 'build']);
    },
  },
]);

await tasks.run();
```

## Common Patterns

### Subtasks
```ts
const tasks = new Listr([
  {
    title: 'Setup database',
    task: (ctx, task) => task.newListr([
      {
        title: 'Run migrations',
        task: async () => { await runMigrations(); },
      },
      {
        title: 'Seed data',
        task: async () => { await seedData(); },
      },
    ]),
  },
]);
```

### Concurrent tasks
```ts
const tasks = new Listr([
  {
    title: 'Lint',
    task: async () => { await execa('npm', ['run', 'lint']); },
  },
  {
    title: 'Type check',
    task: async () => { await execa('npx', ['tsc', '--noEmit']); },
  },
  {
    title: 'Unit tests',
    task: async () => { await execa('npm', ['test']); },
  },
], { concurrent: true });

await tasks.run();
```

### Context passing between tasks
```ts
interface Ctx {
  version: string;
  artifacts: string[];
}

const tasks = new Listr<Ctx>([
  {
    title: 'Determine version',
    task: async (ctx) => {
      ctx.version = '2.0.0';
    },
  },
  {
    title: 'Build artifacts',
    task: async (ctx) => {
      ctx.artifacts = await buildForVersion(ctx.version);
    },
  },
  {
    title: 'Upload artifacts',
    task: async (ctx, task) => {
      task.title = `Uploading ${ctx.artifacts.length} artifacts for v${ctx.version}`;
      await upload(ctx.artifacts);
    },
  },
]);

const ctx = await tasks.run();
console.log('Published version:', ctx.version);
```

### Skip and enabled conditions
```ts
const tasks = new Listr([
  {
    title: 'Run e2e tests',
    skip: (ctx) => ctx.skipE2e ? 'Skipped via --skip-e2e flag' : false,
    task: async () => { await runE2eTests(); },
  },
  {
    title: 'Deploy to staging',
    enabled: (ctx) => ctx.environment === 'staging',
    task: async () => { await deploy(); },
  },
]);
```

### Retry on failure
```ts
const tasks = new Listr([
  {
    title: 'Flaky API call',
    retry: 3,  // retry up to 3 times on failure
    task: async (ctx, task) => {
      if (task.isRetrying()) {
        task.title = `Flaky API call (attempt ${task.isRetrying().count + 1})`;
      }
      await callFlakyApi();
    },
  },
]);
```

### Updating task output
```ts
const tasks = new Listr([
  {
    title: 'Processing files',
    task: async (ctx, task) => {
      const files = await getFiles();
      for (const [i, file] of files.entries()) {
        task.output = `Processing ${i + 1}/${files.length}: ${file}`;
        await processFile(file);
      }
    },
    options: { bottomBar: Infinity },  // show output below the task
  },
]);
```

## Configuration

### Listr options
```ts
new Listr(tasks, {
  concurrent: false,          // run tasks in parallel
  exitOnError: true,          // stop all tasks on first error
  exitAfterRollback: true,    // exit after rollback completes
  renderer: 'default',        // default | simple | verbose | test | silent
  rendererOptions: {
    showTimer: true,           // show elapsed time per task
    collapseSubtasks: true,    // collapse completed subtasks
    showSubtasks: true,        // show subtask list
    collapseErrors: false,     // collapse error messages
    suffixSkips: true,         // add [SKIPPED] suffix
  },
  fallbackRenderer: 'simple', // renderer for non-TTY environments
  ctx: {},                     // initial context
});
```

### Renderer options
| Renderer | Use case |
|----------|----------|
| `default` | Interactive TTY with animations |
| `simple` | Plain text, line-by-line output |
| `verbose` | Detailed output with timestamps |
| `test` | For testing (captures output) |
| `silent` | No output at all |

## Tips & Gotchas
- Use `concurrent: true` at the Listr level for parallel tasks. Individual tasks can also have their own concurrency settings via `task.newListr(subtasks, { concurrent: true })`.
- The `ctx` object is shared across all tasks. Use it to pass data between sequential tasks.
- `task.title = 'new title'` updates the displayed title in real time. Use this to show progress.
- `task.output = 'status'` shows additional output below the task line. Set `options.bottomBar` to control how many lines to show.
- `skip` can be a function returning a string (shown as skip reason) or a boolean.
- `enabled: false` hides the task entirely. `skip` shows it as skipped. Choose based on UX intent.
- In non-TTY environments (CI), listr2 automatically falls back to the `simple` renderer. Override with `fallbackRenderer`.
- For error handling, listr2 collects all errors when `exitOnError: false` and throws a `ListrError` at the end containing all failures.
- The `retry` option is useful for network operations. Use `task.isRetrying()` to check the current retry state.
- TypeScript generics on `Listr<Ctx>` give you typed access to the context object in all task handlers.
