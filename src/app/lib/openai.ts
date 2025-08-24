import OpenAI from "openai";

// Centralized OpenAI client instance
// Used across all API routes for Assistants API (threads, messages, runs)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // API key from environment variables
});
