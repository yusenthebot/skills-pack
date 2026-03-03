---
name: replicate
description: >
  JavaScript client for the Replicate API to run ML models in the cloud. Use when: running open-source ML models (image gen, LLMs, audio, video), deploying model inference without managing infrastructure, using Stable Diffusion/Flux/Llama via API. NOT for: training models, running models locally, OpenAI/Anthropic-specific features.
---

# replicate

## Overview

The `replicate` package is the official Node.js/TypeScript client for Replicate, a platform that lets you run open-source machine learning models in the cloud via a simple API. It supports image generation (Stable Diffusion, Flux), language models (Llama, Mistral), audio (Whisper, MusicGen), video, and thousands of other community-published models. The SDK handles predictions, streaming, file uploads, webhooks, and model versioning.

## Installation

```bash
npm install replicate
yarn add replicate
pnpm add replicate
```

## Core API / Commands

### Client initialization

```ts
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // defaults to this env var
});
```

### Run a model (simple)

```ts
const output = await replicate.run("stability-ai/stable-diffusion-3", {
  input: {
    prompt: "A serene mountain lake at sunset, photorealistic",
    aspect_ratio: "16:9",
    output_format: "webp",
  },
});

// output is typically an array of file URLs for image models
console.log(output); // ["https://replicate.delivery/..."]
```

### Run a language model

```ts
const output = await replicate.run("meta/meta-llama-3-70b-instruct", {
  input: {
    prompt: "Explain the difference between TCP and UDP in simple terms.",
    max_tokens: 512,
    temperature: 0.7,
  },
});

// For text models, output is an array of string chunks
const text = (output as string[]).join("");
console.log(text);
```

### Streaming text output

```ts
const stream = replicate.stream("meta/meta-llama-3-70b-instruct", {
  input: {
    prompt: "Write a short poem about the ocean.",
    max_tokens: 256,
  },
});

for await (const event of stream) {
  process.stdout.write(event.toString());
}
```

### Create a prediction (async with polling)

```ts
const prediction = await replicate.predictions.create({
  model: "stability-ai/stable-diffusion-3",
  input: {
    prompt: "A cyberpunk cityscape at night",
  },
});

console.log(prediction.id);     // "abc123..."
console.log(prediction.status); // "starting"

// Wait for completion
const completed = await replicate.wait(prediction);
console.log(completed.status); // "succeeded"
console.log(completed.output); // ["https://..."]
```

## Common Patterns

### Using specific model versions

```ts
// Pin to a specific version for reproducibility
const output = await replicate.run(
  "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
  {
    input: {
      prompt: "An astronaut riding a horse on Mars",
      width: 1024,
      height: 1024,
      num_inference_steps: 30,
    },
  }
);
```

### Webhooks for async processing

```ts
const prediction = await replicate.predictions.create({
  model: "stability-ai/stable-diffusion-3",
  input: {
    prompt: "A beautiful watercolor painting of flowers",
  },
  webhook: "https://your-app.com/api/replicate-webhook",
  webhook_events_filter: ["completed"], // only notify on completion
});

// Your webhook endpoint receives a POST with the prediction object
// including output URLs when the prediction completes
```

### File input (images for img2img, upscaling, etc.)

```ts
import fs from "fs";

// Option 1: File URL
const output = await replicate.run("nightmareai/real-esrgan", {
  input: {
    image: "https://example.com/photo.jpg",
    scale: 4,
  },
});

// Option 2: Local file as data URI
const imageBuffer = fs.readFileSync("input.png");
const mimeType = "image/png";
const dataURI = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

const output2 = await replicate.run("nightmareai/real-esrgan", {
  input: {
    image: dataURI,
    scale: 2,
  },
});

// Option 3: Use replicate.files.create for large files
const file = await replicate.files.create(
  fs.createReadStream("large-video.mp4"),
  { content_type: "video/mp4" }
);

const output3 = await replicate.run("some/video-model", {
  input: { video: file.urls.get },
});
```

### Deployments (dedicated infrastructure)

```ts
// Run on a dedicated deployment (faster cold starts, guaranteed capacity)
const prediction = await replicate.deployments.predictions.create(
  "your-org",        // owner
  "my-sdxl-deploy",  // deployment name
  {
    input: {
      prompt: "A professional product photo of sneakers",
    },
  }
);

const result = await replicate.wait(prediction);
console.log(result.output);
```

### List and cancel predictions

```ts
// List recent predictions
const predictions = await replicate.predictions.list();
predictions.results.forEach((p) => {
  console.log(`${p.id}: ${p.status} - ${p.model}`);
});

// Cancel a running prediction
await replicate.predictions.cancel(prediction.id);
```

## Configuration

```ts
const replicate = new Replicate({
  auth: "r8_...",                          // API token (default: REPLICATE_API_TOKEN env var)
  userAgent: "my-app/1.0",                // Custom user agent
  baseUrl: "https://api.replicate.com",    // Custom base URL
  fetch: customFetch,                      // Custom fetch implementation
});
```

### Common model input parameters

Different models accept different inputs, but these are common across many:

| Parameter | Models | Description |
|---|---|---|
| `prompt` | All generative models | Text prompt describing desired output |
| `negative_prompt` | Image models | What to avoid in the output |
| `width`, `height` | Image models | Output dimensions |
| `num_inference_steps` | Diffusion models | Quality vs speed tradeoff (20-50) |
| `guidance_scale` | Diffusion models | Prompt adherence (7-15 typical) |
| `temperature` | LLMs | Randomness (0.0-2.0) |
| `max_tokens` | LLMs | Maximum output length |
| `seed` | Most models | Reproducible outputs |

## Tips & Gotchas

- **Cold starts**: Models that are not running take 5-30+ seconds to boot up. Use deployments for consistent low-latency responses in production.
- **`replicate.run` blocks until complete**: It polls the prediction until it finishes. For long-running models, use `predictions.create` + webhooks instead.
- **Output format varies by model**: Image models return URL arrays, LLMs return string arrays, audio models return single URLs. Always check the model's API docs on replicate.com.
- **Streaming is only for text models**: The `replicate.stream()` method works with language models that support server-sent events. Image and audio models do not support streaming.
- **Model identifiers**: Use `owner/name` for the latest version or `owner/name:version_hash` to pin a specific version. Pinning versions ensures reproducibility.
- **File URLs are temporary**: Output URLs from Replicate expire after a short time. Download and store them in your own storage (S3, R2, etc.) if you need them long-term.
- **Prediction costs**: You pay per second of compute time. Check the model's page on replicate.com for pricing. Cancel long-running predictions with `predictions.cancel()` to avoid unnecessary charges.
- **Error handling**: Failed predictions have `status: "failed"` and include an `error` field. The `replicate.run()` method throws an error on failure.
  ```ts
  try {
    const output = await replicate.run("owner/model", { input: { ... } });
  } catch (err) {
    console.error("Prediction failed:", err.message);
  }
  ```
- **Rate limits**: The API has rate limits that vary by plan. The SDK does not auto-retry on 429 errors, so implement retry logic for production use.
- **Official models vs community**: Models by organizations like `meta`, `stability-ai`, and `black-forest-labs` are official. Community models may vary in quality and availability.
