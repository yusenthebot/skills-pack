---
name: "async"
version: "3.2.6"
downloads: 331.6M/month
description: >
  Higher-order functions and common patterns for asynchronous code. Use when: common data transformations; reducing boilerplate code; functional programming helpers. NOT for: complex domain-specific business logic; replacing well-supported native APIs.
---

# async

## Overview
Higher-order functions and common patterns for asynchronous code. <!-- |Linux|Windows|MacOS| |-|-|-| | | | | --> Async is a utility module which provides straight-forward, powerful functions for working with asynchronous JavaScript.

## Installation
```bash
npm install async
```

## Core API / Usage
```js
// for use with Node-style callbacks...
var async = require("async");

var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
var configs = {};

async.forEachOf(obj, (value, key, callback) => {
    fs.readFile(__dirname + value, "utf8", (err, data) => {
        if (err) return callback(err);
        try {
            configs[key] = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
}, err => {
    if (err) console.error(err.message);
    // configs is now a map of JSON data
    doSomethingWith(configs);
});
```

```js
var async = require("async");

// ...or ES2017 async functions
async.mapLimit(urls, 5, async function(url) {
    const response = await fetch(url)
    return response.body
}, (err, results) => {
    if (err) throw err
    // results is now an array of the response bodies
    console.log(results)
})
```

## Common Patterns
Refer to the [official documentation](https://github.com/caolan/async) for common patterns, recipes, and advanced usage examples.

```js
var async = require("async");

// ...or ES2017 async functions
async.mapLimit(urls, 5, async function(url) {
    const response = await fetch(url)
    return response.body
}, (err, results) => {
    if (err) throw err
    // results is now an array of the response bodies
    console.log(results)
})
```

## Configuration
```js
// for use with Node-style callbacks...
var async = require("async");

var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
var configs = {};

async.forEachOf(obj, (value, key, callback) => {
    fs.readFile(__dirname + value, "utf8", (err, data) => {
        if (err) return callback(err);
        try {
            configs[key] = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
}, err => {
    if (err) console.error(err.message);
    // configs is now a map of JSON data
    doSomethingWith(configs);
});
```

## Tips & Gotchas
- This package is ESM-only. Use `import` syntax; `require()` is not supported.
- Works in both Node.js and browser environments.
