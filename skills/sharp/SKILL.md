---
name: sharp
description: >
  High-performance image processing library using libvips for resizing, format conversion, and manipulation. Use when: resizing images, converting formats (jpeg/png/webp/avif), generating thumbnails, compositing images, extracting metadata. NOT for: image recognition/ML (use tensorflow), SVG manipulation (use svgo), PDF generation (use pdf-lib).
---

# sharp

## Overview
sharp is the fastest Node.js image processing library, leveraging the libvips C library for high-performance operations. It supports reading JPEG, PNG, WebP, AVIF, TIFF, GIF, and SVG formats. sharp uses a pipeline architecture where operations are chained and executed efficiently in a single pass. It handles streaming, buffer, and file-based I/O.

## Installation
```bash
npm install sharp
# yarn
yarn add sharp
# pnpm
pnpm add sharp
```
Note: sharp includes prebuilt binaries for most platforms. No native compilation required in most cases.

## Core API / Commands

### Resize
```js
import sharp from 'sharp';

// Resize to width, maintaining aspect ratio
await sharp('input.jpg')
  .resize(800)
  .toFile('output.jpg');

// Resize to exact dimensions
await sharp('input.jpg')
  .resize(800, 600)
  .toFile('output.jpg');

// Resize with fit options
await sharp('input.jpg')
  .resize(800, 600, {
    fit: 'cover',       // cover | contain | fill | inside | outside
    position: 'centre', // centre | top | right bottom | entropy | attention
  })
  .toFile('output.jpg');
```

### Format conversion
```js
// Convert to WebP
await sharp('photo.jpg')
  .webp({ quality: 80 })
  .toFile('photo.webp');

// Convert to AVIF
await sharp('photo.png')
  .avif({ quality: 50 })
  .toFile('photo.avif');

// Convert to PNG with compression
await sharp('input.jpg')
  .png({ compressionLevel: 9 })
  .toFile('output.png');

// Output to buffer
const buffer = await sharp('input.jpg')
  .resize(200)
  .webp()
  .toBuffer();
```

### Metadata
```js
const metadata = await sharp('photo.jpg').metadata();
console.log(metadata.width);   // 4032
console.log(metadata.height);  // 3024
console.log(metadata.format);  // 'jpeg'
console.log(metadata.space);   // 'srgb'
console.log(metadata.hasAlpha); // false
```

### Rotate, flip, and crop
```js
// Auto-rotate based on EXIF orientation
await sharp('photo.jpg')
  .rotate()
  .toFile('rotated.jpg');

// Rotate by specific angle
await sharp('photo.jpg')
  .rotate(90)
  .toFile('rotated.jpg');

// Extract a region (crop)
await sharp('input.jpg')
  .extract({ left: 100, top: 50, width: 400, height: 300 })
  .toFile('cropped.jpg');

// Flip and flop
await sharp('input.jpg')
  .flip()   // vertical
  .flop()   // horizontal
  .toFile('mirrored.jpg');
```

### Composite (overlay images)
```js
await sharp('background.jpg')
  .composite([
    { input: 'watermark.png', gravity: 'southeast' },
    { input: 'logo.png', top: 10, left: 10 },
  ])
  .toFile('watermarked.jpg');
```

## Common Patterns

### Generate responsive image set
```js
import sharp from 'sharp';

const sizes = [320, 640, 1024, 1920];

async function generateResponsive(inputPath, outputDir) {
  const image = sharp(inputPath);
  const meta = await image.metadata();

  await Promise.all(
    sizes
      .filter((w) => w <= meta.width)
      .map((width) =>
        sharp(inputPath)
          .resize(width)
          .webp({ quality: 80 })
          .toFile(`${outputDir}/image-${width}w.webp`)
      )
  );
}
```

### Image upload processing pipeline
```js
import sharp from 'sharp';

async function processUpload(inputBuffer) {
  const pipeline = sharp(inputBuffer)
    .rotate()           // Auto-orient from EXIF
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .removeAlpha()
    .jpeg({ quality: 85, mozjpeg: true });

  const outputBuffer = await pipeline.toBuffer();
  const { width, height, size } = await sharp(outputBuffer).metadata();
  return { buffer: outputBuffer, width, height, size };
}
```

### Thumbnail with blur placeholder
```js
import sharp from 'sharp';

async function generateThumbnailAndPlaceholder(inputPath) {
  // High-quality thumbnail
  await sharp(inputPath)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile('thumb.jpg');

  // Tiny blurred placeholder (for lazy loading)
  const placeholder = await sharp(inputPath)
    .resize(20)
    .blur(10)
    .toBuffer();

  const base64 = `data:image/jpeg;base64,${placeholder.toString('base64')}`;
  return base64;
}
```

## Configuration
### Output format options
| Format | Key Options |
|--------|------------|
| `jpeg` | `quality` (1-100), `mozjpeg` (boolean), `progressive` (boolean) |
| `png` | `compressionLevel` (0-9), `palette` (boolean), `effort` (1-10) |
| `webp` | `quality` (1-100), `lossless` (boolean), `effort` (0-6) |
| `avif` | `quality` (1-100), `lossless` (boolean), `effort` (0-9) |
| `tiff` | `quality` (1-100), `compression` (lzw/deflate/jpeg/etc) |

## Tips & Gotchas
- **Pipeline architecture**: Chain operations and call `toFile()` or `toBuffer()` once at the end. sharp executes everything in a single optimized pass.
- **Input can be file path, Buffer, or Stream**: `sharp('path')`, `sharp(buffer)`, or `sharp()` with `.pipe()` for streams.
- **`rotate()` with no argument auto-rotates using EXIF**: Always call `.rotate()` on user-uploaded photos to handle phone orientation.
- **`withoutEnlargement: true`**: Prevents upscaling images smaller than the target size. Use inside `resize()` options.
- **sharp instances are single-use**: After calling `toFile()` or `toBuffer()`, create a new `sharp()` instance for additional outputs. Do not reuse.
- **Memory efficient**: sharp processes images via streaming through libvips, so it handles very large images without loading them entirely into memory.
- **Animated GIF/WebP**: sharp supports animated images. Use `{ animated: true }` in the constructor options to preserve animation frames.
- **concurrency**: Control libvips thread pool size with `sharp.concurrency(2)` for environments with limited CPU.
