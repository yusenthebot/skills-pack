---
name: pm2
description: >
  Production process manager for Node.js with built-in load balancer, monitoring, and log management. Use when: running Node apps in production, cluster mode, zero-downtime reloads, process monitoring. NOT for: development hot-reload, serverless functions, container orchestration.
---

# pm2

## Overview
PM2 is a daemon process manager for Node.js applications that helps keep apps running in production. It provides features like cluster mode for load balancing across CPU cores, automatic restarts on crash, zero-downtime reloads, log management, and a monitoring dashboard. PM2 is the standard tool for deploying Node.js apps on traditional servers and VMs.

## Installation
```bash
npm install -g pm2
# or per-project
npm install pm2
```

## Core API / Commands

### Starting and managing processes
```bash
# Start an application
pm2 start app.js
pm2 start app.js --name "my-api"

# Start with options
pm2 start app.js -i max          # Cluster mode (all CPUs)
pm2 start app.js -i 4            # 4 instances
pm2 start app.js --watch         # Watch for file changes
pm2 start app.js --max-memory-restart 300M

# Stop, restart, delete
pm2 stop my-api
pm2 restart my-api
pm2 reload my-api                # Zero-downtime reload (cluster mode)
pm2 delete my-api
pm2 stop all
pm2 restart all

# List running processes
pm2 list
pm2 ls
pm2 status
```

### Logs and monitoring
```bash
# View logs
pm2 logs                         # All processes
pm2 logs my-api                  # Specific process
pm2 logs --lines 200             # Last 200 lines

# Flush logs
pm2 flush

# Monitor (live dashboard)
pm2 monit

# Process details
pm2 show my-api
pm2 describe my-api
```

### Startup and persistence
```bash
# Generate startup script (systemd/upstart/launchd)
pm2 startup
# Save current process list
pm2 save
# Restore saved processes
pm2 resurrect
```

## Common Patterns

### ecosystem.config.js
```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
    },
    {
      name: 'worker',
      script: './dist/worker.js',
      instances: 2,
      exec_mode: 'cluster',
      cron_restart: '0 */6 * * *',  // Restart every 6 hours
    },
  ],
};
```

```bash
# Start with ecosystem file
pm2 start ecosystem.config.js
pm2 start ecosystem.config.js --env production
```

### Programmatic API
```js
const pm2 = require('pm2');

pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  pm2.start({
    script: 'app.js',
    name: 'my-app',
    instances: 4,
    exec_mode: 'cluster',
  }, (err, apps) => {
    if (err) throw err;

    pm2.list((err, list) => {
      console.log(list.map(p => p.name));
      pm2.disconnect();
    });
  });
});
```

### Graceful shutdown handling
```js
// In your app code
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await server.close();
  await db.disconnect();
  process.exit(0);
});

// PM2 sends SIGINT first, then SIGKILL after kill_timeout
// Configure kill_timeout in ecosystem.config.js:
// kill_timeout: 5000 (default 1600ms)
```

## Configuration

### Key ecosystem.config.js options
| Option | Description |
|--------|-------------|
| `instances` | Number of instances (`'max'` for all CPUs) |
| `exec_mode` | `'fork'` (default) or `'cluster'` |
| `watch` | Watch for file changes and restart |
| `ignore_watch` | Directories to ignore when watching |
| `max_memory_restart` | Restart if memory exceeds limit |
| `cron_restart` | Cron pattern for scheduled restarts |
| `autorestart` | Auto restart on crash (default: true) |
| `kill_timeout` | Time to wait before SIGKILL (ms) |
| `listen_timeout` | Time to wait for ready signal (ms) |
| `wait_ready` | Wait for `process.send('ready')` |

## Tips & Gotchas
- Always use `pm2 reload` instead of `pm2 restart` in cluster mode for zero-downtime deployments.
- Run `pm2 startup` and `pm2 save` to persist your process list across server reboots.
- Cluster mode (`exec_mode: 'cluster'`) only works with Node.js apps that listen on a network port -- it does not work with worker scripts or cron jobs.
- Use `--max-memory-restart` to prevent memory leaks from taking down your server.
- PM2 logs grow unbounded by default. Use `pm2 install pm2-logrotate` to manage log file sizes.
- The `wait_ready` option with `process.send('ready')` gives your app time to establish database connections before PM2 considers it online.
- Environment variables in `env_production` are only applied when starting with `--env production`.
- `pm2 delete` removes a process entirely; `pm2 stop` keeps it in the list for later restart.
- Use `pm2 plus` (or `pm2.io`) for remote monitoring, alerting, and a web-based dashboard.
- When using TypeScript, use `pm2 start app.ts --interpreter ./node_modules/.bin/ts-node` or compile first and run the JS output.
