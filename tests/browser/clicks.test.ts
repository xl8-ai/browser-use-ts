/**
 * Tests for browser clicks and DOM interactions
 */
import { Browser, BrowserConfig } from '../../src/browser/browser';

// Removed unused ElementTreeSerializer class

describe('Browser Clicks Tests', () => {
  let browser: Browser;

  beforeEach(async () => {
    browser = new Browser(new BrowserConfig({ 
      headless: false,
      disableSecurity: true
      // Let Playwright use its default browser installation
    }));
    await browser.initialize();
  });

  afterEach(async () => {
    await browser.close();
  });

  test('should navigate to a page and get DOM state', async () => {
    // Create a new context
    const context = await browser.newContext();
    
    try {
      // Navigate to a test page
      const page = await context.getCurrentPage();
      await page.goto('https://example.com');
      
      // Get the page state
      const state = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title
        };
      });
      
      // Verify the page state
      expect(state.url).toContain('example.com');
      expect(state.title).toBe('Example Domain');
    } finally {
      // Close the context
      await context.close();
    }
  });

  test('should extract clickable elements', async () => {
    // Create a new context
    const context = await browser.newContext();
    
    try {
      // Navigate to a page with clickable elements
      const page = await context.getCurrentPage();
      await page.goto('https://example.com');
      
      // Extract clickable elements
      const clickableElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('a, button, [role="button"], input[type="submit"]');
        return Array.from(elements).map(el => ({
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim() || '',
          href: el instanceof HTMLAnchorElement ? el.href : null
        }));
      });
      
      // Verify we found at least one clickable element (the "More information..." link)
      expect(clickableElements.length).toBeGreaterThan(0);
      expect(clickableElements.some((el: { tag: string; text: string; href: string | null }) => 
        el.tag === 'a' && el.text.includes('More information')
      )).toBe(true);
    } finally {
      // Close the context
      await context.close();
    }
  });
});
