import { Agent, Browser, BrowserConfig } from "../src";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";

dotenv.config();

// Simple task to find the founders of browser-use
const task =
  "Navigate to the browser-use GitHub repository at https://github.com/browser-use/browser-use and find information about the project and its contributors";

// Create a browser instance with non-headless mode to see what's happening
const browser = new Browser(
  new BrowserConfig({
    headless: false,
    disableSecurity: true,
  })
);

// Create the agent with direct OpenAI implementation
const agent = new Agent(
  task,
  new ChatOpenAI({
    openAIApiKey: process.env["OPENAI_API_KEY"] || "",
    modelName: "gpt-4o",
    temperature: 0.0,
  }),
  {
    browser: browser,
  }
);

// Main function to run the agent
async function main() {
  // Run the agent
  await agent.run();
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
