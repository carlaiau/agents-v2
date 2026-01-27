import { tools } from "./tools/index";
export type Toolname = keyof typeof tools;
export const executeTool = async (name: string, args: any) => {
  const tool = tools[name as Toolname];
  if (!tool) {
    return "Uknown tool, this is not exist.";
  }

  const execute = tool.execute;

  if (!execute) {
    return "This tool is not executable.";
  }

  const result = await execute(args, {
    toolCallId: "",
    messages: [],
  });

  return String(result);
};
