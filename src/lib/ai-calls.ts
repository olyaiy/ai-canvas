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
  systemPrompt: string = 'You are a helpful assistant'
) {
    console.log('Sending prompt to Anthropic:', prompt);
    const msg = await anthropic.messages.create({
        model: model,
        max_tokens: 8192,
        temperature: 0.4,
        system: systemPrompt,
        messages: [
            { role: "user", content: prompt }
        ],
    });
    return msg.content[0].type === "text" ? msg.content[0].text : "";
}


// OpenAI API Call
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function openaiCall(prompt: string) {
    console.log('Sending prompt to OpenAI:', prompt);
    const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{role: "user", content: prompt}],
    temperature: 1,
    max_tokens: 8192,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
        "type": "text"
    },
    });
return response.choices[0].message.content;
}