/**
 * Example of using the browser-use Agent with OpenAI to execute a shopping task
 */
import {
  Agent,
  Browser,
  BrowserContext,
  BrowserContextConfig,
  BrowserConfig,
} from "../src"; // browser-use-ts
// Import LangChain components
import { ChatOpenAI } from "@langchain/openai";
// For loading environment variables, matching Python's dotenv
import * as dotenv from "dotenv";
import { AgentHistoryList } from "../src/agent/views"; // Import AgentHistoryList correctly

// Load environment variables from .env file - exact match with Python
dotenv.config();

// Shopping task example
const task = `
### Prompt for Shopping Agent – Amazon Search

**Objective:**  
Visit Amazon.com, search for a laptop under $1000, and find the best option based on reviews and specifications.

**Steps:**

1. Navigate to Amazon.com
2. Search for "laptop under $1000"
3. Browse through the top 3 results
4. For each result:
   - Check the price, could be number starting with a currency symbol, might not have keyword "price"
   - Look at the average rating and number of reviews
   - Review the key specifications (processor, RAM, storage)
5. Identify the best option based on:
   - Price-to-performance ratio
   - Customer reviews
   - Specifications for general use
6. Summarize your findings, including:
   - The best laptop you found
   - Key specifications
   - Price
   - Why you selected it over others
`;

// Create Browser instance first
const browserInstance = new Browser(new BrowserConfig({ headless: false }));

// Configure BrowserContext
const browserContextConfig = new BrowserContextConfig({
  // Set a user agent to mimic a real browser, which might help avoid bot detection
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  // Increase viewport size for potentially complex pages
  viewport: { width: 1920, height: 1080 },
});
// Pass the created Browser instance to BrowserContext
const browserContext = new BrowserContext(
  browserInstance,
  browserContextConfig
);

// Create the agent with vision turned off
const agent = new Agent(
  task,
  new ChatOpenAI({
    openAIApiKey: process.env["OPENAI_API_KEY"] || "",
    modelName: "gpt-4-turbo",
    temperature: 0.1,
    maxTokens: 1500, // Increased tokens for potentially longer pages
  }),
  // All other positional arguments moved to options
  {
    // Pass the pre-configured browserContext via options
    browserContext: browserContext,
    // Other options can be added here if needed, e.g.:
    // useVision: true,
    // maxFailures: 5
  } // Options object
);

// Main function to run the agent
async function main() {
  try {
    // Run the agent
    const history: AgentHistoryList = await agent.run(15); // Increased max steps for shopping task

    // Print the final result from the last history item
    console.log("\nFinal Result:");
    if (history && history.history.length > 0) {
      const lastStep = history.history[history.history.length - 1];
      // The result is an array of ActionResult, check the last one for done status/content
      if (lastStep && lastStep.result && lastStep.result.length > 0) {
        const lastActionResult = lastStep.result[lastStep.result.length - 1];
        console.log(JSON.stringify(lastActionResult, null, 2));
      } else {
        console.log("Last step result not found.");
      }
    } else {
      console.log("No history found.");
    }
  } catch (error) {
    console.error("Error during agent execution:", error);
  } finally {
    // Close the browser context (which should close the underlying browser instance)
    await browserContext.close();
  }
}

// Run the example
main().catch(console.error);
