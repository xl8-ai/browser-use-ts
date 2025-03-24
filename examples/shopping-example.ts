/**
 * Example of using the browser-use Agent with OpenAI to execute a shopping task
 */
import { Agent, Browser, BrowserConfig } from '../src';
// Import LangChain components
import { ChatOpenAI } from '@langchain/openai';
// For loading environment variables, matching Python's dotenv
import * as dotenv from 'dotenv';

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

// Create a browser instance with non-headless mode to see what's happening
const browser = new Browser(new BrowserConfig({
  headless: false,
  disableSecurity: true,
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-site-isolation-trials'
  ]
}));

// Create the agent with vision turned off
const agent = new Agent(
  task,
  new ChatOpenAI({
    openAIApiKey: process.env['OPENAI_API_KEY'] || '',
    modelName: 'gpt-4o',
    temperature: 0.0,
  }),
  browser,
  undefined,   // browserContext
  undefined,   // controller
  undefined,   // sensitiveData
  undefined,   // initialActions
  undefined,   // registerNewStepCallback
  undefined,   // registerDoneCallback
  undefined,   // registerExternalAgentStatusRaiseErrorCallback
  true        // useVision - set to false to disable screenshots
);

// Main function to run the agent
async function main() {
  try {
    await agent.run();
    
    // Add the "press enter to exit" functionality to match Python implementation
    // In Python: input("Press Enter to close the browser...")
    console.log('Press Enter to close the browser...');
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  } finally {
    // Make sure to close the browser
    await browser.close();
  }
}

// Run the example
main().catch(console.error);
