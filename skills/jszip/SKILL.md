---
name: "jszip"
version: "3.10.1"
downloads: 90.3M/month
description: >
  Create, read and edit .zip files with JavaScript http://stuartk.com/jszip. Use when: reading and writing files with extras; directory operations; file pattern matching. NOT for: database replacement; network storage without proper SDKs.
---

# jszip

## Overview
Create, read and edit .zip files with JavaScript http://stuartk.com/jszip. JSZip ===== A library for creating, reading and editing .zip files with JavaScript, with a lovely and simple API.

## Installation
```bash
npm install jszip
```

## Core API / Usage
```js
const zip = new JSZip();

zip.file("Hello.txt", "Hello World\n");

const img = zip.folder("images");
img.file("smile.gif", imgData, {base64: true});

zip.generateAsync({type:"blob"}).then(function(content) {
    // see FileSaver.js
    saveAs(content, "example.zip");
});

/*
Results in a zip containing
Hello.txt
images/
    smile.gif
*/
```

```js
// see FileSaver.js
    saveAs(content, "example.zip");
});
```

## Common Patterns
Refer to the [official documentation](https://github.com/Stuk/jszip) for common patterns, recipes, and advanced usage examples.

```js
// see FileSaver.js
    saveAs(content, "example.zip");
});
```

## Configuration
```js
const zip = new JSZip();

zip.file("Hello.txt", "Hello World\n");

const img = zip.folder("images");
img.file("smile.gif", imgData, {base64: true});

zip.generateAsync({type:"blob"}).then(function(content) {
    // see FileSaver.js
    saveAs(content, "example.zip");
});

/*
Results in a zip containing
Hello.txt
images/
    smile.gif
*/
```

## Tips & Gotchas
- Current version: 3.10.1. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
