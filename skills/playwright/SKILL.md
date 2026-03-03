---
name: playwright
description: >
  Cross-browser end-to-end testing and automation framework for Chromium, Firefox, and WebKit. Use when: writing E2E tests, automating browser workflows, visual regression testing, API testing alongside UI tests. NOT for: unit testing logic (use Jest/Vitest), load testing.
---

# playwright

## Overview

Playwright is a browser automation framework by Microsoft that enables reliable end-to-end testing across Chromium, Firefox, and WebKit with a single API. It features auto-waiting, web-first assertions, test isolation via browser contexts, tracing, and a built-in code generator. Its fixtures-based test runner (`@playwright/test`) provides parallelism, retries, and rich reporting out of the box.

## Installation

```bash
npm init playwright@latest
# Or manually:
npm install -D @playwright/test
npx playwright install
```

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "npx playwright test",
    "test:e2e:ui": "npx playwright test --ui",
    "test:e2e:codegen": "npx playwright codegen"
  }
}
```

## Core API / Commands

### Basic test structure

```ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('https://myapp.com/login');

  await page.getByLabel('Email').fill('alice@example.com');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading')).toHaveText('Welcome, Alice');
});
```

### Locators

```ts
// Preferred: role-based (accessible, resilient)
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('link', { name: 'Learn more' });

// Text-based
page.getByText('Welcome back');
page.getByLabel('Username');
page.getByPlaceholder('Search...');
page.getByTestId('submit-btn');

// CSS/XPath fallback
page.locator('.card >> text=Details');
page.locator('data-testid=user-list >> li').nth(2);
```

### Assertions

```ts
// Page-level
await expect(page).toHaveTitle(/Dashboard/);
await expect(page).toHaveURL(/\/dashboard/);

// Element-level
await expect(page.getByRole('alert')).toBeVisible();
await expect(page.getByRole('alert')).toHaveText('Saved!');
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.locator('.items')).toHaveCount(5);
```

## Common Patterns

### Fixtures and Page Object Model

```ts
// fixtures.ts
import { test as base } from '@playwright/test';

class LoginPage {
  constructor(private page) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

### API testing

```ts
test('creates a user via API', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Bob', email: 'bob@example.com' },
  });

  expect(response.ok()).toBeTruthy();
  const user = await response.json();
  expect(user.name).toBe('Bob');
});
```

### Visual comparison

```ts
test('homepage looks correct', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01,
  });
});
```

## Configuration

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

## Tips & Gotchas

- **Auto-waiting is built-in** — Playwright automatically waits for elements to be actionable before performing actions. Avoid manual `waitForSelector` unless absolutely necessary.
- **Use `codegen` to bootstrap tests** — Run `npx playwright codegen https://myapp.com` to record interactions and generate test code.
- **Trace viewer for debugging** — Run `npx playwright test --trace on`, then `npx playwright show-trace trace.zip` to step through every action, network request, and DOM snapshot.
- **Test isolation** — Each test gets a fresh `BrowserContext`, so cookies/localStorage don't leak between tests. Use `storageState` to share auth across tests.
- **Persist auth state** — Run a setup project that logs in and saves `storageState` to a file, then reuse it in other projects to skip login in every test.
- **`--ui` mode** — Launches an interactive UI to run, watch, and debug tests visually with time-travel debugging.
- **Use `test.describe.configure({ mode: 'serial' })` sparingly** — Tests run in parallel by default. Only use serial mode when tests have genuine ordering dependencies.
- **Network interception** — Use `page.route('**/api/**', route => route.fulfill({ json: mockData }))` to mock API responses in E2E tests.
- **Soft assertions** — Use `expect.soft(locator).toHaveText('x')` to continue the test even when an assertion fails, collecting all failures at the end.
