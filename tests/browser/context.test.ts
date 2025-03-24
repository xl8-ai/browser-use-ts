/**
 * Tests for browser context functionality
 */
import { Browser, BrowserConfig } from '../../src/browser/browser';
import { BrowserContext, BrowserContextConfig } from '../../src/browser/context';

describe('Browser Context Tests', () => {
  let browser: Browser;

  beforeEach(async () => {
    browser = new Browser(new BrowserConfig({ 
      headless: true
      // Let Playwright use its default browser installation
    }));
    await browser.initialize();
  });

  afterEach(async () => {
    await browser.close();
  });

  test('should create and close a context', async () => {
    // Create a context
    const context = await browser.newContext();
    
    // Verify the context is created
    expect(context).toBeDefined();
    expect(context).toBeInstanceOf(BrowserContext);
    
    // Close the context
    await context.close();
  });

  test('should create a context with custom config', async () => {
    // Create a context with custom config
    const contextConfig = new BrowserContextConfig({
      userAgent: 'Custom User Agent',
      viewport: { width: 1280, height: 720 }
    });
    
    const context = await browser.newContext(contextConfig);
    
    try {
      // Verify the context is created with custom config
      expect(context).toBeDefined();
      expect(context).toBeInstanceOf(BrowserContext);
      
      // Get the page and verify user agent
      const page = await context.getCurrentPage();
      const userAgent = await page.evaluate(() => navigator.userAgent);
      
      expect(userAgent).toBe('Custom User Agent');
    } finally {
      // Close the context
      await context.close();
    }
  });

  test('should manage cookies in a context', async () => {
    // Create a context
    const context = await browser.newContext();
    
    try {
      // Navigate to a test page
      const page = await context.getCurrentPage();
      await page.goto('https://example.com');
      
      // Set a cookie
      await context.setCookies([{
        name: 'testCookie',
        value: 'testValue',
        domain: 'example.com',
        path: '/'
      }]);
      
      // Get cookies
      const cookies = await context.getCookies();
      
      // Verify the cookie was set
      expect(cookies).toHaveLength(1);
      expect(cookies[0].name).toBe('testCookie');
      expect(cookies[0].value).toBe('testValue');
      
      // Clear cookies
      await context.clearCookies();
      
      // Verify cookies were cleared
      const clearedCookies = await context.getCookies();
      expect(clearedCookies).toHaveLength(0);
    } finally {
      // Close the context
      await context.close();
    }
  });
});
