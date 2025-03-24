/**
 * Example of using the browser-use Agent with TypeScript
 * Based on the Python implementation at https://github.com/browser-use/browser-use/blob/main/examples/use-cases/captcha.py
 */
import { Agent, Browser, BrowserConfig } from '../src';
// Import LangChain components
import { ChatOpenAI } from '@langchain/openai';
// For loading environment variables, matching Python's dotenv
import * as dotenv from 'dotenv';

// Load environment variables from .env file - exact match with Python
dotenv.config();

// CAPTCHA solving task without relying on vision API

// CAPTCHA solving task without relying on vision API
const task = `
search vadavision and open it and then explore the website and summarise the findings and output
`;

// Browser instance is now created above with optimized settings

// Create a browser instance with non-headless mode
// Note: Screenshot settings are handled at the browser context level in the Python implementation
const browserConfig = new BrowserConfig({
  headless: false,
  disableSecurity: true,
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-site-isolation-trials'
  ]
});

const browser = new Browser(browserConfig);

// Create the agent with LangChain's native ChatOpenAI model - match Python exactly
const agent = new Agent(
  task,
  new ChatOpenAI({
    openAIApiKey: process.env['OPENAI_API_KEY'] || '', // Provide empty string as fallback
    modelName: 'gpt-4o',
    temperature: 0.0, // Match exactly 0.0 as in Python
  }),
  browser,            // Browser with optimized screenshot settings
  undefined,          // browserContext
  undefined,          // controller
  undefined,          // sensitiveData
  undefined,          // initialActions
  undefined,          // registerNewStepCallback
  undefined,          // registerDoneCallback
  undefined,          // registerExternalAgentStatusRaiseErrorCallback
  true,              // useVision - DISABLED to avoid context limit errors
  true,              // useVisionForPlanner
  undefined,          // saveConversationPath
  undefined,          // saveConversationPathEncoding
  undefined,          // maxFailures
  undefined,          // retryDelay
  undefined,          // overrideSystemMessage
  undefined,          // extendSystemMessage
  undefined,          // maxInputTokens
  undefined,          // validateOutput
  undefined,          // messageContext
  undefined,          // generateGif
  undefined,          // availableFilePaths
  undefined,          // includeAttributes
  undefined           // maxActionsPerStep
  // Using default 'auto' tool calling method
);


// Main function to run the agent
async function main() {
  try {
    await agent.run();
    
    // Add the "press enter to exit" functionality to match Python implementation
    // In Python: input('Press Enter to exit')
    console.log('Press Enter to exit');
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
