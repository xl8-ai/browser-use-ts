import { chromium } from 'playwright';
import { DOMService } from '../../src/dom/service';
import { countTokens } from '../utils/tokenCounter';

describe('DOM Extraction Tests', () => {
  let browser: any;
  let context: any;
  let page: any;
  let domService: DOMService;

  beforeAll(async () => {
    browser = await chromium.launch({ 
      headless: false 
    });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
    domService = new DOMService(page);
  });

  afterAll(async () => {
    await context.close();
    await browser.close();
  });

  const websites = [
    'https://kayak.com/flights',
    'https://google.com',
    'https://amazon.com',
    'https://github.com'
  ];

  // Helper function to measure execution time
  const timeExecution = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    console.time(name);
    const result = await fn();
    console.timeEnd(name);
    return result;
  };

  test.each(websites)('Test viewport expansion on %s', async (website) => {
    // Navigate to the website
    await page.goto(website);
    await page.waitForTimeout(2000); // Wait for dynamic content

    // Test different viewport expansions
    const expansions = [0, 100, 200, 500, -1];
    const results: Array<{ expansion: number, elementCount: number, tokenCount: number }> = [];

    for (const expansion of expansions) {
      const description = expansion >= 0 
        ? `Expansion ${expansion}px` 
        : `All elements (${expansion} expansion)`;
      
      console.log(`\n${description}:`);
      
      // Get DOM elements with different viewport expansions
      const domState = await timeExecution(
        `get_clickable_elements (${description})`,
        () => domService.getClickableElements(true, -1, expansion)
      );

      const elementCount = Object.keys(domState.selectorMap).length;
      const tokenCount = countTokens(JSON.stringify(domState.rootElement));

      console.log(`Number of elements: ${elementCount}`);
      console.log(`Token count: ${tokenCount}`);

      results.push({ expansion, elementCount, tokenCount });

      // Clear highlights before next test
      await page.evaluate('document.getElementById("playwright-highlight-container")?.remove()');
    }

    // Print comparison summary
    console.log('\nComparison Summary:');
    const initialResult = results[0];
    if (!initialResult) {
      console.log('No results to compare');
      return;
    }
    for (const result of results) {
      const description = result.expansion >= 0 
        ? `Expansion ${result.expansion}px` 
        : 'All elements (-1)';
      
      console.log(
        `${description}: ${result.elementCount} elements (+${
          result.elementCount - initialResult.elementCount
        }), ${result.tokenCount} tokens`
      );
    }
  }, 60000); // Increase timeout to 60 seconds

  test('Test focus vs all elements', async () => {
    const testWebsite = 'https://github.com';
    
    await page.goto(testWebsite);
    await page.waitForTimeout(2000);

    console.log(`\nTesting ${testWebsite}`);

    // First get all elements
    console.log('\nGetting all elements:');
    const allElementsState = await timeExecution(
      'get_all_elements',
      () => domService.getClickableElements(true, -1, 100)
    );

    const totalElements = Object.keys(allElementsState.selectorMap).length;
    console.log(`Total number of elements: ${totalElements}`);

    // Clear highlights
    await page.evaluate('document.getElementById("playwright-highlight-container")?.remove()');

    // Now test with focus on specific elements
    for (let i = 0; i < Math.min(5, totalElements); i++) {
      console.log(`\nFocusing on element ${i}:`);
      const focusedState = await timeExecution(
        `focus_element_${i}`,
        () => domService.getClickableElements(true, i, 100)
      );

      const focusedElements = Object.keys(focusedState.selectorMap).length;
      console.log(`Number of focused elements: ${focusedElements}`);

      // Clear highlights before next test
      await page.evaluate('document.getElementById("playwright-highlight-container")?.remove()');
    }
  }, 60000);
});
