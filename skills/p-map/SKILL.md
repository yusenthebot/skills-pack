---
name: "p-map"
version: "7.0.4"
downloads: 271.4M/month
description: >
  Map over promises concurrently. Use when: common data transformations; reducing boilerplate code; functional programming helpers. NOT for: complex domain-specific business logic; replacing well-supported native APIs.
---

# p-map

## Overview
Map over promises concurrently. A popular utility package for Node.js with 271.4M monthly downloads.

## Installation
```bash
npm install p-map
```

## Core API / Usage
```bash
npm install p-map
```

```js
import pMap from 'p-map';
import got from 'got';

const sites = [
	getWebsiteFromUsername('sindresorhus'), //=> Promise
	'https://avajs.dev',
	'https://github.com'
];

const mapper = async site => {
	const {requestUrl} = await got.head(site);
	return requestUrl;
};

const result = await pMap(sites, mapper, {concurrency: 2});

console.log(result);
//=> ['https://sindresorhus.com/', 'https://avajs.dev/', 'https://github.com/']
```

## Common Patterns
### Pattern 1

```js
import {pMapIterable} from 'p-map';

// Multiple posts are fetched concurrently, with limited concurrency and backpressure
for await (const post of pMapIterable(postIds, getPostMetadata, {concurrency: 8})) {
	console.log(post);
};
```

### Pattern 2

```js
import pMap from 'p-map';
import delay from 'delay';

const abortController = new AbortController();

setTimeout(() => {
	abortController.abort();
}, 500);

const mapper = async value => value;

await pMap([delay(1000), delay(1000)], mapper, {signal: abortController.signal});
// Throws AbortError (DOMException) after 500 ms.
```

## Configuration
```js
import pMap from 'p-map';
import delay from 'delay';

const abortController = new AbortController();

setTimeout(() => {
	abortController.abort();
}, 500);

const mapper = async value => value;

await pMap([delay(1000), delay(1000)], mapper, {signal: abortController.signal});
// Throws AbortError (DOMException) after 500 ms.
```

## Tips & Gotchas
- Current version: 7.0.4. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
