---
name: ai
description: >
  Vercel AI SDK for building AI-powered applications with a unified API across providers. Use when: building AI chat UIs in React/Next.js/Svelte, streaming text/objects, calling tools, switching between LLM providers. NOT for: direct low-level API calls to a single provider, non-JS environments.
---

# ai

## Overview

The Vercel AI SDK (`ai`) provides a unified, provider-agnostic interface for working with large language models. It includes AI SDK Core for server-side text/object generation, AI SDK UI for React/Next.js/Svelte chat hooks, and a provider registry system that lets you swap between OpenAI, Anthropic, Google, Mistral, and other providers with minimal code changes. The SDK handles streaming, structured outputs, and tool calling across all supported providers.

## Installation

```bash
# Core SDK
npm install ai

# Provider packages (install the ones you need)
npm install @ai-sdk/openai
npm install @ai-sdk/anthropic
npm install @ai-sdk/google
```

## Core API / Commands

### generateText (non-streaming)

```ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const { text, usage, finishReason } = await generateText({
  model: openai("gpt-4o"),
  prompt: "Explain the difference between let and const in JavaScript.",
});

console.log(text);
console.log(`Tokens: ${usage.totalTokens}`);
```

### streamText (streaming)

```ts
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const result = streamText({
  model: anthropic("claude-sonnet-4-20250514"),
  prompt: "Write a poem about TypeScript.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

// Access final usage after stream completes
const finalUsage = await result.usage;
```

### generateObject (structured output)

```ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const { object } = await generateObject({
  model: openai("gpt-4o"),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({
        name: z.string(),
        amount: z.string(),
      })),
      steps: z.array(z.string()),
    }),
  }),
  prompt: "Generate a recipe for chocolate chip cookies.",
});

console.log(object.recipe.name);
console.log(object.recipe.ingredients);
```

### streamObject

```ts
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const result = streamObject({
  model: openai("gpt-4o"),
  schema: z.object({
    characters: z.array(z.object({
      name: z.string(),
      class: z.string(),
      description: z.string(),
    })),
  }),
  prompt: "Create 3 RPG characters.",
});

for await (const partialObject of result.partialObjectStream) {
  console.clear();
  console.log(partialObject);
}
```

## Common Patterns

### Tool calling

```ts
import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const result = await generateText({
  model: openai("gpt-4o"),
  tools: {
    weather: tool({
      description: "Get the weather for a location",
      parameters: z.object({
        location: z.string().describe("City name"),
      }),
      execute: async ({ location }) => {
        // Your actual weather API call here
        return { temperature: 22, condition: "sunny", location };
      },
    }),
    calculator: tool({
      description: "Perform arithmetic calculations",
      parameters: z.object({
        expression: z.string().describe("Math expression to evaluate"),
      }),
      execute: async ({ expression }) => {
        return { result: eval(expression) };
      },
    }),
  },
  maxSteps: 5, // allow multi-step tool use
  prompt: "What's the weather in Paris and what's 42 * 17?",
});

console.log(result.text);
console.log(result.steps); // inspect each step's tool calls and results
```

### React chat UI with useChat

```tsx
// app/api/chat/route.ts (Next.js App Router)
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}

// app/page.tsx (React component)
"use client";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} placeholder="Say something..." />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

### Provider registry (swap providers easily)

```ts
import { generateText } from "ai";
import { createProviderRegistry } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

const registry = createProviderRegistry({
  openai,
  anthropic,
  google,
});

// Now use any provider with a string identifier
const { text } = await generateText({
  model: registry.languageModel("openai:gpt-4o"),
  prompt: "Hello!",
});

// Easy to switch providers
const { text: text2 } = await generateText({
  model: registry.languageModel("anthropic:claude-sonnet-4-20250514"),
  prompt: "Hello!",
});
```

## Configuration

### Provider-level configuration

```ts
import { createOpenAI } from "@ai-sdk/openai";

const customOpenAI = createOpenAI({
  apiKey: process.env.CUSTOM_API_KEY,
  baseURL: "https://my-proxy.example.com/v1",
  compatibility: "strict", // or "compatible" for OpenAI-compatible APIs
});

const model = customOpenAI("gpt-4o");
```

### Common model settings

```ts
const result = await generateText({
  model: openai("gpt-4o"),
  prompt: "...",
  temperature: 0.7,        // 0-2, controls randomness
  maxTokens: 1000,          // max output tokens
  topP: 0.9,                // nucleus sampling
  presencePenalty: 0.5,     // penalize repeated topics
  frequencyPenalty: 0.5,    // penalize repeated tokens
  seed: 42,                 // for reproducible outputs (when supported)
  abortSignal: controller.signal, // for cancellation
});
```

## Tips & Gotchas

- **Import paths changed in v4**: `useChat` moved from `"ai/react"` to `"@ai-sdk/react"`. Make sure you install `@ai-sdk/react` for React hooks and `@ai-sdk/svelte` for Svelte.
- **`maxSteps` for agentic tool use**: Without `maxSteps`, the model makes one tool call and stops. Set `maxSteps: 5` (or higher) to let it chain multiple tool calls and generate a final text response.
- **Schema validation with Zod**: `generateObject` and `streamObject` require a Zod schema. The SDK validates the LLM output against it and will retry on validation failure.
- **Streaming returns a result object, not a promise**: `streamText()` and `streamObject()` return immediately with a result object. Use `result.textStream` for async iteration, or `await result.text` for the final text.
- **`toDataStreamResponse()` for Next.js**: The SDK provides `.toDataStreamResponse()` to create a proper streaming Response object for API routes. This works with `useChat` on the client.
- **Provider packages are separate**: You must install provider packages individually (`@ai-sdk/openai`, `@ai-sdk/anthropic`, etc.). The core `ai` package does not include any providers.
- **Error handling**: Wrap calls in try/catch. The SDK throws `AISDKError` subclasses like `RetryError`, `NoSuchToolError`, and provider-specific errors.
- **Token usage**: Access `usage.promptTokens`, `usage.completionTokens`, and `usage.totalTokens` from the result. For streams, await `result.usage` after the stream completes.
- **Middleware support**: Use `wrapLanguageModel` to add logging, caching, guardrails, or rate limiting around any model call without changing your application code.
