"use server";

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";


// Anthropic API Call
const anthropic = new Anthropic({
  // defaults to process.env["ANTHROPIC_API_KEY"]
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function anthropicCall(
  prompt: string,
  model: string = 'claude-3-5-haiku-latest',
  systemPrompt: string = 'You are a helpful assistant',
  maxTokens?: number,
  temperature?: number,
) {
  const hiddenSystemPrompt = `You are a component in an agentric system. Do not make references to yourself or your capabilities unless specifically asked. Focus solely on executing the instructions provided in the user's system prompt. Here is your assigned role and instructions: ${systemPrompt}`;

  // Set max tokens based on model
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
  maxTokens?: number,
  temperature?: number,
) {
    console.log('Sending prompt to OpenAI:', prompt);
    const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{role: "user", content: prompt}],
    temperature: temperature ?? 0.4,
    max_tokens: maxTokens ?? 8192,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: { "type": "text" },
    });
    return response.choices[0].message.content;
}