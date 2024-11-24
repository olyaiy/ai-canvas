"use server";

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Anthropic API Call
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function anthropicCall(
  prompt: string,
  model: string = 'claude-3-5-haiku-latest',
  systemPrompt: string = 'You are a helpful assistant',
  maxTokens?: number,
  temperature?: number,
) {

  console.log('anthropicCall PROMPT IS', prompt,);
  const hiddenSystemPrompt = `You are a component in an agentric system. Do not make references to yourself or your capabilities unless specifically asked. Focus solely on executing the instructions provided in the user's system prompt. Do not ask for clarification or more information. Here is your assigned role and instructions: ${systemPrompt}`;

  const defaultMaxTokens = model.includes('opus') ? 4096 : 8192;
  const finalMaxTokens = maxTokens ?? defaultMaxTokens;

  const stream = await anthropic.messages.stream({
    model,
    max_tokens: finalMaxTokens,
    temperature: temperature ?? 0.4,
    system: hiddenSystemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  return stream;
}

// OpenAI API Call
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function openaiCall(
  prompt: string,
  model: string,
  systemPrompt: string = 'You are a helpful assistant',
  maxTokens?: number,
  temperature?: number,
) {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: temperature ?? 0.4,
    max_tokens: maxTokens ?? getDefaultMaxTokens(model),
    stream: true,
  });
  return response;
}

function getDefaultMaxTokens(model: string): number {
  if (model.startsWith('o1')) return 65536;
  if (model.includes('4o')) return 16384;
  return 4096;
}