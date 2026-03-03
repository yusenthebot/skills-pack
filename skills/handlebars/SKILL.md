---
name: "handlebars"
version: "4.7.8"
downloads: 127.2M/month
description: >
  Handlebars provides the power necessary to let you build semantic templates effectively with no frustration. Use when: Block Expressions; Delimited Comments; The optional Mustache-style lambdas are not supported. Instead Handlebars provides its own lambda resolution that follows the behaviors of helpers. NOT for: runtime application logic; package management (use npm/yarn).
---

# handlebars

## Overview
Handlebars provides the power necessary to let you build semantic templates effectively with no frustration. Handlebars.js ============= Handlebars.js is an extension to the Mustache templating language created by Chris Wanstrath.

## Installation
```bash
npm install handlebars
```

## Core API / Usage
```js
var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
var template = Handlebars.compile(source);

var data = { "name": "Alan", "hometown": "Somewhere, TX",
             "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
var result = template(data);

// Would render:
// <p>Hello, my name is Alan. I am from Somewhere, TX. I have 2 kids:</p>
// <ul>
//   <li>Jimmy is 12</li>
//   <li>Sally is 4</li>
// </ul>
```

```js
var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
var template = Handlebars.compile(source);
```

## Common Patterns
### Pattern 1

```js
var data = { "name": "Alan", "hometown": "Somewhere, TX",
             "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
var result = template(data);
```

### Pattern 2

```js
// Would render:
// <p>Hello, my name is Alan. I am from Somewhere, TX. I have 2 kids:</p>
// <ul>
//   <li>Jimmy is 12</li>
//   <li>Sally is 4</li>
// </ul>
```

## Configuration
See the [official documentation](https://www.npmjs.com/package/handlebars) for configuration options and advanced settings.

## Tips & Gotchas
- Current version: 4.7.8. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
