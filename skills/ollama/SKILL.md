---
name: ollama
description: >
  JavaScript client library for Ollama, enabling interaction with locally-running LLMs. Use when: running models locally, building offline AI apps, prototyping without API costs, using open-source models like Llama, Mistral, CodeLlama. NOT for: cloud-hosted LLM APIs, production at scale without self-hosting.
---

# ollama

## Overview

The `ollama` package is the official JavaScript/TypeScript client for the Ollama runtime, which runs large language models locally on your machine. It provides methods for chat, text generation, embeddings, and model management. Ollama supports models like Llama 3, Mistral, CodeLlama, Phi, Gemma, and many others -- all running entirely on your hardware with no API keys or cloud dependencies.

## Installation

```bash
# First, install Ollama itself (the server/runtime)
# macOS: brew install ollama
# Or download from https://ollama.com

# Pull a model
ollama pull llama3.2

# Install the JS client
npm install ollama
yarn add ollama
pnpm add ollama
```

## Core API / Commands

### Basic chat completion

```ts
import ollama from "ollama";

const response = await ollama.chat({
  model: "llama3.2",
  messages: [
    { role: "user", content: "Why is the sky blue?" },
  ],
});

console.log(response.message.content);
```

### Streaming chat

```ts
const response = await ollama.chat({
  model: "llama3.2",
  messages: [{ role: "user", content: "Write a haiku about programming." }],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.message.content);
}
```

### Text generation (non-chat)

```ts
const response = await ollama.generate({
  model: "llama3.2",
  prompt: "Once upon a time in a land far away,",
  options: {
    temperature: 0.9,
    num_predict: 200,
  },
});

console.log(response.response);
```

### Streaming generation

```ts
const response = await ollama.generate({
  model: "llama3.2",
  prompt: "Explain quantum entanglement:",
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.response);
}
```

### Embeddings

```ts
const response = await ollama.embed({
  model: "llama3.2",
  input: "The quick brown fox jumps over the lazy dog",
});

console.log(response.embeddings[0]); // float array
console.log(response.embeddings[0].length); // dimension count depends on model

// Batch embeddings
const batchResponse = await ollama.embed({
  model: "llama3.2",
  input: [
    "First document to embed",
    "Second document to embed",
    "Third document to embed",
  ],
});
```

## Common Patterns

### Multi-turn conversation

```ts
import ollama, { type Message } from "ollama";

const messages: Message[] = [];

async function chat(userMessage: string): Promise<string> {
  messages.push({ role: "user", content: userMessage });

  const response = await ollama.chat({
    model: "llama3.2",
    messages,
  });

  messages.push(response.message);
  return response.message.content;
}

await chat("My name is Alice.");
const reply = await chat("What's my name?");
console.log(reply); // Will reference Alice
```

### Model management

```ts
// List available models
const models = await ollama.list();
models.models.forEach((m) => {
  console.log(`${m.name} - ${m.size} bytes - modified ${m.modified_at}`);
});

// Pull a model
await ollama.pull({ model: "mistral" });

// Pull with progress
const pullStream = await ollama.pull({ model: "codellama", stream: true });
for await (const progress of pullStream) {
  console.log(`${progress.status}: ${progress.completed}/${progress.total}`);
}

// Show model details
const info = await ollama.show({ model: "llama3.2" });
console.log(info.details);
console.log(info.modelfile);

// Copy a model
await ollama.copy({ source: "llama3.2", destination: "my-llama" });

// Delete a model
await ollama.delete({ model: "my-llama" });
```

### Custom model with system prompt (Modelfile)

```ts
// Create a custom model from a Modelfile
const modelfile = `
FROM llama3.2
SYSTEM "You are a helpful coding assistant specialized in TypeScript. Always provide typed code examples."
PARAMETER temperature 0.3
PARAMETER num_predict 1024
`;

await ollama.create({
  model: "ts-helper",
  modelfile,
  stream: true,
});

// Now use your custom model
const response = await ollama.chat({
  model: "ts-helper",
  messages: [{ role: "user", content: "How do I use generics?" }],
});
```

### Vision / multimodal

```ts
import fs from "fs";

const imageData = fs.readFileSync("photo.jpg").toString("base64");

const response = await ollama.chat({
  model: "llava", // or any vision-capable model
  messages: [
    {
      role: "user",
      content: "What do you see in this image?",
      images: [imageData],
    },
  ],
});

console.log(response.message.content);
```

## Configuration

### Custom host connection

```ts
import { Ollama } from "ollama";

// Connect to a remote Ollama instance
const ollama = new Ollama({
  host: "http://192.168.1.100:11434", // default is http://localhost:11434
});

const response = await ollama.chat({
  model: "llama3.2",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Generation options

```ts
const response = await ollama.chat({
  model: "llama3.2",
  messages: [{ role: "user", content: "Explain recursion." }],
  options: {
    temperature: 0.7,      // randomness (0.0-2.0, default 0.8)
    top_p: 0.9,            // nucleus sampling
    top_k: 40,             // top-K sampling
    num_predict: 512,      // max tokens to generate
    repeat_penalty: 1.1,   // penalize repetition
    seed: 42,              // reproducible output
    num_ctx: 4096,         // context window size
    stop: ["\n\n"],        // stop sequences
  },
  keep_alive: "5m",        // keep model loaded in memory
});
```

## Tips & Gotchas

- **Ollama server must be running**: The JS client connects to the Ollama HTTP server (default `localhost:11434`). Make sure `ollama serve` is running before using the client.
- **First request is slow**: When a model is not loaded in memory, the first request triggers model loading, which can take 5-30 seconds depending on model size and hardware. Subsequent requests are fast.
- **`keep_alive` controls model unloading**: By default, models stay in memory for 5 minutes after the last request. Set `keep_alive: "30m"` to keep it longer, or `keep_alive: 0` to unload immediately.
- **VRAM requirements**: Models need significant GPU memory. Llama 3.2 (3B) needs ~2GB VRAM, Llama 3.1 (8B) needs ~5GB, 70B models need ~40GB. Ollama automatically offloads layers to CPU if VRAM is insufficient.
- **Default import vs named import**: Use `import ollama from "ollama"` for the default singleton client (connects to localhost). Use `import { Ollama } from "ollama"` to create custom instances with different hosts.
- **Browser usage**: Use `import ollama from "ollama/browser"` for browser environments. Note that this requires CORS to be configured on the Ollama server.
- **Streaming returns an async iterable**: When `stream: true`, the response is an `AsyncGenerator`, not a `Promise<Response>`. Use `for await...of` to consume it.
- **Model names include tags**: Use `llama3.2` (defaults to `latest` tag) or specify a version like `llama3.2:7b-instruct-q4_0` for specific quantizations.
- **No API key needed**: Ollama runs entirely locally. There are no API keys, rate limits, or usage costs. Your data never leaves your machine.
- **Embeddings use `embed` not `embeddings`**: The method is `ollama.embed()`, which accepts either a single string or an array of strings via the `input` field.
