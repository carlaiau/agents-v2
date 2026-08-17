import {tool} from 'ai'
import {z} from "zod"
import fs from "node:fs/promises"
import nodePath from "node:path"


export const readFile = tool({
    description: "Read the full contents of a file at the given path, always use this to read a file",
    inputSchema: z.object({
        path: z.string().describe("The relative path to the file to read"),
    }),
    execute: async ({path}) => {
        try {
            const content = await fs.readFile(path, "utf-8")
            return content;
        } catch(e){
          return `There was an error reading the file, here is the native error from node.js: ${e}`  
        }
    }
})

export const writeFile = tool({
    description: "Write content to a file at a specified given path. Creates the file if it does not exist, and will overwrite it if it does",
    inputSchema: z.object({
        path: z.string().describe("The relative path to write contents to"),
        content: z.string().describe("The content to write to the file") 
    }),

    execute: async ({path, content}) => {
        try {
            if (nodePath.isAbsolute(path)) {
                throw new Error("Absolute paths are not allowed");
            }

            const workspaceRoot = process.cwd();
            const resolvedPath = nodePath.resolve(workspaceRoot, path);
            const relativePath = nodePath.relative(workspaceRoot, resolvedPath);

            // Prevent ../ traversal outside the workspace
            if (
                relativePath === ".." ||
                relativePath.startsWith(`..${nodePath.sep}`) ||
                nodePath.isAbsolute(relativePath)
            ) {
                throw new Error("Path escapes the workspace");
            }

            const dir = nodePath.dirname(resolvedPath);

            // Only creates directories after we've verified they're
            // inside the workspace.
            await fs.mkdir(dir, { recursive: true });

            // "wx" means create exclusively — fail if the file exists.
            await fs.writeFile(resolvedPath, content, {
                encoding: "utf-8",
                flag: "wx",
            });

            return `Successfully wrote ${content.length} characters to ${path}. You should verify by listing files`;
        }
        catch(e){
            return `There was an error writing the content, here is the native error from node.js: ${e}`
        }
    }
});

export const listFiles = tool({
    description: "List all the files and directories in the specified direction path",
    inputSchema: z.object({
        directory: z.string().describe("The directory path to list the contents of").default("."),

    }),
    execute: async ({directory}) => {
        try{
            if (nodePath.isAbsolute(directory)) {
                throw new Error("Absolute paths are not allowed");
            }
            const entries = await fs.readdir(directory, {withFileTypes:true})
            const items = entries.map(e => {
                const type = e.isDirectory() ? "[dir]": "[file]";
                return `${type} ${e.name}`
            });

            return items.length > 0 ? items.join('\n'): `Directory ${directory} is empty`
        }
        catch(e){
            return `Could not list the content in this directroy, here is the node.js error: ${e}`
        }
    }
})

export const deleteFile = tool({
    description: "Delete a file at a given path. Use with caution at this is irreversible",
    inputSchema: z.object({
        path: z.string().describe("The path to the file you want to delete")
    }),
    execute: async ({path}) => {
        try{
            if (nodePath.isAbsolute(path)) {
                throw new Error("Absolute paths are not allowed");
            }
            await fs.unlink(path);
            return `Successfully deleted the file at ${path}`
        } catch(e){
            return `Could not delete the file, here is the node.js error: ${e}`
        }
    }
})