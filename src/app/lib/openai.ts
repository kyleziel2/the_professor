import OpenAI from "openai";

// Centralized OpenAI client instance
// Used across all API routes for the Responses API
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Model configuration — change this in one place
export const MODEL = process.env.OPENAI_MODEL || "gpt-4.1";
