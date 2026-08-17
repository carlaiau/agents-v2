import {readFile, listFiles, deleteFile,writeFile} from "./file.ts"
// All tools combined for the agent
export const tools = {
  writeFile,
  readFile,
  listFiles,
  deleteFile

};

export const fileTools = {
  readFile, writeFile, listFiles, deleteFile
}