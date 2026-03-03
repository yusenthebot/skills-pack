---
name: pdf-lib
description: >
  Pure JavaScript library for creating and modifying PDF documents. Use when: generating PDFs, adding text/images to existing PDFs, filling form fields, merging PDFs, extracting page counts. NOT for: parsing PDF text content (use pdf-parse), rendering PDFs to images (use pdf.js), HTML-to-PDF conversion (use puppeteer or playwright).
---

# pdf-lib

## Overview
pdf-lib is a pure JavaScript library for creating and modifying PDF documents in any JavaScript environment (Node.js, browsers, Deno). It has zero native dependencies and supports creating PDFs from scratch, modifying existing PDFs, adding text, images, form fields, and merging multiple PDFs. Unlike many PDF libraries, it works entirely in JavaScript without external binaries.

## Installation
```bash
npm install pdf-lib
# yarn
yarn add pdf-lib
# pnpm
pnpm add pdf-lib

# For custom fonts, also install:
npm install @pdf-lib/fontkit
```

## Core API / Commands

### Create a new PDF
```js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([600, 400]); // width x height in points

const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('Hello, PDF!', {
  x: 50,
  y: 350,
  size: 30,
  font,
  color: rgb(0, 0, 0),
});

const pdfBytes = await pdfDoc.save();
// Write to file in Node.js
import fs from 'fs';
fs.writeFileSync('output.pdf', pdfBytes);
```

### Load and modify an existing PDF
```js
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const existingPdfBytes = fs.readFileSync('input.pdf');
const pdfDoc = await PDFDocument.load(existingPdfBytes);

const pages = pdfDoc.getPages();
const firstPage = pages[0];

firstPage.drawText('CONFIDENTIAL', {
  x: 200,
  y: 50,
  size: 24,
  color: rgb(1, 0, 0),
  opacity: 0.5,
});

const modifiedBytes = await pdfDoc.save();
fs.writeFileSync('stamped.pdf', modifiedBytes);
```

### Embed images
```js
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage();

// Embed PNG
const pngBytes = fs.readFileSync('logo.png');
const pngImage = await pdfDoc.embedPng(pngBytes);

// Embed JPEG
const jpgBytes = fs.readFileSync('photo.jpg');
const jpgImage = await pdfDoc.embedJpg(jpgBytes);

// Draw scaled image
const pngDims = pngImage.scale(0.5);
page.drawImage(pngImage, {
  x: 50,
  y: 500,
  width: pngDims.width,
  height: pngDims.height,
});

const pdfBytes = await pdfDoc.save();
```

### Merge PDFs
```js
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function mergePdfs(pdfPaths) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

const merged = await mergePdfs(['doc1.pdf', 'doc2.pdf', 'doc3.pdf']);
fs.writeFileSync('merged.pdf', merged);
```

### Fill form fields
```js
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const pdfBytes = fs.readFileSync('form-template.pdf');
const pdfDoc = await PDFDocument.load(pdfBytes);
const form = pdfDoc.getForm();

form.getTextField('name').setText('Jane Doe');
form.getTextField('email').setText('jane@example.com');
form.getCheckBox('agree').check();
form.getDropdown('country').select('United States');

// Optionally flatten (make fields non-editable)
form.flatten();

const filledBytes = await pdfDoc.save();
fs.writeFileSync('filled-form.pdf', filledBytes);
```

## Common Patterns

### Invoice generator
```js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function createInvoice(items, total) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText('INVOICE', { x: 50, y: 780, size: 28, font: boldFont });

  let y = 720;
  for (const item of items) {
    page.drawText(item.name, { x: 50, y, size: 12, font });
    page.drawText(`$${item.price.toFixed(2)}`, { x: 450, y, size: 12, font });
    y -= 25;
  }

  page.drawLine({ start: { x: 50, y: y + 10 }, end: { x: 530, y: y + 10 } });
  page.drawText(`Total: $${total.toFixed(2)}`, {
    x: 400, y: y - 15, size: 16, font: boldFont,
  });

  return pdfDoc.save();
}
```

### Add page numbers to existing PDF
```js
import { PDFDocument, StandardFonts } from 'pdf-lib';

async function addPageNumbers(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  pages.forEach((page, i) => {
    const { width } = page.getSize();
    page.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: width / 2 - 40,
      y: 20,
      size: 10,
      font,
    });
  });

  return pdfDoc.save();
}
```

## Configuration
| Method | Description |
|--------|-------------|
| `PDFDocument.create()` | Create new empty PDF |
| `PDFDocument.load(bytes, opts)` | Load existing PDF from Uint8Array/ArrayBuffer |
| `pdfDoc.save()` | Serialize to Uint8Array |
| `pdfDoc.saveAsBase64({ dataUri: true })` | Serialize as base64 data URI |

Load options:
| Option | Type | Description |
|--------|------|-------------|
| `ignoreEncryption` | boolean | Load encrypted PDFs without password |
| `updateMetadata` | boolean | Auto-update modification date (default: true) |

## Tips & Gotchas
- **Coordinates start from bottom-left**: Unlike HTML, PDF coordinates have (0,0) at the bottom-left corner. `y` increases upward.
- **Units are in points**: 1 point = 1/72 inch. A4 is 595 x 842 points. Letter is 612 x 792 points.
- **Standard fonts are limited**: Only 14 standard fonts are available (Helvetica, Times, Courier, etc.). For custom fonts, use `@pdf-lib/fontkit` and `pdfDoc.embedFont(fontBytes)`.
- **Images must be PNG or JPEG**: Use `embedPng()` for PNG and `embedJpg()` for JPEG. Other formats need to be converted first.
- **`copyPages` is required for merging**: You cannot directly add pages from one PDF to another. Always use `copyPages()` first.
- **`form.flatten()` makes fields permanent**: After flattening, form fields become static text and cannot be edited.
- **Uint8Array, not Buffer**: `save()` returns a `Uint8Array`. In Node.js, it works with `fs.writeFileSync` directly.
- **No text extraction**: pdf-lib cannot read/extract text from existing PDFs. Use `pdf-parse` for that.
