/**
 * Tests for screenshot functionality
 */
import { Browser, BrowserConfig } from '../../src/browser/browser';

describe('Browser Screenshot Tests', () => {
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

  test('should take a screenshot', async () => {
    // Create a context and navigate to a test page
    const context = await browser.newContext();
    const page = await context.getCurrentPage();
    await page.goto('https://example.com');

    // Take a screenshot
    const screenshotBuffer = await browser.takeScreenshot('screenshot.png', context);

    // Verify screenshot is not empty
    expect(screenshotBuffer).toBeDefined();
    expect(screenshotBuffer.length).toBeGreaterThan(0);
  });
});
