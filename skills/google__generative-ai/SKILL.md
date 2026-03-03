---
name: "@google/generative-ai"
description: >
  Official Google Generative AI SDK for Gemini models in JavaScript/TypeScript. Use when: building apps with Google Gemini, generating text, multi-turn chat, vision/multimodal input, embeddings, function calling. NOT for: Vertex AI (use @google-cloud/vertexai), non-Google models.
---

# @google/generative-ai

## Overview

The `@google/generative-ai` package is Google's official SDK for accessing Gemini models from JavaScript and TypeScript applications. It supports text generation, multi-turn chat, multimodal inputs (images, video, audio), embeddings, function calling, and streaming. The SDK uses API keys for authentication and is designed for client-side or server-side use.

## Installation

```bash
npm install @google/generative-ai
yarn add @google/generative-ai
pnpm add @google/generative-ai
```

## Core API / Commands

### Client initialization

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
```

### Basic text generation

```ts
const result = await model.generateContent("Explain how solar panels work.");
const text = result.response.text();
console.log(text);
```

### Streaming

```ts
const result = await model.generateContentStream("Write a short story about a cat.");

for await (const chunk of result.stream) {
  const text = chunk.text();
  process.stdout.write(text);
}

// Get the full aggregated response
const aggregated = await result.response;
console.log("\n\nFull text:", aggregated.text());
```

### Multi-turn chat

```ts
const chat = model.startChat({
  history: [
    { role: "user", parts: [{ text: "Hi, I'm learning TypeScript." }] },
    { role: "model", parts: [{ text: "Great! TypeScript is a typed superset of JavaScript. What would you like to know?" }] },
  ],
});

const result = await chat.sendMessage("How do interfaces work?");
console.log(result.response.text());

// Continue the conversation
const result2 = await chat.sendMessage("Can you show me an example?");
console.log(result2.response.text());
```

### Embeddings

```ts
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

const result = await embeddingModel.embedContent("The quick brown fox jumps over the lazy dog.");
console.log(result.embedding.values); // float array
console.log(result.embedding.values.length); // dimension count

// Batch embeddings
const batchResult = await embeddingModel.batchEmbedContents({
  requests: [
    { content: { role: "user", parts: [{ text: "First document" }] } },
    { content: { role: "user", parts: [{ text: "Second document" }] } },
  ],
});
console.log(batchResult.embeddings.length); // 2
```

## Common Patterns

### Multimodal input (images)

```ts
import fs from "fs";

const imagePart = {
  inlineData: {
    mimeType: "image/jpeg",
    data: fs.readFileSync("photo.jpg").toString("base64"),
  },
};

const result = await model.generateContent([
  "Describe what you see in this image in detail.",
  imagePart,
]);

console.log(result.response.text());
```

### Function calling

```ts
import { FunctionDeclarationSchemaType } from "@google/generative-ai";

const tools = [
  {
    functionDeclarations: [
      {
        name: "getWeather",
        description: "Get current weather for a location",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            location: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "City name, e.g. 'London'",
            },
          },
          required: ["location"],
        },
      },
    ],
  },
];

const modelWithTools = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools,
});

const chat = modelWithTools.startChat();
const result = await chat.sendMessage("What's the weather in Tokyo?");

const functionCall = result.response.functionCalls()?.[0];
if (functionCall) {
  // Execute the function
  const weatherData = await fetchWeather(functionCall.args.location);

  // Send the function response back
  const result2 = await chat.sendMessage([
    {
      functionResponse: {
        name: functionCall.name,
        response: weatherData,
      },
    },
  ]);

  console.log(result2.response.text());
}
```

### System instructions and generation config

```ts
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "You are a helpful coding assistant. Always provide TypeScript examples.",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
    responseMimeType: "application/json", // force JSON output
    stopSequences: ["END"],
  },
});
```

## Configuration

### Safety settings

```ts
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});
```

### Model parameters reference

| Parameter | Description |
|---|---|
| `temperature` | Controls randomness (0.0-2.0). Default varies by model. |
| `topP` | Nucleus sampling (0.0-1.0). |
| `topK` | Top-K sampling. Lower = more focused. |
| `maxOutputTokens` | Maximum number of tokens to generate. |
| `responseMimeType` | Force output format: `"text/plain"` or `"application/json"`. |
| `stopSequences` | Array of strings that stop generation. Max 5. |

## Tips & Gotchas

- **API key, not service account**: This SDK uses API keys (`GOOGLE_API_KEY`), not service account credentials. For Vertex AI with service accounts, use `@google-cloud/vertexai` instead.
- **Parts-based content structure**: Content is structured as `{ role, parts: [{ text }, { inlineData }, ...] }`. Even plain text must be wrapped in `parts` when building history manually.
- **`text()` can throw**: `response.text()` throws if the response was blocked by safety filters. Always check `response.promptFeedback` if you suspect content might be filtered.
- **Function calling uses `functionCalls()`**: Check `response.functionCalls()` (returns array or null) rather than inspecting raw candidates. Function arguments are already parsed objects, not JSON strings.
- **Streaming chunks are partial**: Each chunk in `generateContentStream` contains only the new text delta. Use `await result.response` after the stream to get the full aggregated response.
- **Chat history is managed automatically**: When using `startChat()`, the SDK manages conversation history internally. You do not need to resend previous messages.
- **`responseMimeType: "application/json"`**: This forces the model to output valid JSON. Combine with a schema in the prompt for structured outputs without needing a separate validation library.
- **Token counting**: Use `model.countTokens("your text")` to count tokens before sending a request. This helps avoid exceeding context limits and estimate costs.
  ```ts
  const { totalTokens } = await model.countTokens("Hello, world!");
  console.log(`Token count: ${totalTokens}`);
  ```
- **Rate limits**: The free tier has generous but limited quotas. For production, use the paid tier. The SDK does not auto-retry on 429 errors, so implement your own retry logic.
- **Model names**: Use `gemini-2.0-flash` for fast, cost-effective generation. Use `gemini-2.5-pro` for the most capable model. The `-latest` suffix aliases the newest stable version.
