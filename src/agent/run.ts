import "dotenv/config";
import { generateText, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "./tools";
import { executeTool } from "./exectueTools";
import { SYSTEM_PROMPT } from "./system/prompt";
import type { AgentCallbacks } from "../types";

const MODEL_NAME = "gpt-5-mini";

export const runAgent = async (
  userMessage: string,
  conversationHistory: ModelMessage[],
  callbacks: AgentCallbacks,
) => {
  const { text, toolCalls } = await generateText({
    model: openai(MODEL_NAME),
    prompt: userMessage,
    system: SYSTEM_PROMPT,
    tools: tools,
  });

  console.log(text, toolCalls);
};

runAgent("What is the time?", []);
