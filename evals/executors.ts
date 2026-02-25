import { generateText, stepCountIs, tool, type ToolSet } from "ai";
import {openai} from "@ai-sdk/openai"
import {z} from "zod"

import type {
  EvalData,
  SingleTurnResult,
  MultiTurnEvalData,
  MultiTurnResult,
} from "./types.ts";
import { buildMessages } from "./utils.ts";

const TOOL_DEFS: any = {
  readFile: {
    description: "Read the contents of a file at the specified path",
    parameters: z.object({
      path: z.string().describe('the path to the file')
    })
  },
  writeFile: {
    description: "Write contents to the file at the specified path",
    parameters: z.object({
      path: z.string().describe('the path to the file'),
      content: z.string().describe("The content you want to write")
    })
  },
  listFiles: {
    description: "List the contents of a directory at the specified path",
    parameters: z.object({
      path: z.string().describe('the path to the directory where the files are')
    })
  },
  deleteFile: {
    description: "Delete a file at the specified path",
    parameters: z.object({
      path: z.string().describe('the path to the file that you want to delete')
    })
  },
  runCommand: {
    description: "Execute a shell command and return its output",
    parameters: z.object({
      command: z.string().describe('the shell command to execute')
    })
  }
}

export const singleTurnExecutorWithMocks = async (data: EvalData) => {
  const messages = buildMessages(data)

  const tools: ToolSet = {}

  for (const toolName of data.tools){
    const def = TOOL_DEFS[toolName as any]
    tools[toolName] = {
      description: def.description,
      inputSchema: def.parameters
    }
  }

  const { text, toolCalls } = await generateText({
    model: openai("gpt-5-mini"),
    messages,
    tools,
    stopWhen: stepCountIs(1),
    temperature: data.config?.temperature ?? undefined
  });

  const calls = toolCalls.map(call => ({
    toolName: call.toolName,
    args: 'args'in call ? call.args : undefined,
    input: call.input
  }))

  const toolNames = calls.map(call => call.toolName)

  return {
    toolCalls: calls,
    toolNames,
    selectedAny: toolNames.length > 0
  } as SingleTurnResult
}