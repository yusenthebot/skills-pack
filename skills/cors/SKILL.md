---
name: "cors"
version: "2.8.6"
downloads: 154.9M/month
description: >
  Node.js CORS middleware. Use when: Enable CORS for a Single Route; Configuring CORS; Configuring CORS w/ Dynamic Origin. NOT for: client-side browser applications; static file serving without a server.
---

# cors

## Overview
Node.js CORS middleware. These headers tell browsers which origins can read responses from your server.

## Installation
```bash
npm install cors
```

## Core API / Usage
```js
$ npm install cors
```

```js
var express = require('express')
var cors = require('cors')
var app = express()

// Adds headers: Access-Control-Allow-Origin: *
app.use(cors())

app.get('/products/:id', function (req, res, next) {
  res.json({msg: 'Hello'})
})

app.listen(80, function () {
  console.log('web server listening on port 80')
})
```

## Common Patterns
### Pattern 1

```js
var express = require('express')
var cors = require('cors')
var app = express()

// Adds headers: Access-Control-Allow-Origin: *
app.get('/products/:id', cors(), function (req, res, next) {
  res.json({msg: 'Hello'})
})

app.listen(80, function () {
  console.log('web server listening on port 80')
})
```

### Pattern 2

```js
var express = require('express')
var cors = require('cors')
var app = express()

var corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Adds headers: Access-Control-Allow-Origin: http://example.com, Vary: Origin
app.get('/products/:id', cors(corsOptions), function (req, res, next) {
  res.json({msg: 'Hello'})
})

app.listen(80, function () {
  console.log('web server listening on port 80')
})
```

### Pattern 3

```js
var express = require('express')
var cors = require('cors')
var app = express()

var corsOptions = {
  origin: function (origin, callback) {
    // db.loadOrigins is an example call to load
    // a list of origins from a backing database
    db.loadOrigins(function (error, origins) {
      callback(error, origins)
    })
  }
}

// Adds headers: Access-Control-Allow-Origin: <matched origin>, Vary: Origin
app.get('/products/:id', cors(corsOptions), function (req, res, next) {
  res.json({msg: 'Hello'})
})

app.listen(80, function () {
  console.log('web server listening on port 80')
})
```

## Configuration
```js
var express = require('express')
var cors = require('cors')
var app = express()

// Adds headers: Access-Control-Allow-Origin: *
app.use(cors())

app.get('/products/:id', function (req, res, next) {
  res.json({msg: 'Hello'})
})

app.listen(80, function () {
  console.log('web server listening on port 80')
})
```

## Tips & Gotchas
- Works in both Node.js and browser environments.
- Current version: 2.8.6. Check the changelog when upgrading across major versions.
