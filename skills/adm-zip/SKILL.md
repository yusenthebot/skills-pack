---
name: "adm-zip"
version: "0.5.16"
downloads: 45.0M/month
description: >
  Javascript implementation of zip for nodejs with support for electron original-fs. Allows user to create or extract zip files both in memory or to/from disk. Use when: decompress zip files directly to disk or in memory buffers; compress files and store them to disk in .zip format or in compressed buffers; update content of/add new/delete files from an existing .zip. NOT for: database replacement; network storage without proper SDKs.
---

# adm-zip

## Overview
Javascript implementation of zip for nodejs with support for electron original-fs. Allows user to create or extract zip files both in memory or to/from disk. # ADM-ZIP for NodeJS ADM-ZIP is a pure JavaScript implementation for zip data compression for NodeJS.

## Installation
```bash
npm install adm-zip
```

## Core API / Usage
```js
var AdmZip = require("adm-zip");

// reading archives
var zip = new AdmZip("./my_file.zip");
var password = "1234567890";
var zipEntries = zip.getEntries(); // an array of ZipEntry records - add password parameter if entries are password protected

zipEntries.forEach(function (zipEntry) {
    console.log(zipEntry.toString()); // outputs zip entries information
    if (zipEntry.entryName == "my_file.txt") {
        console.log(zipEntry.getData().toString("utf8"));
    }
});
// outputs the content of some_folder/my_file.txt
console.log(zip.readAsText("some_folder/my_file.txt"));
// extracts the specified file to the specified location
zip.extractEntryTo(/*entry name*/ "some_folder/my_file.txt", /*target path*/ "/home/me/tempfolder", /*maintainEntryPath*/ false, /*overwrite*/ true);
// extracts everything
zip.extractAllTo(/*target path*/ "/home/me/zipcontent/", /*overwrite*/ true);

// creating archives
var zip = new AdmZip();

// add file directly
var content = "inner content of the file";
zip.addFile("test.txt", Buffer.from(content, "utf8"), "entry comment goes here");
// add local file
zip.addLocalFile("/home/me/some_picture.png");
// get everything as a buffer
var willSendthis = zip.toBuffer();
// or write everything to disk
zip.writeZip(/*target file name*/ "/home/me/files.zip");

// ... more examples in the wiki
```

```js
const AdmZip = require("adm-zip");
const OriginalFs = require("original-fs");

// reading archives
const zip = new AdmZip("./my_file.zip", { fs: OriginalFs });
.
.
.
```

## Common Patterns
### Key Features

- **decompress zip files directly to disk or in memory buffers**
- **compress files and store them to disk in .zip format or in compressed buffers**
- **update content of/add new/delete files from an existing .zip**

### Example

```js
const AdmZip = require("adm-zip");
const OriginalFs = require("original-fs");

// reading archives
const zip = new AdmZip("./my_file.zip", { fs: OriginalFs });
.
.
.
```

## Configuration
```js
var AdmZip = require("adm-zip");

// reading archives
var zip = new AdmZip("./my_file.zip");
var password = "1234567890";
var zipEntries = zip.getEntries(); // an array of ZipEntry records - add password parameter if entries are password protected

zipEntries.forEach(function (zipEntry) {
    console.log(zipEntry.toString()); // outputs zip entries information
    if (zipEntry.entryName == "my_file.txt") {
        console.log(zipEntry.getData().toString("utf8"));
    }
});
// outputs the content of some_folder/my_file.txt
console.log(zip.readAsText("some_folder/my_file.txt"));
// extracts the specified file to the specified location
zip.extractEntryTo(/*entry name*/ "some_folder/my_file.txt", /*target path*/ "/home/me/tempfolder", /*maintainEntryPath*/ false, /*overwrite*/ true);
// extracts everything
zip.extractAllTo(/*target path*/ "/home/me/zipcontent/", /*overwrite*/ true);

// creating archives
var zip = new AdmZip();

// add file directly
var content = "inner content of the file";
zip.addFile("test.txt", Buffer.from(content, "utf8"), "entry comment goes here");
// add local file
zip.addLocalFile("/home/me/some_picture.png");
// get everything as a buffer
var willSendthis = zip.toBuffer();
// or write everything to disk
zip.writeZip(/*target file name*/ "/home/me/files.zip");

// ... more examples in the wiki
```

## Tips & Gotchas
- Current version: 0.5.16. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
